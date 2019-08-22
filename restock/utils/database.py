import json
from restock import db, socketio
from restock.models.stock import StockAggregate
from restock.utils.stocks import get_stock_price

def update_all_stocks():
    aggregates = StockAggregate.query.all()

    for symbol in aggregates:
        new_price = get_stock_price(symbol.symbol)
        if new_price and new_price != symbol.current_price:
            print(f'Updating {symbol.symbol} from {symbol.current_price} to {new_price}.')
            update = {
                'symbol': symbol.symbol,
                'new_price': new_price,
                'affected_users': [ p.user.id for p in symbol.purchases ]
            }
            socketio.emit('message', json.dumps(update))
            symbol.update_price(new_price)
            db.session.commit()
        else:
            print('No change.')
            socketio.emit('message', json.dumps({}))

    return aggregates

def update_by_id(id):
    transaction = StockPurchase.query.get(id)

    if transaction:
        new_price = get_stock_price(transaction.symbol)
        if new_price:
            aggr = StockAggregate.query.filter_by(symbol=transaction.symbol).first()
            print(f'Updating {transaction.symbol} from {transaction.current_price} to {new_price}')
            aggr.update_price(new_price)
            db.session.commit()
            return transaction

    return None
