import json
from socketIO_client_nexus import SocketIO as socketio_client, BaseNamespace

IEX_URL = 'https://ws-api.iextrading.com'
IEX_NAMESPACE = '/1.0/tops'

def init_websocket_client(subscriptions, url=IEX_URL, namespace_url=IEX_NAMESPACE, handle_message=print,
                          handle_connect=print, handle_reconnect=print, handle_disconnect=print):

    class Namespace(BaseNamespace):

        def on_connect(self, *data):
            handle_connect(data)

        def on_reconnect(self, *data):
            handle_reconnect(data)

        def on_disconnect(self, *data):
            handle_disconnect(data)

        def on_message(self, data):
            loaded = json.loads(data)
            handle_message(loaded)

    print('starting websocket client')
    sio = socketio_client(url)
    tops = sio.define(Namespace, namespace_url)
    tops.emit('subscribe', subscriptions)
    sio.wait()

if __name__ == '__main__':
    init_websocket_client(subscriptions='aapl')
