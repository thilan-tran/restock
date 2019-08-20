import datetime
import jwt
from sqlalchemy.ext.declarative import declared_attr
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
        balance_hist = LatestRecords(self.balance, self)
        balance_hist = HourlyRecords(self.balance, self)
        balance_hist = WeeklyRecords(self.balance, self)
        balance_hist = MonthlyRecords(self.balance, self)

    def __repr__(self):
        return "User(username='{username}')".format(**self.to_dict())

    def to_dict(self):
        return {
            'username': self.username,
            'date_registered': '{:%Y-%m-%d}'.format(self.date_registered),
            'balance': self.balance,
            'stocks': self.serialize_relationship('stocks'),
            'records': {
                'latest_records': self.serialize_relationship('latest_records'),
                'hourly_records': self.serialize_relationship('hourly_records'),
                'weekly_records': self.serialize_relationship('weekly_records'),
                'monthly_records': self.serialize_relationship('monthly_records')
            },
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

class BalanceMixin():

    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    @declared_attr
    def user_id(cls):
        return db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)

    def __init__(self, balance, user):
        self.balance = balance
        self.user = user
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return "BalanceHistory(balance='{balance}', timestamp:'{timestamp}')".format(**self.to_dict())

    def to_dict(self):
        return {
            'balance': self.balance,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'id': self.id
        }

class LatestRecords(BalanceMixin, db.Model):

    user = db.relationship(User, backref=db.backref('latest_records'))

class HourlyRecords(BalanceMixin, db.Model):

    user = db.relationship(User, backref=db.backref('hourly_records'))

class WeeklyRecords(BalanceMixin, db.Model):

    user = db.relationship(User, backref=db.backref('weekly_records'))

class MonthlyRecords(BalanceMixin, db.Model):

    user = db.relationship(User, backref=db.backref('monthly_records'))

def update_and_limit_record(Record, new_balance, user):
    new_record = Record(new_balance, user)
    count = Record.query.filter_by(user=user).count()
    print('Record Count:', count)

    while count > Config.MAX_RECORDS:
        to_delete = Record.query.first()
        print('Deleting:', to_delete)
        db.session.delete(to_delete)
        count = Record.query.filter_by(user=user).count()

    return new_record

def update_records(new_balance, user):
    new_record = update_and_limit_record(LatestRecords, new_balance, user)

    last_record = HourlyRecords.query.order_by(HourlyRecords.id.desc()).first()
    time_diff = new_record.timestamp - last_record.timestamp
    if time_diff.seconds > 3600:
        update_and_limit_record(HourlyRecords, new_balance, user)

    if new_record.timestamp.weekday() == 0:
        update_and_limit_record(WeeklyRecords, new_balance, user)

    if new_record.timestamp.day == 1:
        update_and_limit_record(MonthlyRecords, new_balance, user)
