from flask import Blueprint, jsonify, request

from restock import db
from restock.models.stock import StockAggregate, TrackedStock
from restock.utils.stocks import fmp_stocks_overview, av_stocks_by_symbol, get_symbol
from restock.utils.errors import ErrorResponse

stocks = Blueprint('stocks', __name__)


@stocks.route('/overview', methods=['GET'])
def get_stocks_overview():
    overview_data = fmp_stocks_overview()
    stocks = overview_data['most_active']
    stocks.extend(overview_data['most_gained'])
    stocks.extend(overview_data['most_lost'])

    return jsonify(stocks), 200

    # tracking = []

    # for stock in stocks:
    #     symbol = stock['ticker'].lower()

    #     tracked = TrackedStock.query.filter_by(symbol=symbol, user=None).first()
    #     if not tracked:
    #         aggr = StockAggregate.query.filter_by(symbol=symbol).first()
    #         if not aggr:
    #             aggr = StockAggregate(symbol=symbol, company=stock['companyName'],
    #                                   price=stock['price'], prev_price=stock['price']-stock['changes'])
    #             db.session.add(aggr)
    #         tracked = TrackedStock(aggregate=aggr, user=None)
    #         db.session.add(tracked)
    #     tracking.append(tracked.to_dict())

    # db.session.commit()
    # return jsonify(tracking), 200


@stocks.route('/<string:query>', methods=['GET'])
def get_stocks_by_query(query):
    type = request.args.get('type')
    if type == 'search':
        symbol = get_symbol(query)
    else:
        symbol = query

    symbol_data = av_stocks_by_symbol(symbol)
    if symbol_data:
        return jsonify(symbol_data), 200
    return ErrorResponse('Not Found', 'No such stock with symbol {}.'.format(symbol)).to_json(), 404
