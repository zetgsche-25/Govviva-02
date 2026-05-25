from .models import db, User, Event, Registration
from datetime import datetime

class UserService:
    @staticmethod
    def create_user(name, email, password, role='CITIZEN', org_id=None):
        if User.query.filter_by(email=email).first():
            return None, "E-mail já cadastrado."
        
        user = User(name=name, email=email, role=role, org_id=org_id)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user, None

class EventService:
    @staticmethod
    def list_active():
        return Event.query.filter_by(status='ACTIVE').order_by(Event.date_start.asc()).all()

    @staticmethod
    def create_event(data, creator_id):
        # Transforma string ISO para objeto datetime do Python
        try:
            dt = datetime.fromisoformat(data['date_start'].replace('Z', '+00:00'))
        except:
            dt = datetime.utcnow()

        event = Event(
            title=data['title'],
            description=data.get('description', ''),
            date_start=dt,
            location=data['location'],
            total_slots=int(data['total_slots']),
            available_slots=int(data['total_slots']),
            category=data['category'],
            creator_id=creator_id,
            org_id=data.get('org_id', 'GOV_ROOT'),
            org_name=data.get('org_name', 'Governo Municipal')
        )
        db.session.add(event)
        db.session.commit()
        return event

class RegistrationService:
    @staticmethod
    def enroll(user_id, event_id):
        event = Event.query.get(event_id)
        if not event or event.status != 'ACTIVE':
            return None, "Evento não encontrado ou inativo."
        
        if event.available_slots <= 0:
            return None, "Vagas esgotadas."

        if Registration.query.filter_by(user_id=user_id, event_id=event_id).first():
            return None, "Você já está inscrito neste evento."

        try:
            reg = Registration(user_id=user_id, event_id=event_id)
            event.available_slots -= 1
            db.session.add(reg)
            db.session.commit()
            return reg, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
