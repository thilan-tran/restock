import datetime
from sqlalchemy.orm import validates
from restock import db
from restock.models.user import User, BalanceHistory

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
            "StockAggregate(symbol='{symbol}', current_price={current_price}, timestamp='{timestamp}')" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'current_price': self.current_price,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'purchases': [ p.to_dict() for p in self.purchases ],
            'id': self.id
        }

    def update_price(self, new_price):
        self.current_price = new_price
        rel = getattr(self, 'purchases', None)
        if rel:
            for r in rel:
                r.update_price(new_price)


class StockPurchase(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=False, nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    shares = db.Column(db.Integer, nullable=False)
    is_short = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('stocks'))

    aggregate_id = db.Column(db.Integer, db.ForeignKey(StockAggregate.id), nullable=False)
    aggregate = db.relationship(StockAggregate, backref=db.backref('purchases'))

    def __init__(self, symbol, buy_price, shares, user, aggregate, short=False):
        self.symbol = symbol
        self.buy_price = buy_price
        self.current_price = buy_price
        self.shares = shares
        self.is_short = short
        self.user = user
        self.aggregate = aggregate
        self.timestamp = datetime.datetime.now()

    def __repr__(self):
        return \
                "StockPurchase(symbol='{symbol}', buy_price={buy_price}, current_price={current_price}, shares={shares}, short={short}, user='{user}', timestamp='{timestamp}')" \
            .format(**self.to_dict())

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'buy_price': self.buy_price,
            'current_price': self.current_price,
            'shares': self.shares,
            'short': self.is_short,
            'user': self.user.username,
            'timestamp': '{:%Y-%m-%d %H:%M}'.format(self.timestamp),
            'id': self.id
        }

    def update_price(self, new_price):
        change = self.shares * (new_price - self.current_price)
        print(self.symbol, 'purchase changed by', change)

        if change:
            self.current_price = new_price
            self.user.balance += change
            balance_hist = BalanceHistory(self.user.balance, self.user)

    @validates('shares')
    def validate_num_shares(self, key, shares):
        assert int(shares) == shares, 'Invalid shares value.'
        return shares

    @validates('user')
    def validate_user(self, key, user):
        transaction = self.buy_price * self.shares
        print('Transacting', transaction, 'from', user.balance)
        assert user.balance >= 0, 'Invalid funds.'

        return user
