import requests
import json
import os

from restock.config import Config

fmp_url = 'https://financialmodelingprep.com/api/v3/stock/'
iex_url = 'https://api.iextrading.com/1.0/tops?symbols='
iex_last_url = 'https://api.iextrading.com/1.0/tops/last?symbols='
iex_symbols = 'https://api.iextrading.com/1.0/ref-data/symbols'
av_url = \
    'https://www.alphavantage.co/query?function={{function}}&symbol={{symbol}}&apikey={apikey}' \
    .format(apikey=Config.API_KEY)


def get_company(symbol):
    folder = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(folder, 'symbol_data.json')

    with open(path, 'r') as f:
        ref_data = json.load(f)
        for data in ref_data:
            if data['symbol'].lower() == symbol.lower():
                return data['name']
    return None


def search_stocks(search):
    results = []
    symbols = []
    folder = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(folder, 'symbol_data.json')

    with open(path, 'r') as f:
        ref_data = json.load(f)
        for data in ref_data:
            if search.lower() in data['symbol'].lower():
                symbols.append((data['symbol'], data['name']))
            elif search.lower() in data['name'].lower():
                results.append((data['symbol'], data['name']))

    symbols.extend(results)
    return symbols


def get_symbol(search):
    folder = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(folder, 'symbol_data.json')

    with open(path, 'r') as f:
        ref_data = json.load(f)
        for data in ref_data:
            if search.lower() in data['name'].lower():
                return data['symbol'].lower()
    return None


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


def get_stock_detail(symbol):
    iex = iex_stocks_by_symbol(symbol)
    if iex:
        if iex.get('lastSalePrice'):
            return iex.get('lastSaleSize'), iex.get('lastSalePrice')
        if iex.get('price'):
            return iex.get('size'), iex.get('price')

    # av = av_stocks_by_symbol(symbol)
    # if av:
    #     return av['quarter_hour_data'][0]['close']

    print('Nothing for', symbol)
    return None, None


def iex_stocks_by_symbol(symbol):
    tops = requests.get(iex_url + symbol).json()
    if tops and tops[0]['lastSalePrice']:
        return tops[0]

    last = requests.get(iex_last_url+symbol).json()
    if last:
        return last[0]

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
