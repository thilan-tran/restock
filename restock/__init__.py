import time
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from restock.config import Config

bcrypt = Bcrypt()
db = SQLAlchemy()
socketio = SocketIO()

@socketio.on('connect')
def on_test():
    emit('message', 'you are connected')

def create_app(config=Config):
    app = Flask(__name__)
    app.config.from_object(config)

    bcrypt.init_app(app)
    try:
        db.init_app(app)
        print('Successfully connected to database.')
    except:
        print('Failed to connect to database.')
    socketio.init_app(app)

    from restock.controllers.users import users
    from restock.controllers.auth import auth
    from restock.controllers.stocks import stocks
    from restock.controllers.transactions import transactions
    from restock.controllers.error_handlers import errors

    app.register_blueprint(users, url_prefix='/api/users')
    app.register_blueprint(auth, url_prefix='/api/users')
    app.register_blueprint(transactions, url_prefix='/api/transactions')
    app.register_blueprint(stocks, url_prefix='/api/stocks')
    app.register_blueprint(errors)

    return app
