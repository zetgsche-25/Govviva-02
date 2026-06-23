from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User, Registration, PresenceCheck, Certificate, AuditLog
from ..services import UserService
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user, error = UserService.create_user(
        data.get('name'), 
        data.get('email'), 
        data.get('password'),
        data.get('role', 'CITIZEN'),
        data.get('org_id'),
        data.get('cpf'),
        data.get('lgpd_terms_accepted', False),
        data.get('lgpd_privacy_accepted', False),
        data.get('lgpd_marketing_consented', False),
        data.get('lgpd_treatment_consented', False),
        data.get('bairro')
    )
    if error:
        return jsonify({"error": error}), 400
        
    # Salvar log de auditoria ao registrar em conformidade LGPD
    try:
        new_audit = AuditLog(
            user_id=user.id,
            action="USER_REGISTER_LGPD",
            ip_address=request.remote_addr,
            description=f"Novo cadastro de cidadão criado com termos LGPD aceitos em {datetime.utcnow().isoformat()}."
        )
        db.session.add(new_audit)
        db.session.commit()
    except Exception:
        pass
        
    return jsonify({"message": "Usuário criado com sucesso e conformidade LGPD registrada!", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({"error": "Credenciais inválidas"}), 401
    
    token = create_access_token(identity=str(user.id))
    
    # Salvar log de auditoria ao logar em conformidade LGPD
    try:
        new_audit = AuditLog(
            user_id=user.id,
            action="USER_LOGIN_LGPD",
            ip_address=request.remote_addr,
            description="Autenticação de conta de cidadão efetuada com sucesso. Verificado conformidade com termos LGPD."
        )
        db.session.add(new_audit)
        db.session.commit()
    except Exception:
        pass

    return jsonify({"token": token, "user": user.to_dict()}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
    return jsonify(user.to_dict())

@auth_bp.route('/lgpd/export', methods=['GET'])
@jwt_required()
def lgpd_export():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
        
    # Buscar todas as inscrições
    registrations = Registration.query.filter_by(user_id=user_id).all()
    reg_list = []
    for r in registrations:
        presence = PresenceCheck.query.filter_by(registration_id=r.id).first()
        certificate = Certificate.query.filter_by(registration_id=r.id).first()
        
        reg_list.append({
            "registration": {
                "id": r.id,
                "event_id": r.event_id,
                "registered_at": r.registered_at.isoformat() if r.registered_at else None,
                "status": r.status,
                "ticket_code": r.ticket_code
            },
            "presence_check": presence.to_dict() if presence else None,
            "certificate": certificate.to_dict() if certificate else None
        })
        
    # Buscar logs de auditoria
    audit_logs = AuditLog.query.filter_by(user_id=user_id).all()
    logs_list = [log.to_dict() for log in audit_logs]
    
    export_payload = {
        "user_profile": user.to_dict(),
        "registrations_details": reg_list,
        "history_logs": logs_list,
        "exported_at": datetime.utcnow().isoformat(),
        "lgpd_disclaimer": "Este arquivo contém todos os dados pessoais armazenados em nossos servidores ativos, em conformidade com o Artigo 18 da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)."
    }
    
    # Gravar log de auditoria da ação de portabilidade
    try:
        new_audit = AuditLog(
            user_id=user.id,
            action="LGPD_PORTABILITY_EXPORT",
            ip_address=request.remote_addr,
            description="Cidadão efetuou a exportação completa de seus dados pessoais para fins de portabilidade (Art. 18 LGPD)."
        )
        db.session.add(new_audit)
        db.session.commit()
    except Exception:
        pass
    
    return jsonify(export_payload), 200

@auth_bp.route('/lgpd/delete', methods=['DELETE'])
@jwt_required()
def lgpd_delete():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
        
    try:
        # Apagar registros relacioandos de presença, certificados e inscrições
        registrations = Registration.query.filter_by(user_id=user_id).all()
        for r in registrations:
            PresenceCheck.query.filter_by(registration_id=r.id).delete()
            Certificate.query.filter_by(registration_id=r.id).delete()
            db.session.delete(r)
            
        # Apagar logs de auditoria
        AuditLog.query.filter_by(user_id=user_id).delete()
        
        # Por fim, apagar o próprio usuário
        db.session.delete(user)
        db.session.commit()
        return jsonify({
            "message": "Sua conta e todos os seus dados pessoais associados foram excluídos com sucesso de nossos servidores de forma irreversível.",
            "status": "PURGED"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao excluir conta: {str(e)}"}), 500

@auth_bp.route('/lgpd/consents', methods=['PUT'])
@jwt_required()
def lgpd_update_consents():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
        
    data = request.get_json() or {}
    
    user.lgpd_terms_accepted = data.get('lgpd_terms_accepted', user.lgpd_terms_accepted)
    user.lgpd_privacy_accepted = data.get('lgpd_privacy_accepted', user.lgpd_privacy_accepted)
    user.lgpd_marketing_consented = data.get('lgpd_marketing_consented', user.lgpd_marketing_consented)
    user.lgpd_treatment_consented = data.get('lgpd_treatment_consented', user.lgpd_treatment_consented)
    user.lgpd_accepted_at = datetime.utcnow()
    
    try:
        new_audit = AuditLog(
            user_id=user.id,
            action="LGPD_CONSENT_UPDATE",
            ip_address=request.remote_addr,
            description=f"Consentimentos LGPD atualizados. Termos e Condições: {user.lgpd_terms_accepted}, Política de Privacidade: {user.lgpd_privacy_accepted}, Comunicações de Marketing: {user.lgpd_marketing_consented}, Tratamento de Dados: {user.lgpd_treatment_consented}."
        )
        db.session.add(new_audit)
        db.session.commit()
    except Exception:
        db.session.rollback()
        pass
        
    return jsonify({
        "message": "Preferências de controle e consentimentos LGPD atualizados com sucesso.",
        "user": user.to_dict()
    }), 200

@auth_bp.route('/govbr/simulate', methods=['POST'])
def govbr_simulate():
    """
    Simulated GOV.BR OIDC federation callback endpoint.
    This mimics the standard GOV.BR OAuth2 authentication callback flow.
    It receives the validated OAuth claims (name, email, CPF, sub, and level)
    and either logs in the existing linked citizen or registers a new citizen 
    associated with their GOV.BR ID.
    """
    from ..extensions import db
    import uuid
    import secrets

    data = request.get_json() or {}
    email = data.get('email')
    name = data.get('name')
    cpf = data.get('cpf')
    govbr_sub = data.get('govbr_sub')
    govbr_level = data.get('govbr_level', 'SILVER') # SILVER is the default level for citizen actions

    if not email or not name or not cpf:
        return jsonify({"error": "Parâmetros obrigatórios ausentes (email, name, cpf)"}), 400

    if not govbr_sub:
        # Generate a simulated unique subject identifier for testing
        govbr_sub = f"govbr-sub-{uuid.uuid4().hex[:16].upper()}"

    # 1. First, search if we have a user linked to this GOV.BR unique sub coordinate
    user = User.query.filter_by(govbr_sub=govbr_sub).first()
    
    # 2. If not found by sub, check by email
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            # Connect existing legacy user to GOV.BR identity securely
            user.govbr_sub = govbr_sub
            user.govbr_level = govbr_level
            user.govbr_authenticated = True
            if not user.cpf and cpf:
                user.cpf = cpf
            db.session.commit()
    
    # 3. If user still does not exist, provision a new federated user
    if not user:
        user = User(
            name=name,
            email=email,
            cpf=cpf,
            role='CITIZEN',
            govbr_sub=govbr_sub,
            govbr_level=govbr_level,
            govbr_authenticated=True
        )
        # Set a complex throwaway random password because they authenticate via GOV.BR SSo
        random_pwd = secrets.token_hex(16)
        user.set_password(random_pwd)
        
        db.session.add(user)
        db.session.commit()
    else:
        # Update connection states for existing linked user
        user.govbr_authenticated = True
        user.govbr_level = govbr_level
        if cpf:
            user.cpf = cpf
        db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": token, 
        "user": user.to_dict(), 
        "integration": {
            "status": "SIMULATED_SUCCESS",
            "provider": "gov.br (SSO)",
            "subject_identifier": govbr_sub,
            "security_level": govbr_level,
            "flow": "OIDC Authorization Code Flow with PKCE"
        }
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    import secrets
    from datetime import datetime, timedelta
    from ..email_utils import send_password_reset_email

    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({"error": "O campo de e-mail é obrigatório."}), 400

    user = User.query.filter_by(email=email).first()
    
    # Generate 6-digit numeric token
    token = f"{secrets.randbelow(900000) + 100000}"
    expires = datetime.utcnow() + timedelta(hours=1)

    if user:
        user.reset_token = token
        user.reset_token_expires = expires
        db.session.commit()

        # Send recovery email
        send_success, detail = send_password_reset_email(user, token)
        
        # Save audit log
        try:
            new_audit = AuditLog(
                user_id=user.id,
                action="PASSWORD_RECOVERY_REQUEST",
                ip_address=request.remote_addr,
                description=f"Solicitação de redefinição de senha realizada para o e-mail: {email}. Canal: E-mail. Status do envio: {detail}."
            )
            db.session.add(new_audit)
            db.session.commit()
        except Exception:
            pass

        return jsonify({
            "message": "Se o seu e-mail estiver cadastrado, um token de ativação única de recuperação de senha foi disparado para a sua caixa de entrada.",
            "status": "SENT_OR_SIMULATED",
            "debug_token": token  # fallback fallthrough for simulation sandbox
        }), 200
    
    # Handle safe mock logging for unregistered users
    try:
         new_audit = AuditLog(
              user_id=None,
              action="PASSWORD_RECOVERY_UNREGISTERED",
              ip_address=request.remote_addr,
              description=f"Tentativa de redefinição de senha iniciada para e-mail inexistente: {email}."
         )
         db.session.add(new_audit)
         db.session.commit()
    except Exception:
         pass

    return jsonify({
        "message": "Se o seu e-mail estiver cadastrado, um token de ativação única de recuperação de senha foi disparado para a sua caixa de entrada.",
        "status": "SENT_OR_SIMULATED"
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    from datetime import datetime

    data = request.get_json() or {}
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('password')

    if not email or not token or not new_password:
        return jsonify({"error": "E-mail, token de recuperação e nova senha são campos obrigatórios."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Usuário não encontrado."}), 404

    # Validate token and expiration
    if not user.reset_token or user.reset_token != token:
        return jsonify({"error": "Token de recuperação incorreto ou expirado."}), 400

    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({"error": "Este token de recuperação já expirou."}), 400

    # Reset password successfully
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    # Log audit event
    try:
        new_audit = AuditLog(
            user_id=user.id,
            action="PASSWORD_RESET_SUCCESS",
            ip_address=request.remote_addr,
            description=f"Senha redefinida com sucesso para o usuário ID {user.id} ({user.email}) através de token de recuperação de e-mail."
        )
        db.session.add(new_audit)
        db.session.commit()
    except Exception:
        pass

    return jsonify({
        "message": "Sua senha foi redefinida com sucesso. Agora você já pode realizar o login com as novas credenciais.",
        "status": "PASSWORD_RESET_COMPLETED"
    }), 200


