import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change_me')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost/meddb')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
