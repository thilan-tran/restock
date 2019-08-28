from restock import create_app, db

app = create_app()
ctx = app.app_context()
ctx.push()

print('dropping all...')
db.drop_all()

from restock.models.user import User, LatestRecord, HourlyRecord, WeeklyRecord, MonthlyRecord
from restock.models.stock import StockTransaction, StockAsset, StockAggregate, TrackedStock
# from restock.models.tracking import TrackedStock, TrackedAggregate

print('recreating tables...')
db.create_all()

print('done')
ctx.pop()
