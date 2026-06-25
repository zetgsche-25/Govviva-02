from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Event, Registration, PresenceCheck, AuditLog
from datetime import datetime

presence_bp = Blueprint('presence', __name__)

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

@presence_bp.route('/event/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event_presence(event_id):
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role not in ['ADMIN', 'ORGANIZER']:
        return jsonify({"error": "Acesso administrativo negado"}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento não encontrado"}), 404

    # Verificar se o organizador tem acesso ao evento
    if admin_user.role == 'ORGANIZER':
        if event.creator_id != admin_user.id and event.org_id != admin_user.org_id:
            return jsonify({"error": "Acesso negado a este evento"}), 403

    # Encontrar todas inscrições e correlacionar presenças
    regs = Registration.query.filter_by(event_id=event_id).all()
    results = []
    
    for r in regs:
        user = User.query.get(r.user_id)
        if not user:
            continue
            
        presence = PresenceCheck.query.filter_by(registration_id=r.id).first()
        results.append({
            "registration_id": r.id,
            "registered_at": r.registered_at.isoformat() if r.registered_at else None,
            "status": r.status,
            "ticket_code": r.ticket_code,
            "ticket_uuid": r.ticket_uuid,
            "qrcode_encrypted": r.qrcode_encrypted,
            "security_hash": r.security_hash,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "cpf": user.cpf or "Não cadastrado"
            },
            "presence": presence.to_dict() if presence else {
                "id": None,
                "registration_id": r.id,
                "check_in_time": None,
                "check_out_time": None,
                "calculated_duration": 0.0,
                "calculated_percentage": 0.0,
                "status": "PENDING",
                "check_in_ip": None,
                "check_in_device": None,
                "check_out_ip": None,
                "check_out_device": None,
                "check_in_organizer_id": None,
                "check_out_organizer_id": None,
                "check_in_hash": None,
                "check_out_hash": None
            }
        })

    return jsonify({
        "event": event.to_dict(),
        "participants": results
    })

@presence_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_presence_ticket():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role not in ['ADMIN', 'ORGANIZER']:
        return jsonify({"error": "Acesso administrativo negado"}), 403

    data = request.get_json() or {}
    ticket_code = data.get('ticket_code')
    if not ticket_code:
        return jsonify({"error": "Código do ticket é obrigatório"}), 400

    # Cryptographic verification for Smart QR Code
    import base64
    import hashlib
    raw_str = None
    
    # Try base64 decoding
    try:
        decoded_bytes = base64.b64decode(ticket_code)
        decoded_str = decoded_bytes.decode('utf-8')
        if "GOVVIVA-SECURE-V1" in decoded_str:
            raw_str = decoded_str
    except Exception:
        pass
        
    if not raw_str and ticket_code.startswith("GOVVIVA-SECURE-V1"):
        raw_str = ticket_code

    reg = None
    if raw_str:
        parts = raw_str.split('|')
        if len(parts) >= 5:
            prefix = parts[0]
            u_id = int(parts[1])
            e_id = int(parts[2])
            t_uuid = parts[3]
            s_hash = parts[4]
            
            # Recalculate security hash to prevent fraud
            expected_hash = hashlib.sha256(f"{u_id}-{e_id}-{t_uuid}-govviva-secure-salt".encode('utf-8')).hexdigest()
            if s_hash != expected_hash:
                return jsonify({"error": "Assinatura do QR Code inválida ou violada. Verificação de segurança falhou."}), 400
                
            reg = Registration.query.filter_by(user_id=u_id, event_id=e_id, ticket_uuid=t_uuid).first()

    if not reg:
        # Fallback to direct ticket_code search
        reg = Registration.query.filter_by(ticket_code=ticket_code).first()

    if not reg:
        return jsonify({"error": "Código de inscrição não encontrado no sistema"}), 404

    if reg.status != 'CONFIRMED':
        return jsonify({"error": "Esta inscrição foi cancelada pelo cidadão"}), 400

    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)

    # Verificar se o organizador tem acesso ao evento deste ticket
    if admin_user.role == 'ORGANIZER':
        if event.creator_id != admin_user.id and event.org_id != admin_user.org_id:
            return jsonify({"error": "Acesso negado: Este evento não está sob sua coordenação"}), 403

    # Busca ou cria presença
    presence = PresenceCheck.query.filter_by(registration_id=reg.id).first()
    if not presence:
        presence = PresenceCheck(registration_id=reg.id)
        db.session.add(presence)
        db.session.commit()

    now = datetime.utcnow()
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr or '0.0.0.0')
    user_agent = request.headers.get('User-Agent', 'Desconhecido')

    # Fluxo do checkin ou checkout automático
    if not presence.check_in_time:
        # Registrar Entrada (Check-In)
        presence.check_in_time = now
        presence.location = event.location
        presence.status = 'PENDING'
        
        presence.check_in_ip = client_ip
        presence.check_in_device = user_agent
        presence.check_in_organizer_id = admin_user.id
        presence.check_in_hash = hashlib.sha256(f"{reg.id}-checkin-{now.isoformat()}-{admin_user.id}".encode('utf-8')).hexdigest()
        
        db.session.commit()

        log_audit(
            user_id=user.id,
            action="CHECKIN_QR",
            description=f"Check-in via QR Code escaneado pelo admin/organizador {admin_user.name} no evento: {event.title}",
            ip_address=client_ip
        )

        return jsonify({
            "message": f"Check-in realizado com sucesso para {user.name}!",
            "action_type": "CHECKIN",
            "participant_name": user.name,
            "time": now.isoformat(),
            "presence": presence.to_dict()
        }), 200

    elif presence.check_in_time and not presence.check_out_time:
        # Registrar Saída (Check-Out)
        presence.check_out_time = now
        
        presence.check_out_ip = client_ip
        presence.check_out_device = user_agent
        presence.check_out_organizer_id = admin_user.id
        presence.check_out_hash = hashlib.sha256(f"{reg.id}-checkout-{now.isoformat()}-{admin_user.id}".encode('utf-8')).hexdigest()

        # Calcular permanência
        duration_delta = now - presence.check_in_time
        duration_hours = max(0.01, duration_delta.total_seconds() / 3600.0) # mínimo decimal
        presence.calculated_duration = round(duration_hours, 2)
        
        # Carga horária do evento
        workload = event.workload or 4
        percentage = (duration_hours / workload) * 100.0
        presence.calculated_percentage = round(min(100.0, percentage), 2)
        
        # Critério 75% da carga horária para liberação
        if presence.calculated_percentage >= 75.0:
            presence.status = 'APPROVED'
        else:
            presence.status = 'INCOMPLETE'
            
        db.session.commit()

        log_audit(
            user_id=user.id,
            action="CHECKOUT_QR",
            description=f"Check-out via QR Code do cidadão {user.name} no evento: {event.title}. Carga: {presence.calculated_percentage}%",
            ip_address=client_ip
        )

        return jsonify({
            "message": f"Check-out realizado com sucesso para {user.name}!",
            "action_type": "CHECKOUT",
            "participant_name": user.name,
            "time": now.isoformat(),
            "calculated_duration": presence.calculated_duration,
            "calculated_percentage": presence.calculated_percentage,
            "presence": presence.to_dict()
        }), 200
    else:
        # Fraude/Duplicidade
        return jsonify({
            "error": "Este cidadão já concluiu o ciclo de check-in e check-out para este evento.",
            "presence": presence.to_dict()
        }), 400

