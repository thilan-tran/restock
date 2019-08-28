import json

from restock import db, socketio
from restock.models.stock import StockAggregate
from restock.models.user import User
from restock.utils.stocks import get_stock_price


def update_all_stocks():
    aggregates = StockAggregate.query.all()
    for symbol in aggregates:
        new_price = get_stock_price(symbol.symbol)
        if new_price and new_price != symbol.current_price:
            print(f'Updating {symbol.symbol} from {symbol.current_price} to {new_price}.')
            symbol.update_price(new_price)
            db.session.commit()

            affected_users = list({ asset.user.id for asset in symbol.assets })
            for id in affected_users:
                user = User.query.get(id)
                socketio.emit('update', json.dumps(user.to_dict()), room=id)

            if symbol.tracking:
                socketio.emit('update_tracking', new_price, room=symbol.symbol)

        else:
            print('No change.')

    users = User.query.order_by(User.worth.desc()).limit(10).all()
    serialized_users = [u.to_dict() for u in users]
    socketio.emit('leaderboard', json.dumps(serialized_users))

    return aggregates
