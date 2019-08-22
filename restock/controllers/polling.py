import threading, time
from flask import current_app
from restock import db
from restock.models.stock import StockAggregate
from restock.utils.stocks import get_stock_price

def update_all_stocks():
    ctx = current_app.app_context()
    ctx.push()
    aggregates = StockAggregate.query.all()

    for symbol in aggregates:
        new_price = get_stock_price(symbol.symbol)
        if new_price and new_price != symbol.current_price:
            print('Updating', symbol.symbol, 'from', symbol.current_price, 'to', new_price)
            symbol.update_price(new_price)
            db.session.commit()
        else:
            print('No change in', symbol.symbol)

    ctx.pop()

def start_polling():
    def update_all():
        while True:
            update_all_stocks()
            time.sleep(10)
    timer = threading.Timer(5, update_all)
    timer.start()
