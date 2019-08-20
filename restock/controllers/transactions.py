from flask import Blueprint, jsonify, request
from restock import db
from restock.models.user import User
from restock.models.stock import StockPurchase, StockAggregate
from restock.utils.utils import get_stock_price, ErrorResponse

transactions = Blueprint('transactions', __name__)

@transactions.route('/tracking', methods=['GET'])
def get_tracked_stocks():
    aggr = StockAggregate.query.all()
    serialized_aggr = [a.to_dict() for a in aggr]

    return jsonify(serialized_aggr), 200


@transactions.route('/', methods=['POST'])
def create_new_transaction():
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return ErrorResponse('Authentication', 'Bearer token malformatted.').to_json(), 401
    else:
        token = ''

    if token:
        id = User.decode_auth_token(token)
        user = User.query.get(id)
        body = request.json

        symbol = body['symbol']
        buy_price = get_stock_price(symbol)
        if buy_price:
            aggr = StockAggregate.query.filter_by(symbol=symbol).first()
            if not aggr:
                aggr = StockAggregate(symbol, buy_price)

            purchase = StockPurchase(symbol=symbol, shares=body['shares'], short=body['short'],
                                     buy_price=buy_price, user=user, aggregate=aggr)
            db.session.commit()

            return jsonify(purchase.to_dict()), 200

        return ErrorResponse('Not Found', 'No such stock with symbol {}.'.format(body['symbol'])).to_json(), 404

    return ErrorResponse('Authentication', 'Provide an authentication token.').to_json(), 401

@transactions.route('/<int:id>', methods=['GET'])
def get_transaction_by_id(id):
    transaction = StockPurchase.query.get(id)

    if transaction:
        new_price = get_stock_price(transaction.symbol)
        if new_price:
            aggr = StockAggregate.query.filter_by(symbol=transaction.symbol).first()

            aggr.update_price(new_price)
            db.session.commit()

            return jsonify(transaction.to_dict()), 200

    return ErrorResponse('Not Found',
                         'No transaction with ID {} exists.'.format(id)).to_json(), 404
