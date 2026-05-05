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
        db.create_all()
        seed_db()

    return app

def seed_db():
    from .models import User, Event
    from datetime import datetime

    if User.query.filter_by(email='admin@marica.rj.gov.br').first() is None:
        admin = User(
            name='Gestor Administrativo',
            email='admin@marica.rj.gov.br',
            role='ADMIN',
            org_id='SEC_GOVERNO'
        )
        admin.set_password('admin123')
        db.session.add(admin)

    if Event.query.count() == 0:
        events = [
            Event(
                title='II Conferência Municipal de Políticas Culturais',
                description='Evento oficial destinado ao debate e formulação das diretrizes culturais para o próximo biênio. Participação fundamental para a validação das propostas de fomento artístico.',
                date_start=datetime.fromisoformat('2026-06-15T14:00:00+00:00'),
                location='Cine Teatro Henfil, Centro - Maricá/RJ',
                total_slots=200,
                available_slots=195,
                category='Cultura',
                org_id='SEC_CULTURA',
                org_name='Secretaria Municipal de Cultura'
            ),
            Event(
                title='Workshop de Modernização Administrativa',
                description='Programa de capacitação focado na implementação de processos digitais e atendimento ao cidadão conforme as normas de transparência pública.',
                date_start=datetime.fromisoformat('2026-06-20T09:00:00+00:00'),
                location='SIM Centro, Maricá/RJ',
                total_slots=50,
                available_slots=42,
                category='Capacitação',
                org_id='SEC_INOVACAO',
                org_name='Secretaria de Inovação e Tecnologia'
            ),
            Event(
                title='Fórum Governamental de Transparência',
                description='Sessão solene de apresentação do novo portal de transparência municipal e mecanismos de auditoria cidadã.',
                date_start=datetime.fromisoformat('2026-07-05T18:30:00+00:00'),
                location='Auditório da Prefeitura de Maricá',
                total_slots=100,
                available_slots=100,
                category='Gestão Pública',
                org_id='SEC_GOVERNO',
                org_name='Secretaria Municipal de Governo'
            )
        ]
        db.session.bulk_save_objects(events)
    
    db.session.commit()
