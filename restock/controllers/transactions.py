import time
from flask import Blueprint, jsonify, request
from sqlalchemy import func
from restock import db, socketio
from restock.models.user import User
from restock.models.stock import StockPurchase, StockAggregate
from restock.utils.stocks import get_stock_price
from restock.utils.database import update_by_id, update_all_stocks
from restock.utils.errors import ErrorResponse

transactions = Blueprint('transactions', __name__)

@transactions.route('/aggregate', methods=['GET'])
def update_all_aggregate_stocks():
    # aggregates = update_all_stocks()
    aggregates = StockAggregate.query.all()
    serialized_aggregates = [a.to_dict() for a in aggregates]
    return jsonify(serialized_aggregates), 200

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
    # transaction = update_by_id(id)
    transaction = StockPurchase.query.get(id)

    if transaction:
        return jsonify(transaction.to_dict()), 200

    return ErrorResponse('Not Found',
                         'No transaction with ID {} exists.'.format(id)).to_json(), 404

@transactions.route('/<int:id>', methods=['DELETE'])
def delete_transaction_by_id(id):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return ErrorResponse('Authentication', 'Bearer token malformatted.').to_json(), 401
    else:
        token = ''

    if token:
        user_id = User.decode_auth_token(token)
        # transaction = update_by_id(id)
        transaction = StockPurchase.query.get(id)

        if transaction:
            if transaction.user.id == user_id:
                db.session.delete(transaction)
                aggregate = StockAggregate.query.filter_by(symbol=transaction.symbol).first()
                if len(aggregate.purchases) == 0:
                    print('Clearing aggregate', aggregate.symbol)
                    db.session.delete(aggregate)
                db.session.commit()
                return jsonify({}), 204

            return ErrorResponse('Authentication',
                                 'Not authenticated to delete other purchases.').to_json(), 401

        return ErrorResponse('Not Found',
                             'No transaction with ID {} exists.'.format(id)).to_json(), 404

    return ErrorResponse('Authentication', 'Provide an authentication token.').to_json(), 401
