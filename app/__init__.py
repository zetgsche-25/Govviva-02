from flask import Flask
from .config import Config
from .extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.events import event_bp
    from .routes.registrations import registration_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(event_bp, url_prefix='/api/events')
    app.register_blueprint(registration_bp, url_prefix='/api/registrations')

    with app.app_context():
        db.create_all() # Cria o banco SQLite se não existir

    return app
