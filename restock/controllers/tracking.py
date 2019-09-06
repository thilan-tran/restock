import json
from flask import Blueprint, jsonify, request

from restock import db, socketio
from restock.models.user import User
from restock.models.stock import StockAggregate, TrackedStock
from restock.utils.errors import ErrorResponse
from restock.utils.stocks import get_stock_detail, get_company

tracking = Blueprint('tracking', __name__)

@tracking.route('/', methods=['GET'])
def get_all_tracked():
    aggr = TrackedStock.query.all()
    serialized_aggr = [ tracking.to_dict() for tracking in aggr ]
    return jsonify(serialized_aggr), 200

@tracking.route('/', methods=['POST'])
def add_new_tracking():
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
    else:
        user = None

    symbol = request.json['symbol']
    prev_price = request.json.get('prev_price')

    aggr = StockAggregate.query.filter_by(symbol=symbol).first()
    if not aggr:
        ask_size, buy_price = get_stock_detail(symbol)
        if buy_price:
            company = get_company(symbol)
            aggr = StockAggregate(symbol, company, ask_size, buy_price, prev_price)
            db.session.add(aggr)
        else:
            return ErrorResponse('Not Found', 'No such stock with symbol {}.'.format(symbol)).to_json(), 404

    tracked = TrackedStock.query.filter_by(symbol=symbol, user=user).first()
    if not tracked or not user:
        tracked = TrackedStock(aggregate=aggr, user=user)
        db.session.add(tracked)
    else:
        return ErrorResponse('Tracking', 'Already tracking symbol {}'.format(symbol)).to_json(), 401

    db.session.commit()
    if user:
        socketio.emit('update', json.dumps({
            'type': 'tracking',
            'update': tracked.to_dict(),
            'user' : user.to_dict()
        }), room=user.id)
    return jsonify(tracked.to_dict()), 200

@tracking.route('/', methods=['DELETE'])
def delete_tracking():
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
    else:
        user = None

    symbol = request.json['symbol']
    tracked = TrackedStock.query.filter_by(symbol=symbol, user=user).first()
    if tracked:
        db.session.delete(tracked)
        aggr = StockAggregate.query.filter_by(symbol=symbol).first()
        if not aggr.tracking and not aggr.assets:
            db.session.delete(aggr)
        db.session.commit()
        if user:
            socketio.emit('update', json.dumps({
                'type': 'untracking',
                'update': { 'symbol': symbol, 'user': user.username },
                'user' : user.to_dict()
            }), room=user.id)
        return jsonify({}), 204

    return ErrorResponse('Not Found',
                         'No tracking with symbol {} exists.'.format(symbol)).to_json(), 404
