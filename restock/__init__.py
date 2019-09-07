import time
import json
from flask import Flask, render_template
from flask_bcrypt import Bcrypt
from flask_cors  import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room, leave_room

from restock.config import Config

bcrypt = Bcrypt()
db = SQLAlchemy()
socketio = SocketIO()
cors = CORS()


@socketio.on('connect')
def on_connect():
    emit('message', 'connection succesful')


@socketio.on('subscribe')
def on_subscribe(user_id):
    emit('message', 'subscribing to user ' + str(user_id))
    join_room(user_id)


@socketio.on('unsubscribe')
def on_unsubscribe(user_id):
    emit('message', 'unsubscribing from user ' + str(user_id))
    leave_room(user_id)


@socketio.on('track')
def on_subscribe(symbol):
    emit('message', 'subscribing to symbol ' + symbol)
    join_room(symbol)


@socketio.on('untrack')
def on_unsubscribe(symbol):
    emit('message', 'unsubscribing from symbol ' + symbol)
    leave_room(symbol)


def create_app(config=Config):
    app = Flask(__name__, static_folder="../build/static", template_folder="../build")
    app.config.from_object(config)

    bcrypt.init_app(app)
    try:
        db.init_app(app)
        print('Successfully connected to database.')
    except:
        print('Failed to connect to database.')
    socketio.init_app(app, cors_allowed_origins='*')
    cors.init_app(app)

    from restock.controllers.users import users
    from restock.controllers.auth import auth
    from restock.controllers.stocks import stocks
    from restock.controllers.transactions import transactions
    from restock.controllers.tracking import tracking
    from restock.controllers.error_handlers import errors

    app.register_blueprint(users, url_prefix='/api/users')
    app.register_blueprint(auth, url_prefix='/api/users')
    app.register_blueprint(transactions, url_prefix='/api/transactions')
    app.register_blueprint(stocks, url_prefix='/api/stocks')
    app.register_blueprint(tracking, url_prefix='/api/tracking')
    app.register_blueprint(errors)

    @app.route("/")
    @app.route("/<path:path>")
    def react_app():
        return render_template('index.html')

    return app
