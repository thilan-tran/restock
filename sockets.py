import json
from socketIO_client_nexus import SocketIO, BaseNamespace

IEX_URL = 'https://ws-api.iextrading.com'
IEX_NAMESPACE = '/1.0/tops'

def init_websocket_client(subscriptions, url=IEX_URL, namespace=IEX_NAMESPACE,
                          handle_connect=print, handle_message=print):

    class Namespace(BaseNamespace):

        def on_connect(self, *data):
            handle_connect(data)

        # def on_reconnect(self):
        #     print('reconnected')

        def on_message(self, data):
            loaded = json.loads(data)
            handle_message(data)

    sio = SocketIO(url)
    tops = sio.define(Namespace, namespace)
    tops.emit('subscribe', subscriptions)
    sio.wait()

if __name__ == '__main__':
    init_websocket_client(subscriptions='aapl')
