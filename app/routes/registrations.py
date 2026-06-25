from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import RegistrationService
from ..models import Registration, Event

registration_bp = Blueprint('registrations', __name__)

@registration_bp.route('', methods=['POST'])
@registration_bp.route('/', methods=['POST'])
@jwt_required()
def enroll():
    user_id = get_jwt_identity()
    data = request.get_json()
    reg, error = RegistrationService.enroll(user_id, data.get('event_id'))
    
    if error:
        return jsonify({"error": error}), 400
    
    # Emit "Inscrição Aprovada" notification
    try:
        ev = Event.query.get(data.get('event_id'))
        if ev:
            from .notifications import create_notification
            create_notification(
                user_id=user_id,
                title="Inscrição Aprovada",
                message=f"Sua inscrição para a atividade '{ev.title}' foi processada e aprovada com sucesso! Código do ticket de entrada: {reg.ticket_code}."
            )
    except Exception as ne:
        print(f"[NOTIFICATION WARNING] Failed to notify registration: {ne}")
    
    return jsonify({"message": "Inscrição confirmada!", "id": reg.id}), 201

@registration_bp.route('/me', methods=['GET'])
@jwt_required()
def my_registrations():
    user_id = get_jwt_identity()
    from ..models import PresenceCheck, Certificate
    regs = Registration.query.filter_by(user_id=user_id).all()
    
    # Detalhar eventos nas inscrições
    result = []
    for r in regs:
        ev = Event.query.get(r.event_id)
        presence = PresenceCheck.query.filter_by(registration_id=r.id).first()
        cert = Certificate.query.filter_by(registration_id=r.id).first()
        result.append({
            "registration_id": r.id,
            "status": r.status,
            "ticket_code": r.ticket_code,
            "ticket_uuid": r.ticket_uuid,
            "qrcode_encrypted": r.qrcode_encrypted,
            "security_hash": r.security_hash,
            "event": ev.to_dict() if ev else None,
            "presence": presence.to_dict() if presence else None,
            "certificate": cert.to_dict() if cert else None
        })
    return jsonify(result)
