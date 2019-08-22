from flask import current_app
from restock import socketio
from restock.models.stock import StockAggregate
from restock.utils.sockets import init_websocket_client

def handle_stock_data(data):
    aggregates = StockAggregate.query.all()

    for symbol in aggregates:
        new_price = data['askPrice']
        if new_price and new_price != symbol.current_price:
            print('Updating', symbol.symbol, 'from', symbol.current_price, 'to', new_price)
            symbol.update_price(new_price)
            db.session.commit()
        else:
            print('No change in', symbol.symbol)

@current_app.before_first_request
def start_websocket_client():
    aggregates = StockAggregate.query.all()
    subscriptions = ','.join([ a.symbol for a in aggregates ])
    print('Subscribing to', subscriptions)
    init_websocket_client(subscriptions=subscriptions, handle_message=handle_stock_data)
