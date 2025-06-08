import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change_me_in_production')
    # Use SQLite for development if no PostgreSQL URL is provided
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///kubanurse.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
