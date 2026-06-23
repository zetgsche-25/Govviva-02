from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import EventService
from ..models import db, User, Event, Registration, PresenceCheck, Certificate, AuditLog
from ..email_utils import send_certificate_email
from datetime import datetime
import uuid
import hashlib

event_bp = Blueprint('events', __name__)

def log_audit(user_id, action, description, ip_address=None):
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            description=description,
            ip_address=ip_address or request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"[AUDIT WARNING] Failed to write audit log: {e}")

@event_bp.route('', methods=['GET'])
@event_bp.route('/', methods=['GET'])
def list_events():
    events = EventService.list_active()
    return jsonify([e.to_dict() for e in events])

@event_bp.route('', methods=['POST'])
@event_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403
    
    data = request.get_json()
    event = EventService.create_event(data, user_id)
    return jsonify(event.to_dict()), 201

@event_bp.route('/<int:event_id>/conclude', methods=['POST'])
@jwt_required()
def conclude_event(event_id):
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento não encontrado"}), 404

    # Encerra o evento oficialmente
    event.status = 'CONCLUDED'
    db.session.commit()

    # 1. Verificar participantes aptos.
    # Cidadãos com inscrições CONFIRMED e presença APPROVED
    regs = Registration.query.filter_by(event_id=event.id, status='CONFIRMED').all()
    
    certificates_issued = 0
    emails_sent = 0
    emails_failed = 0
    failures_details = []

    for r in regs:
        presence = PresenceCheck.query.filter_by(registration_id=r.id).first()
        if presence and presence.status == 'APPROVED':
            # 2. Gerar certificado caso ainda não exista
            cert = Certificate.query.filter_by(registration_id=r.id).first()
            if not cert:
                try:
                    code_token = str(uuid.uuid4())[:8].upper()
                    code = f"GOV-CERT-{code_token}"
                    hash_sign = hashlib.sha256(f"{code}-GOVVIVA-SIGN-2026".encode()).hexdigest()[:32].upper()
                    
                    cert = Certificate(
                        registration_id=r.id,
                        code=code,
                        hash_verification=hash_sign,
                        issued_at=datetime.utcnow(),
                        is_publicly_available=True
                    )
                    db.session.add(cert)
                    db.session.commit()
                    certificates_issued += 1

                    # Send notification to the student/user
                    try:
                        from .notifications import create_notification
                        create_notification(
                            user_id=r.user_id,
                            title="Certificado Disponível",
                            message=f"Parabéns! Seu certificado digital para a atividade '{event.title}' foi gerado e já está disponível."
                        )
                    except Exception as ne:
                        print(f"[NOTIFICATION WARNING] Failed to notify user: {ne}")
                except Exception as e:
                    db.session.rollback()
                    print(f"[CONCLUDE ERROR] Failed to generate certificate for registration {r.id}: {e}")
                    continue

            # 3. Enviar por e-mail
            try:
                success, reason = send_certificate_email(cert, check_existing_log=True, is_manual=False)
                if success:
                    emails_sent += 1
                else:
                    emails_failed += 1
                    failures_details.append(f"Reg {r.id}: {reason}")
            except Exception as e:
                emails_failed += 1
                failures_details.append(f"Reg {r.id}: {str(e)}")

    log_audit(
        user_id=admin_user.id,
        action="EVENT_CONCLUDE",
        description=f"Evento '{event.title}' encerrado oficialmente. Emitidos: {certificates_issued}, E-mails enviados: {emails_sent}, Falhas: {emails_failed}."
    )

    return jsonify({
        "message": f"Evento encerrado com sucesso! Os certificados de todos os participantes aptos foram processados.",
        "event_id": event.id,
        "new_status": event.status,
        "eligible_participants_count": len(regs),
        "certificates_issued_count": certificates_issued,
        "emails_sent_count": emails_sent,
        "emails_failed_count": emails_failed,
        "failures": failures_details
    }), 200

@event_bp.route('/<int:event_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_event(event_id):
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento não encontrado"}), 404

    event.status = 'CANCELLED'
    db.session.commit()

    # Notify all registered citizens
    regs = Registration.query.filter_by(event_id=event.id, status='CONFIRMED').all()
    notified_count = 0
    from .notifications import create_notification
    for r in regs:
        success = create_notification(
            user_id=r.user_id,
            title="Evento Cancelado",
            message=f"Atenção: A atividade '{event.title}' em que você estava inscrito foi CANCELADA pela coordenação pública."
        )
        if success:
            notified_count += 1

    log_audit(
        user_id=admin_user.id,
        action="EVENT_CANCEL",
        description=f"Evento '{event.title}' cancelado pelo administrador {admin_user.name}. Notificações enviadas a {notified_count} cidadãos."
    )

    return jsonify({
        "message": f"Evento cancelado com sucesso! {notified_count} cidadãos inscritos foram notificados.",
        "status": event.status,
        "notified_count": notified_count
    }), 200

@event_bp.route('/<int:event_id>/change-location', methods=['POST'])
@jwt_required()
def change_event_location(event_id):
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    data = request.get_json() or {}
    new_location = data.get('location')
    if not new_location:
        return jsonify({"error": "O campo de novo local é obrigatório."}), 400

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento não encontrado"}), 404

    old_location = event.location
    event.location = new_location
    db.session.commit()

    # Notify all registered citizens
    regs = Registration.query.filter_by(event_id=event.id, status='CONFIRMED').all()
    notified_count = 0
    from .notifications import create_notification
    for r in regs:
        success = create_notification(
            user_id=r.user_id,
            title="Alteração de Local",
            message=f"Importante: O local da atividade '{event.title}' foi ALTERADO. Anterior: {old_location}. Novo: {new_location}."
        )
        if success:
            notified_count += 1

    log_audit(
        user_id=admin_user.id,
        action="EVENT_LOCATION_CHANGE",
        description=f"Local do evento '{event.title}' alterado de '{old_location}' para '{new_location}' pelo admin {admin_user.name}. Notificações enviadas a {notified_count} cidadãos."
    )

    return jsonify({
        "message": f"Local do evento alterado com sucesso! {notified_count} cidadãos inscritos foram notificados.",
        "new_location": event.location,
        "notified_count": notified_count
    }), 200
