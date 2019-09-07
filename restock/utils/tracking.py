from restock import db
from restock.models.stock import StockAggregate, TrackedStock
from restock.utils.stock import get_stock_detail, get_company

def track_stock(symbol, user=None):
    aggr = StockAggregate.query.filter_by(symbol=symbol).first()
    if not aggr:
        ask_size, buy_price = get_stock_detail(symbol)
        if buy_price:
            company = get_company(symbol)
            aggr = StockAggregate(symbol, company, ask_size, buy_price)
        else:
            return 'No such stock with symbol {}'.format(symbol)

    tracked = TrackedStock.query.filter_by(symbol=symbol, user=user).first()
    if not tracked:
        tracked = TrackedStock(aggregate=aggr, user=user)
    else:
        return 'Already tracking symbol {}'.format(symbol)

    db.session.commit()
    return tracked
