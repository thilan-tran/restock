from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    PORT = os.environ.get('PORT')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    API_KEY = os.environ.get('API_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    DEBUG = True
