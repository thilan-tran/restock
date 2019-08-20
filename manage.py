from restock import create_app, db

app = create_app()
ctx = app.app_context()
ctx.push()

print('dropping all...')
db.drop_all()

from restock.models.user import User, LatestRecords, HourlyRecords, WeeklyRecords, MonthlyRecords
from restock.models.stock import StockPurchase, StockAggregate

print('recreating tables...')
db.create_all()

print('done')
ctx.pop()
