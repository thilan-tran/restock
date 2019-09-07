from dotenv import load_dotenv
import os

load_dotenv()

class BaseConfig:
    PORT = os.environ.get('PORT')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    API_KEY = os.environ.get('API_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    MAX_RECORDS = 50

class ProductionConfig(BaseConfig):
    DEBUG = False
    MAX_RECORDS = 500

configs = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}

Config = configs[os.environ.get('CONFIG')]
