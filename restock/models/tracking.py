import datetime

from restock import db
from restock.models.user import User


class TrackedAggregate(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)

    def __init__(self, symbol):
        self.symbol = symbol

    def __repr__(self):
        return \
                "TrackedStock(symbol='{symbol}')" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'tracking': [ tracked.to_dict() for tracked in self.tracking ],
            'id': self.id
        }


class TrackedStock(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('tracking'))

    aggregate_id = db.Column(db.Integer, db.ForeignKey(TrackedAggregate.id), nullable=False)
    aggregate = db.relationship(TrackedAggregate, backref=db.backref('tracking'))

    def __init__(self, aggregate, user=None):
        self.symbol = aggregate.symbol
        self.user = user
        self.aggregate = aggregate
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return \
                "TrackedStock(symbol='{symbol}', user='{user}')" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'user': self.user.username if self.user else 'None',
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'id': self.id
        }
