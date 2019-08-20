import requests
from flask import jsonify
from restock.config import Config

class ErrorResponse:

    def __init__(self, type, msg=''):
        self.type = type
        self.msg = msg

    def to_dict(self):
        return { 'error': { 'type': self.type, 'message': self.msg } }

    def to_json(self):
        return jsonify(self.to_dict())

fmp_url = 'https://financialmodelingprep.com/api/v3/stock/'
iex_url = 'https://api.iextrading.com/1.0/tops?symbols='
av_url = \
    'https://www.alphavantage.co/query?function={{function}}&symbol={{symbol}}&apikey={apikey}' \
    .format(apikey=Config.API_KEY)

def price_to_float(d):
    d['price'] = float(d['price'])
    return d

def fmp_stocks_overview():
    actives = requests.get(fmp_url + 'actives').json()
    gainers = requests.get(fmp_url + 'gainers').json()
    losers = requests.get(fmp_url + 'losers').json()

    return {
        'most_active': [ price_to_float(a) for a in actives['mostActiveStock'] ],
        'most_gained': [ price_to_float(g) for g in gainers['mostGainerStock'] ],
        'most_lost': [ price_to_float(l) for l in losers['mostLoserStock'] ]
    }

def get_stock_price(symbol):
    iex = iex_stocks_by_symbol(symbol)
    if iex and iex['askPrice'] != 0:
        return iex['askPrice']

    av = av_stocks_by_symbol(symbol)
    if av:
        return av['quarter_hour_data'][0]['close']

    return None

def iex_stocks_by_symbol(symbol):
    data = requests.get(iex_url + symbol).json()
    if data:
        return data[0]['lastSalePrice']
    return None

def av_stocks_by_symbol(symbol):
    intraday_params = {
        'function': 'TIME_SERIES_INTRADAY',
        'symbol': symbol,
        'interval': '15min'
    }
    daily_params = {
        'function': 'TIME_SERIES_DAILY',
        'symbol': symbol
    }

    intraday = requests.get(av_url.format(function='TIME_SERIES_INTRADAY', symbol=symbol)
                                           + '&interval=15min').json()
    days = requests.get(av_url.format(**daily_params)).json()

    if intraday.get('Meta Data') and intraday.get('Time Series (15min)') and days.get('Time Series (Daily)'):
        info = {
            'symbol': symbol,
            'last_updated': intraday['Meta Data']['3. Last Refreshed'],
            'timezone': intraday['Meta Data']['6. Time Zone']
        }
        quarter_hour_data = [{ 'time': time, 'open': float(data['1. open']), 'close': float(data['4. close'])}
                        for time, data in intraday['Time Series (15min)'].items()]
        day_data = [{ 'day': day, 'open': float(data['1. open']), 'close': float(data['4. close'])}
                for day, data in days['Time Series (Daily)'].items()]

        return {
            'info': info,
            'quarter_hour_data': quarter_hour_data,
            'day_data': day_data
        }

    return None
