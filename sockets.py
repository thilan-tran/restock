import json
from socketIO_client_nexus import SocketIO, BaseNamespace

WS_url='https://ws-api.iextrading.com'

class Namespace(BaseNamespace):

    def on_connect(self):
        print('connected')

    def on_reconnect(self):
        print('reconnected')

    def on_message(self, data):
        loaded = json.loads(data)
        print(loaded['symbol'], loaded['askPrice'])

sio = SocketIO(WS_url)
tops = sio.define(Namespace, '/1.0/tops')
tops.emit('subscribe', 'ge')
sio.wait()
