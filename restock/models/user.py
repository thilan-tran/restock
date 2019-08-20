import datetime
import jwt
from restock import db, bcrypt
from restock.config import Config

class User(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    date_registered = db.Column(db.DateTime, nullable=False)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = bcrypt.generate_password_hash(password).decode()
        self.balance = 100000
        self.date_registered = datetime.datetime.now()
        balance_hist = BalanceHistory(self.balance, self)

    def __repr__(self):
        return "User(username='{username}')".format(**self.to_dict())

    def to_dict(self):
        return {
            'username': self.username,
            'date_registered': '{:%Y-%m-%d}'.format(self.date_registered),
            'balance': self.balance,
            'stocks': self.serialize_relationship('stocks'),
            'balance_history': self.serialize_relationship('balance_history'),
            'id': self.id
        }

    def serialize_relationship(self, name):
        rel = getattr(self, name, None)
        if rel:
            return [ r.to_dict() for r in rel ]
        return []

    def encode_auth_token(self):
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
            'iat': datetime.datetime.utcnow(),
            'id': self.id
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

    @staticmethod
    def decode_auth_token(token):
        payload = jwt.decode(token, Config.SECRET_KEY)
        return payload['id']

class BalanceHistory(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('balance_history'))

    def __init__(self, balance, user):
        self.balance = balance
        self.user = user
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return "BalanceHistory(balance='{balance}')".format(**self.to_dict())

    def to_dict(self):
        return {
            'balance': self.balance,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp)
        }
