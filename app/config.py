import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'govviva-secret-key-32bit')
    # Use path absolute for SQLite
    basedir = os.path.abspath(os.path.dirname(__file__))
    
    # Render and other providers often issue a 'postgres://' connection string,
    # but SQLAlchemy has deprecated the name - we must translate it to 'postgresql://'
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
        
    SQLALCHEMY_DATABASE_URI = db_url or 'sqlite:///' + os.path.join(os.path.dirname(basedir), 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Environment variables asked: JWT_SECRET_KEY, FLASK_ENV
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or os.environ.get('JWT_SECRET') or 'govviva_secret_key_2026'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
