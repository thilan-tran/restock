from flask import Blueprint, jsonify
from restock.utils.stocks import fmp_stocks_overview, av_stocks_by_symbol
from restock.utils.errors import ErrorResponse
from restock.config import Config

stocks = Blueprint('stocks', __name__)

@stocks.route('/overview', methods=['GET'])
def get_stocks_overview():
    overview_data = fmp_stocks_overview()
    return jsonify(overview_data), 200

@stocks.route('/<string:symbol>', methods=['GET'])
def get_stocks_by_symbol(symbol):
    symbol_data = av_stocks_by_symbol(symbol)
    if symbol_data:
        return jsonify(symbol_data), 200
    return ErrorResponse('Not Found', 'No such stock with symbol {}.'.format(symbol)).to_json(), 404
