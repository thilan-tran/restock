from restock import create_app
from restock.config import Config

app = create_app()

if __name__ == '__main__':
    app.run(port=Config.PORT, debug=Config.DEBUG)
