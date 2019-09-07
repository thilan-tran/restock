import json
import datetime

from restock import db, socketio
from restock.models.stock import StockAggregate
from restock.models.user import User
from restock.utils.stocks import get_stock_detail


def update_all_stocks():
    aggregates = StockAggregate.query.all()
    prev_users = User.query.order_by(User.value.desc()).limit(100).all()
    prev_user_ids = [u.id for u in prev_users]

    for symbol in aggregates:
        if not symbol.tracking and not symbol.assets:
            db.session.delete(symbol)
            db.session.commit()
            continue

        new_size, new_price = get_stock_detail(symbol.symbol)
        prev_price = symbol.current_price

        for tracked in symbol.tracking:
            if tracked.user == None and (datetime.datetime.now() - tracked.timestamp).seconds >= 60*60:
                db.session.delete(tracked)
                aggr = StockAggregate.query.filter_by(symbol=symbol.symbol).first()
                if not aggr.tracking and not aggr.assets:
                    db.session.delete(aggr)
                db.session.commit()

        if new_price and new_price != prev_price:
            print(f'Updating {symbol.symbol} from {symbol.current_price} to {new_price}.')
            symbol.update_price(new_price)

            if new_size and new_size != symbol.ask_size:
                symbol.update_ask_size(new_size)

            db.session.commit()

            affected_users = list({ asset.user.id for asset in symbol.assets })
            for id in affected_users:
                user = User.query.get(id)
                socketio.emit('update', json.dumps({
                    'type': 'update',
                    'update': None,
                    'user': user.to_dict()
                }), room=id);

            if symbol.tracking:
                socketio.emit('update_tracking', json.dumps({
                    'symbol': symbol.symbol,
                    'price': new_price,
                    'prev_price': prev_price
                }), room=symbol.symbol)

        else:
            print('No change in', symbol.symbol)

    users = User.query.order_by(User.value.desc()).limit(100).all()
    user_ids = [u.id for u in users]
    if set(prev_user_ids) != set(user_ids):
        socketio.emit('leaderboard', json.dumps(user_ids))
    else:
        print('No change in leaderboard')

    return aggregates
