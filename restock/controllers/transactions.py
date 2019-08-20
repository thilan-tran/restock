import time
from flask import Blueprint, jsonify, request
from restock import db
from restock.models.user import User
from restock.models.stock import StockPurchase, StockAggregate
from restock.utils.utils import get_stock_price, ErrorResponse

transactions = Blueprint('transactions', __name__)

def update_all_stocks():
    aggregates = StockAggregate.query.all()

    for symbol in aggregates:
        new_price = get_stock_price(symbol.symbol)
        if new_price and new_price != symbol.current_price:
            print('Updating', symbol.symbol, 'from', symbol.current_price, 'to', new_price)
            symbol.update_price(new_price)
            db.session.commit()

    return aggregates

@transactions.route('/aggregate', methods=['GET'])
def update_all_aggregate_stocks():
    aggregates = update_all_stocks()
    serialized_aggregates = [a.to_dict() for a in aggregates]
    return jsonify(serialized_aggregates), 200

@transactions.route('/poll', methods=['GET'])
def long_polling():
    print('Starting polling')
    while True:
        time.sleep(120)
        update_all_stocks()

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

def update_by_id(id):
    transaction = StockPurchase.query.get(id)

    if transaction:
        new_price = get_stock_price(transaction.symbol)
        if new_price:
            aggr = StockAggregate.query.filter_by(symbol=transaction.symbol).first()

            aggr.update_price(new_price)
            db.session.commit()

            return transaction

    return None

@transactions.route('/<int:id>', methods=['GET'])
def get_transaction_by_id(id):
    transaction = update_by_id(id)

    if transaction:
        return jsonify(transaction.to_dict()), 200

    return ErrorResponse('Not Found',
                         'No transaction with ID {} exists.'.format(id)).to_json(), 404

@transactions.route('/<int:id>', methods=['DELETE'])
def delete_transaction_by_id(id):
    transaction = update_by_id(id)

    if transaction:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({}), 204

    return ErrorResponse('Not Found',
                         'No transaction with ID {} exists.'.format(id)).to_json(), 404
