import threading, time
from restock import create_app, socketio
from restock.config import Config
from restock.utils.database import update_all_stocks

app = create_app()

def update_all_ctx():
    ctx = app.app_context()
    ctx.push()
    socketio.emit('message', 'starting polling')
    while True:
        update_all_stocks()
        time.sleep(60)
    ctx.pop()

@app.before_first_request
def start_polling():
    timer = threading.Timer(5, update_all_ctx)
    timer.start()

if __name__ == '__main__':
    app.run(port=Config.PORT, debug=Config.DEBUG)
