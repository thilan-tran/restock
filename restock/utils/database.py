import json
import datetime

from restock import db, socketio
from restock.models.stock import StockAggregate
from restock.models.user import User
from restock.utils.stocks import get_stock_price


def update_all_stocks():
    aggregates = StockAggregate.query.all()
    for symbol in aggregates:
        new_price = get_stock_price(symbol.symbol)

        for tracked in symbol.tracking:
            if tracked.user == None and (datetime.datetime.now() - tracked.timestamp).seconds >= 60*60:
                db.session.delete(tracked)
                aggr = StockAggregate.query.filter_by(symbol=symbol.symbol).first()
                if not aggr.tracking and not aggr.assets:
                    db.session.delete(aggr)
                db.session.commit()

        if new_price and new_price != symbol.current_price:
            print(f'Updating {symbol.symbol} from {symbol.current_price} to {new_price}.')
            symbol.update_price(new_price)
            db.session.commit()

            affected_users = list({ asset.user.id for asset in symbol.assets })
            for id in affected_users:
                user = User.query.get(id)
                socketio.emit('update', json.dumps(user.to_dict()), room=id)

            if symbol.tracking:
                socketio.emit('update_tracking', json.dumps({ 'symbol': symbol.symbol, 'price': new_price }), room=symbol.symbol)

        else:
            print('No change in', symbol.symbol)

    users = User.query.order_by(User.worth.desc()).limit(100).all()
    user_ids = [u.id for u in users]
    socketio.emit('leaderboard', json.dumps(user_ids))

    return aggregates
