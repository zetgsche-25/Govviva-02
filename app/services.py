from .models import db, User, Event, Registration
from datetime import datetime

class UserService:
    @staticmethod
    def create_user(name, email, password, role='CITIZEN', org_id=None, cpf=None, lgpd_terms_accepted=False, lgpd_privacy_accepted=False, lgpd_marketing_consented=False, lgpd_treatment_consented=False, bairro=None):
        if User.query.filter_by(email=email).first():
            return None, "E-mail já cadastrado."
        
        user = User(
            name=name, 
            email=email, 
            role=role, 
            org_id=org_id, 
            cpf=cpf,
            bairro=bairro,
            lgpd_terms_accepted=lgpd_terms_accepted,
            lgpd_privacy_accepted=lgpd_privacy_accepted,
            lgpd_marketing_consented=lgpd_marketing_consented,
            lgpd_treatment_consented=lgpd_treatment_consented,
            lgpd_accepted_at=datetime.utcnow() if lgpd_terms_accepted else None
        )
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
            org_name=data.get('org_name', 'Governo Municipal'),
            gestor_responsavel=data.get('gestor_responsavel', 'Gestor Municipal')
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
            import uuid
            import hashlib
            import base64
            
            ticket_uuid = str(uuid.uuid4())
            ticket = f"GOV-TKT-{uuid.uuid4().hex[:12].upper()}"
            while Registration.query.filter_by(ticket_code=ticket).first():
                ticket = f"GOV-TKT-{uuid.uuid4().hex[:12].upper()}"

            # Calculate SHA-256 security hash and encrypted QR Code
            sec_hash = hashlib.sha256(f"{user_id}-{event_id}-{ticket_uuid}-govviva-secure-salt".encode('utf-8')).hexdigest()
            qr_raw = f"GOVVIVA-SECURE-V1|{user_id}|{event_id}|{ticket_uuid}|{sec_hash}"
            qrcode_enc = base64.b64encode(qr_raw.encode('utf-8')).decode('utf-8')

            reg = Registration(
                user_id=user_id, 
                event_id=event_id, 
                ticket_code=ticket,
                ticket_uuid=ticket_uuid,
                security_hash=sec_hash,
                qrcode_encrypted=qrcode_enc
            )
            event.available_slots -= 1
            db.session.add(reg)
            db.session.commit()
            return reg, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
