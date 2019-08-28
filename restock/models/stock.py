import datetime
from sqlalchemy.orm import validates

from restock import db
from restock.models.user import User, update_balance_records

class StockAggregate(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __init__(self, symbol, price):
        self.symbol = symbol
        self.current_price = price
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return \
            "StockAggregate(symbol='{symbol}', price={current_price})" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'current_price': self.current_price,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'assets': [ asset.to_dict() for asset in self.assets ],
            'tracking': [ tracked.to_dict() for tracked in self.tracking ],
            'id': self.id
        }

    def update_price(self, new_price):
        self.current_price = new_price
        rel = getattr(self, 'assets', None)
        if rel:
            for r in rel:
                r.update_price(new_price)


class StockAsset(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    init_price = db.Column(db.Float, nullable=False)
    prev_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    shares = db.Column(db.Integer, nullable=False)
    is_short = db.Column(db.Boolean, nullable=False)
    prev_timestamp = db.Column(db.DateTime, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('portfolio'))

    aggregate_id = db.Column(db.Integer, db.ForeignKey(StockAggregate.id), nullable=False)
    aggregate = db.relationship(StockAggregate, backref=db.backref('assets'))

    def __init__(self, user, aggregate, short=False):
        self.symbol = aggregate.symbol
        self.init_price = aggregate.current_price
        self.prev_price = self.init_price
        self.current_price = self.init_price
        self.shares = 0
        self.is_short = short
        self.user = user
        self.aggregate = aggregate
        self.timestamp = datetime.datetime.now()
        self.prev_timestamp = self.timestamp

    def clean_up(self):
        print(self.shares*self.current_price, 'to balance of', self.user.balance)
        self.shares = 0
        update_balance_records(self.user.balance + shares*current_price, self.user)

    def __repr__(self):
        return \
                "StockAsset(symbol='{symbol}', user='{user}', short={short})" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'init_price': self.init_price,
            'prev_price': self.prev_price,
            'current_price': self.current_price,
            'shares': self.shares,
            'short': self.is_short,
            'user': self.user.username,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'id': self.id
        }

    def add_shares(self, num_shares):
        print(num_shares*self.current_price, 'from balance of', self.user.balance)
        self.shares += num_shares
        update_balance_records(self.user.balance - num_shares*self.current_price, self.user)

    def sell_shares(self, num_shares):
        print(num_shares*self.current_price, 'to balance of', self.user.balance)
        self.shares -= num_shares
        update_balance_records(self.user.balance + num_shares*self.current_price, self.user)

    def update_price(self, new_price):
        change = self.shares * (new_price - self.current_price)
        change = -1 * change if self.is_short else change
        print(self.symbol, 'short asset' if self.is_short else 'stock asset', 'changed by', change)

        if change:
            self.current_price = new_price
            update_balance_records(self.user.balance, self.user)

        timestamp = datetime.datetime.now()
        time_diff = timestamp - self.prev_timestamp
        if time_diff.days >= 1:
            self.prev_price = new_price
            self.prev_timestamp = timestamp


class StockTransaction(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    price = db.Column(db.Float, nullable=False)
    shares = db.Column(db.Integer, nullable=False)
    is_short = db.Column(db.Boolean, nullable=False)
    is_purchase = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('transactions'))

    asset_id = db.Column(db.Integer, db.ForeignKey(StockAsset.id), nullable=True)
    asset = db.relationship(StockAsset, backref=db.backref('transactions'))

    def __init__(self, shares, asset, purchase=True):
        self.symbol = asset.symbol
        self.price = asset.current_price
        self.shares = shares
        self.is_short = asset.is_short
        self.is_purchase = purchase
        self.user = asset.user
        self.asset = asset
        self.timestamp = datetime.datetime.now()

        if purchase:
            self.asset.add_shares(shares)
        else:
            self.asset.sell_shares(shares)

    def __repr__(self):
        return \
                "StockTransaction(symbol='{symbol}', shares={shares}, short={short}, purchase={purchase}, user='{user}')" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'price': self.price,
            'shares': self.shares,
            'short': self.is_short,
            'purchase': self.is_purchase,
            'user': self.user.username,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'id': self.id
        }

    @validates('shares')
    def validate_num_shares(self, key, shares):
        assert int(shares) == shares, 'Invalid shares value.'
        assert shares > 0, 'Invalid shares value.'
        return shares

    @validates('user')
    def validate_user(self, key, user):
        if self.is_purchase:
            transaction = self.price * self.shares
            assert user.balance - transaction >= 0, 'Invalid funds.'

        return user

    @validates('asset')
    def validate_asset(self, key, asset):
        if not self.is_purchase:
            assert asset.shares >= self.shares, 'Not enough shares to sell.'

        return asset

class TrackedStock(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('tracking'))

    aggregate_id = db.Column(db.Integer, db.ForeignKey(StockAggregate.id), nullable=False)
    aggregate = db.relationship(StockAggregate, backref=db.backref('tracking'))

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
