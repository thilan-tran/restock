import polling
import time
from restock import socketio
from restock.controllers.transactions import update_all_stocks

def init_polling():
    print('Starting polling...')
    socketio.emit('message', 'started polling')
    while True:
        time.sleep(10)
        # update_all_stocks()
        socketio.emit('message', 'polling')
    # polling.poll(lambda: update_all_stocks() == None, step=300, poll_forever=True)
