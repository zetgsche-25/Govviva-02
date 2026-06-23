from datetime import datetime
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    cpf = db.Column(db.String(14), nullable=True) # CPF format: '123.456.789-00'
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='CITIZEN') # CITIZEN, ADMIN
    org_id = db.Column(db.String(50), nullable=True, index=True)
    bairro = db.Column(db.String(100), nullable=True) # MARICÁ NEIGHBORHOOD
    
    # Arquitetura Compatível para Integração Futura GOV.BR
    govbr_sub = db.Column(db.String(100), nullable=True, unique=True, index=True)
    govbr_level = db.Column(db.String(20), nullable=True) # BRONZE, SILVER, GOLD
    govbr_authenticated = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Consentimentos LGPD obrigatórios e opcionais
    lgpd_terms_accepted = db.Column(db.Boolean, default=False)
    lgpd_privacy_accepted = db.Column(db.Boolean, default=False)
    lgpd_marketing_consented = db.Column(db.Boolean, default=False)
    lgpd_treatment_consented = db.Column(db.Boolean, default=False)
    lgpd_accepted_at = db.Column(db.DateTime, nullable=True)

    # Password Recovery Module Fields
    reset_token = db.Column(db.String(100), nullable=True, index=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "cpf": self.cpf,
            "role": self.role,
            "org_id": self.org_id,
            "bairro": self.bairro,
            "govbr_sub": self.govbr_sub,
            "govbr_level": self.govbr_level,
            "govbr_authenticated": self.govbr_authenticated,
            "lgpd_terms_accepted": self.lgpd_terms_accepted,
            "lgpd_privacy_accepted": self.lgpd_privacy_accepted,
            "lgpd_marketing_consented": self.lgpd_marketing_consented,
            "lgpd_treatment_consented": self.lgpd_treatment_consented,
            "lgpd_accepted_at": self.lgpd_accepted_at.isoformat() if self.lgpd_accepted_at else None
        }

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date_start = db.Column(db.DateTime, nullable=False, index=True)
    location = db.Column(db.String(200), nullable=False)
    total_slots = db.Column(db.Integer, nullable=False)
    available_slots = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='ACTIVE', index=True) # ACTIVE, CONCLUDED, CANCELLED
    workload = db.Column(db.Integer, default=4) # Carga horária (hours)
    org_responsible = db.Column(db.String(150), default='Secretaria Municipal do Governo')
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    org_id = db.Column(db.String(50), index=True)
    org_name = db.Column(db.String(100))
    gestor_responsavel = db.Column(db.String(150), default='Gestor Geral')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date_start": self.date_start.isoformat(),
            "location": self.location,
            "total_slots": self.total_slots,
            "available_slots": self.available_slots,
            "category": self.category,
            "status": self.status,
            "workload": self.workload,
            "org_responsible": self.org_responsible,
            "org_id": self.org_id,
            "org_name": self.org_name,
            "gestor_responsavel": self.gestor_responsavel if hasattr(self, 'gestor_responsavel') else 'Gestor Geral'
        }

class Registration(db.Model):
    __tablename__ = 'registrations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False, index=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='CONFIRMED', index=True) # CONFIRMED, CANCELLED
    ticket_code = db.Column(db.String(100), unique=True, nullable=True) # Unique encrypted check-in ticket security hash
    
    __table_args__ = (db.UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "registered_at": self.registered_at.isoformat() if self.registered_at else None,
            "status": self.status,
            "ticket_code": self.ticket_code
        }

class PresenceCheck(db.Model):
    __tablename__ = 'presence_checks'
    id = db.Column(db.Integer, primary_key=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), unique=True, nullable=False, index=True)
    check_in_time = db.Column(db.DateTime, nullable=True)
    check_out_time = db.Column(db.DateTime, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    calculated_duration = db.Column(db.Float, default=0.0) # hours present
    calculated_percentage = db.Column(db.Float, default=0.0) # % of presence
    status = db.Column(db.String(20), default='PENDING', index=True) # PENDING, APPROVED, INCOMPLETE, ABSENT

    def to_dict(self):
        return {
            "id": self.id,
            "registration_id": self.registration_id,
            "check_in_time": self.check_in_time.isoformat() if self.check_in_time else None,
            "check_out_time": self.check_out_time.isoformat() if self.check_out_time else None,
            "location": self.location,
            "calculated_duration": self.calculated_duration,
            "calculated_percentage": self.calculated_percentage,
            "status": self.status
        }

class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registrations.id'), unique=True, nullable=False, index=True)
    code = db.Column(db.String(100), unique=True, nullable=False, index=True) # e.g. GOV-CERT-12345
    hash_verification = db.Column(db.String(256), nullable=False) # municipal cryptosign
    issued_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_publicly_available = db.Column(db.Boolean, default=True, index=True)
    reactivated_at = db.Column(db.DateTime, nullable=True)
    
    # Email delivery logs
    sent_by_email = db.Column(db.Boolean, default=False)
    email_sent_at = db.Column(db.DateTime, nullable=True)
    email_status = db.Column(db.String(50), default='PENDING') # SENT, FAILED, PENDING
    email_attempts = db.Column(db.Integer, default=0)
    email_delivery_confirmed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        from datetime import datetime, timedelta
        issue_dt = self.issued_at or datetime.utcnow()
        exp_dt = issue_dt + timedelta(days=30)
        is_expired = datetime.utcnow() > exp_dt
        status_value = "EXPIRED" if is_expired else "ACTIVE"
        if not self.is_publicly_available:
            status_value = "BLOCKED"
        
        return {
            "id": self.id,
            "registration_id": self.registration_id,
            "code": self.code,
            "certificate_code": self.code,  # exact requirement
            "hash_verification": self.hash_verification,
            "issued_at": issue_dt.isoformat(),
            "issue_date": issue_dt.isoformat(),  # exact requirement
            "expiration_date": exp_dt.isoformat(),  # exact requirement
            "pdf_url": f"/api/certificate/{self.code}/pdf",  # exact requirement
            "status": status_value,  # exact requirement
            "is_publicly_available": self.is_publicly_available,
            "reactivated_at": self.reactivated_at.isoformat() if self.reactivated_at else None,
            "sent_by_email": self.sent_by_email,
            "email_sent_at": self.email_sent_at.isoformat() if self.email_sent_at else None,
            "email_status": self.email_status,
            "email_attempts": self.email_attempts,
            "email_delivery_confirmed": self.email_delivery_confirmed
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False, index=True) # LOGIN, REGISTER, ENROLL, CHECKIN, CHECKOUT, CERTIFICATE_EMISSION, etc
    ip_address = db.Column(db.String(45), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "ip_address": self.ip_address,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class EmailLog(db.Model):
    __tablename__ = 'email_logs'
    id = db.Column(db.Integer, primary_key=True)
    certificate_id = db.Column(db.Integer, db.ForeignKey('certificates.id'), nullable=False, index=True)
    recipient_email = db.Column(db.String(120), nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='PENDING', index=True) # SENT, FAILED, PENDING
    error_message = db.Column(db.Text, nullable=True)
    attempts = db.Column(db.Integer, default=1)
    is_manual = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "certificate_id": self.certificate_id,
            "recipient_email": self.recipient_email,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "status": self.status,
            "error_message": self.error_message,
            "attempts": self.attempts,
            "is_manual": self.is_manual
        }
