import time
import json
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from restock import db, socketio
from restock.models.user import User
from restock.models.stock import StockTransaction, StockAggregate, StockAsset
from restock.utils.stocks import get_stock_detail, get_company
from restock.utils.errors import ErrorResponse

transactions = Blueprint('transactions', __name__)


@transactions.route('/aggregate', methods=['GET'])
def update_all_aggregate_stocks():
    aggregates = StockAggregate.query.all()
    serialized_aggregates = [a.to_dict() for a in aggregates]
    return jsonify(serialized_aggregates), 200


@transactions.route('/', methods=['POST'])
def buy_stock_asset():
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
        symbol, shares, short = body['symbol'], body['shares'], body['short']

        asset = StockAsset.query.filter_by(symbol=symbol, user=user, is_short=short).first()
        if not asset:
            aggr = StockAggregate.query.filter_by(symbol=symbol).first()

            if not aggr:
                ask_size, buy_price = get_stock_detail(symbol)
                if buy_price:
                    company = get_company(symbol)
                    aggr = StockAggregate(symbol, company, ask_size, buy_price)
                else:
                    return ErrorResponse('Not Found', 'No such stock with symbol {}.'.format(symbol)).to_json(), 404

            asset = StockAsset(user=user, aggregate=aggr, short=short)

        purchase = StockTransaction(shares=shares, asset=asset, purchase=True)
        db.session.commit()
        socketio.emit('update', json.dumps(user.to_dict()), room=user.id)
        return jsonify(purchase.to_dict()), 200

    return ErrorResponse('Authentication', 'Provide an authentication token.').to_json(), 401


@transactions.route('/', methods=['DELETE'])
def sell_stock_asset():
    auth_header = request.headers.get('Authorization')
    print(auth_header)
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
        symbol, shares, short = body['symbol'], body['shares'], body['short']

        asset = StockAsset.query.filter_by(symbol=symbol, user=user, is_short=short).first()
        if not asset:
            return ErrorResponse('Not Found',
                                 'No such {} assets to sell of {}.'
                                 .format('short' if short else 'stock', symbol)).to_json(), 404

        transaction = StockTransaction(shares=shares, asset=asset, purchase=False)

        if asset.shares == 0:
            db.session.delete(asset)
        if not asset.aggregate.assets and not asset.aggregate.tracking:
            db.session.delete(asset.aggregate)
        db.session.commit()

        socketio.emit('update', json.dumps(user.to_dict()), room=user.id)
        return jsonify(transaction.to_dict()), 200

    return ErrorResponse('Authentication', 'Provide an authentication token.').to_json(), 401


@transactions.route('/<int:id>', methods=['GET'])
def get_transaction_by_id(id):
    transaction = StockTransaction.query.get(id)
    if transaction:
        return jsonify(transaction.to_dict()), 200
    return ErrorResponse('Not Found',
                         'No transaction with ID {} exists.'.format(id)).to_json(), 404