@presence_bp.route('/manual', methods=['POST'])
@jwt_required()
def manual_presence_override():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role not in ['ADMIN', 'ORGANIZER']:
        return jsonify({"error": "Acesso administrativo negado"}), 403

    data = request.get_json() or {}
    reg_id = data.get('registration_id')
    action = data.get('action') # 'check_in' ou 'check_out'
    
    if not reg_id or not action:
        return jsonify({"error": "registration_id e action são obrigatórios"}), 400

    reg = Registration.query.get(reg_id)
    if not reg:
        return jsonify({"error": "Inscrição não encontrada"}), 404

    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)

    # Verificar se o organizador tem acesso ao evento
    if admin_user.role == 'ORGANIZER':
        if event.creator_id != admin_user.id and event.org_id != admin_user.org_id:
            return jsonify({"error": "Acesso negado: Este evento não está sob sua coordenação"}), 403

    presence = PresenceCheck.query.filter_by(registration_id=reg.id).first()
    if not presence:
        presence = PresenceCheck(registration_id=reg.id)
        db.session.add(presence)
        db.session.commit()

    now = datetime.utcnow()
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr or '0.0.0.0')
    user_agent = request.headers.get('User-Agent', 'Manual Override')
    import hashlib

    if action == 'check_in':
        presence.check_in_time = now
        presence.location = f"Manual - {event.location}"
        presence.status = 'PENDING'
        
        presence.check_in_ip = client_ip
        presence.check_in_device = user_agent
        presence.check_in_organizer_id = admin_user.id
        presence.check_in_hash = hashlib.sha256(f"{reg.id}-manual-checkin-{now.isoformat()}-{admin_user.id}".encode('utf-8')).hexdigest()

        db.session.commit()
        
        log_audit(
            user_id=user.id,
            action="CHECKIN_MANUAL",
            description=f"Check-in MANUAL registrado pelo admin/organizador {admin_user.name} no evento: {event.title}",
            ip_address=client_ip
        )
        return jsonify({
            "message": f"Check-in manual registrado com sucesso!",
            "presence": presence.to_dict()
        })

    elif action == 'check_out':
        if not presence.check_in_time:
            presence.check_in_time = event.date_start
            presence.check_in_ip = client_ip
            presence.check_in_device = "System Backfill"
            presence.check_in_organizer_id = admin_user.id
            presence.check_in_hash = hashlib.sha256(f"{reg.id}-backfill-{now.isoformat()}-{admin_user.id}".encode('utf-8')).hexdigest()
            
        presence.check_out_time = now
        presence.check_out_ip = client_ip
        presence.check_out_device = user_agent
        presence.check_out_organizer_id = admin_user.id
        presence.check_out_hash = hashlib.sha256(f"{reg.id}-manual-checkout-{now.isoformat()}-{admin_user.id}".encode('utf-8')).hexdigest()

        # Calcular permanência
        workload = event.workload or 4
        presence.calculated_duration = workload
        presence.calculated_percentage = 100.0
        presence.status = 'APPROVED'
        
        db.session.commit()

        log_audit(
            user_id=user.id,
            action="CHECKOUT_MANUAL",
            description=f"Check-out MANUAL registrado pelo admin/organizador {admin_user.name} no evento: {event.title}",
            ip_address=client_ip
        )
        return jsonify({
            "message": f"Check-out manual registrado com sucesso com 100% de presença!",
            "presence": presence.to_dict()
        })
    else:
        return jsonify({"error": "Ação inválida. Use 'check_in' ou 'check_out'"}), 400

@presence_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_presence():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    data = request.get_json() or {}
    reg_id = data.get('registration_id')
    if not reg_id:
        return jsonify({"error": "registration_id é obrigatório"}), 400

    reg = Registration.query.get(reg_id)
    if not reg:
        return jsonify({"error": "Inscrição não encontrada"}), 404

    presence = PresenceCheck.query.filter_by(registration_id=reg.id).first()
    if presence:
        db.session.delete(presence)
        db.session.commit()

    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)
    
    log_audit(
        user_id=user.id,
        action="PRESENCE_RESET",
        description=f"Dados de presença resetados pelo admin {admin_user.name} para o usuário {user.name} no evento {event.title}"
    )

    return jsonify({"message": "Dados de frequência reiniciados com sucesso."})

@presence_bp.route('/audit', methods=['GET'])
@jwt_required()
def get_audit_logs():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    results = []
    for l in logs:
        u = User.query.get(l.user_id) if l.user_id else None
        results.append({
            "id": l.id,
            "action": l.action,
            "ip_address": l.ip_address,
            "description": l.description,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "user_name": u.name if u else "Prefeitura / Sistema"
        })
    return jsonify(results)
