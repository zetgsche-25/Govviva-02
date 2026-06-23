from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Event, Registration, PresenceCheck, Certificate, AuditLog, EmailLog
from ..email_utils import send_certificate_email
from datetime import datetime, timedelta
import uuid
import hashlib

certificates_bp = Blueprint('certificates', __name__)
certificate_singular_bp = Blueprint('certificate_singular', __name__)

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

def mask_cpf(cpf):
    if not cpf:
        return "Não cadastrado"
    clean = "".join(filter(str.isdigit, cpf))
    if len(clean) == 11:
        return f"{clean[:3]}.***.***-{clean[-2:]}"
    return cpf

def get_certificate_expiration_info(cert):
    issued_time = cert.issued_at
    expiration_time = issued_time + timedelta(days=30)
    is_expired = datetime.utcnow() > expiration_time
    remaining_days = max(0, (expiration_time - datetime.utcnow()).days)
    return is_expired, remaining_days, expiration_time

# GET /api/certificates - List all or user-specific certificates
@certificates_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_certificates():
    user_id = get_jwt_identity()
    if not user_id:
        # Default query checking fallback for public code verification in list form
        code_query = request.args.get('code')
        if code_query:
            cert = Certificate.query.filter_by(code=code_query).first()
            if not cert:
                return jsonify([])
            reg = Registration.query.get(cert.registration_id)
            if not reg:
                return jsonify([])
            user = User.query.get(reg.user_id)
            event = Event.query.get(reg.event_id)
            is_expired, remaining_days, exp_date = get_certificate_expiration_info(cert)
            if is_expired:
                return jsonify([])
            return jsonify([{
                "id": cert.id,
                "registration_id": cert.registration_id,
                "certificate_code": cert.code,
                "code": cert.code,
                "issue_date": cert.issued_at.isoformat(),
                "issued_at": cert.issued_at.isoformat(),
                "expiration_date": exp_date.isoformat(),
                "pdf_url": f"/api/certificate/{cert.code}/pdf",
                "status": "EXPIRED" if is_expired else "ACTIVE",
                "user_name": user.name if user else "",
                "masked_cpf": mask_cpf(user.cpf) if user else "",
                "event_title": event.title if event else ""
            }])
        return jsonify({"error": "Autenticação requerida ou código inválido"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Se for ADMIN, permite visualizar tudo. Caso contrário, apenas os próprios.
    if user.role == 'ADMIN':
        certs = Certificate.query.order_by(Certificate.issued_at.desc()).all()
    else:
        # Pega as inscrições do cidadão
        regs = Registration.query.filter_by(user_id=user.id).all()
        reg_ids = [r.id for r in regs]
        if not reg_ids:
            return jsonify([])
        certs = Certificate.query.filter(Certificate.registration_id.in_(reg_ids)).order_by(Certificate.issued_at.desc()).all()

    results = []
    for c in certs:
        reg = Registration.query.get(c.registration_id)
        if not reg:
            continue
        u = User.query.get(reg.user_id)
        e = Event.query.get(reg.event_id)
        if not u or not e:
            continue

        is_expired, remaining_days, expiration_date = get_certificate_expiration_info(c)
        results.append({
            "id": c.id,
            "registration_id": c.registration_id,
            "certificate_code": c.code,
            "code": c.code,
            "issue_date": c.issued_at.isoformat(),
            "issued_at": c.issued_at.isoformat(),
            "expiration_date": expiration_date.isoformat(),
            "pdf_url": f"/api/certificate/{c.code}/pdf",
            "status": "EXPIRED" if is_expired else ("ACTIVE" if c.is_publicly_available else "BLOCKED"),
            "hash_verification": c.hash_verification,
            "user_name": u.name,
            "masked_cpf": mask_cpf(u.cpf),
            "event_title": e.title,
            "workload": e.workload or 4,
            "org_responsible": e.org_responsible,
            "category": e.category,
            "remaining_days": remaining_days
        })

    return jsonify(results)

# Redirection for compatibility with previous UI logic (/api/certificates/my)
@certificates_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_certificates():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    regs = Registration.query.filter_by(user_id=user_id, status='CONFIRMED').all()
    results = []

    for r in regs:
        event = Event.query.get(r.event_id)
        if not event:
            continue

        presence = PresenceCheck.query.filter_by(registration_id=r.id).first()
        is_approved = presence and presence.status == 'APPROVED'

        cert = Certificate.query.filter_by(registration_id=r.id).first()
        
        if is_approved and not cert:
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

                from .notifications import create_notification
                create_notification(
                    user_id=user.id,
                    title="Certificado Disponível",
                    message=f"Seu certificado digital para a atividade '{event.title}' já está liberado no painel!"
                )

                log_audit(
                    user_id=user.id,
                    action="CERT_AUTO_EMIT",
                    description=f"Certificado {code} auto-gerado para o cidadão {user.name} na atividade: {event.title}"
                )
            except Exception as e:
                db.session.rollback()
                print(f"[ERROR EMISSION] Failed to auto-generate certificate: {e}")

        if cert:
            is_expired, remaining_days, expiration_date = get_certificate_expiration_info(cert)
            results.append({
                "certificate": cert.to_dict(),
                "event": event.to_dict(),
                "masked_cpf": mask_cpf(user.cpf),
                "user_name": user.name,
                "expiration": {
                    "is_expired": is_expired,
                    "remaining_days": remaining_days,
                    "expiration_date": expiration_date.isoformat()
                }
            })
            
    return jsonify(results)

# Redirection for legacy validators
@certificates_bp.route('/validate/<code>', methods=['GET'])
def legacy_validate_certificate(code):
    return get_single_certificate(code)

# GET /api/certificate/<code> - Validate and fetch a single certificate
@certificate_singular_bp.route('/<code>', methods=['GET'])
def get_single_certificate(code):
    cert = Certificate.query.filter_by(code=code).first()
    if not cert:
        return jsonify({"error": "Código de validação de certificado não existe no sistema GOVVIVA."}), 404

    reg = Registration.query.get(cert.registration_id)
    if not reg:
        return jsonify({"error": "Inscrição associada não localizada"}), 404

    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)
    if not user or not event:
        return jsonify({"error": "Dados do cidadão ou evento não carregados"}), 404
    
    is_expired, remaining_days, expiration_date = get_certificate_expiration_info(cert)

    # Pegando dados opcionais do cabeçalho JWT de forma amigável
    requested_by_admin = False
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(" ")[1]
            decoded = decode_token(token)
            req_user_id = decoded.get("sub")
            req_user = User.query.get(req_user_id)
            if req_user and req_user.role == 'ADMIN':
                requested_by_admin = True
        except Exception:
            pass

    # Restringir o acesso público após o período de validade legal de 30 dias
    if is_expired and not requested_by_admin:
        return jsonify({
            "error": "O prazo de download e visualização pública deste certificado expirou (limite legal de 30 dias).",
            "expired": True,
            "code": code,
            "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
            "user_name": user.name,
            "event_title": event.title,
            "org_responsible": event.org_responsible
        }), 403

    # Registrar acesso de validação pública na Trilha de Auditoria
    remote_ip = request.remote_addr or "0.0.0.0"
    log_audit(
        user_id=None,
        action="CERT_PUBLIC_VALIDATE",
        description=f"Validação pública efetuada com sucesso para o certificado {code}.",
        ip_address=remote_ip
    )

    # Compilar trilha de auditoria estruturada
    timeline = []
    
    # Evento 1: Cadastro no sistema
    if user.created_at:
        timeline.append({
            "event": "CADASTRO_SISTEMA",
            "title": "Registro do Cidadão",
            "description": f"Cidadão {user.name} cadastrado originalmente na base municipal GOVVIVA.",
            "timestamp": user.created_at.isoformat(),
            "badge": "HOMOLOGADO",
            "badge_color": "blue"
        })

    # Evento 2: Inscrição na atividade
    if reg.registered_at:
        timeline.append({
            "event": "INSCRICAO_EVENTO",
            "title": "Passaporte Eletrônico",
            "description": f"Inscrição realizada e passaporte seguro gerado sob o código de ticket {reg.ticket_code or 'GOV-TKT-SECURE'}.",
            "timestamp": reg.registered_at.isoformat(),
            "badge": "CONFIRMADO",
            "badge_color": "emerald"
        })

    # Eventos de Presença (Entrada/Saída)
    presence = PresenceCheck.query.filter_by(registration_id=reg.id).first()
    if presence:
        if presence.check_in_time:
            timeline.append({
                "event": "PRESENCA_CHECKIN",
                "title": "Registro de Presença - Entrada",
                "description": f"Check-in biométrico / presencial homologado no local {presence.location or 'Maricá/RJ'}.",
                "timestamp": presence.check_in_time.isoformat(),
                "badge": "INTEGRIDADE OK",
                "badge_color": "indigo"
            })
        if presence.check_out_time:
            timeline.append({
                "event": "PRESENCA_CHECKOUT",
                "title": "Registro de Presença - Saída",
                "description": f"Check-out efetuado. Carga de {event.workload or 4} horas cumprida com aproveitamento de {presence.calculated_percentage or 100}%.",
                "timestamp": presence.check_out_time.isoformat(),
                "badge": "INTEGRIDADE OK",
                "badge_color": "indigo"
            })

    # Evento 5: Lavratura e expedição de certificado digital
    if cert.issued_at:
        timeline.append({
            "event": "EMISSAO_CERTIFICADO",
            "title": "Outorga Eletrônica de Diploma",
            "description": f"Certificado digital municipal emitido sob o protocolo de validação oficial {cert.code}. Assinatura criptográfica SHA-256 gerada.",
            "timestamp": cert.issued_at.isoformat(),
            "badge": "ASSINADO DIGITALMENTE",
            "badge_color": "purple",
            "hash": cert.hash_verification
        })

    # Evento 6: Consultas de auditoria pública gravadas nos logs do sistema
    validation_logs = AuditLog.query.filter(
        AuditLog.action == "CERT_PUBLIC_VALIDATE",
        AuditLog.description.like(f"%{code}%")
    ).order_by(AuditLog.created_at.asc()).all()

    for i, vl in enumerate(validation_logs):
        timeline.append({
            "event": "CONSULTA_AUDITORIA",
            "title": f"Consulta de Auditoria Pública #{i+1}",
            "description": f"Acesso à página pública de verificação realizado com sucesso por nó de rede IP {vl.ip_address or '0.0.0.0'}.",
            "timestamp": vl.created_at.isoformat() if vl.created_at else datetime.utcnow().isoformat(),
            "badge": "RASTREADO",
            "badge_color": "amber"
        })

    # Ordenar a trilha cronologicamente por hora do fato
    timeline.sort(key=lambda x: x["timestamp"])

    return jsonify({
        "id": cert.id,
        "registration_id": cert.registration_id,
        "certificate_code": cert.code,
        "code": cert.code,
        "issue_date": cert.issued_at.isoformat(),
        "issued_at": cert.issued_at.isoformat(),
        "expiration_date": expiration_date.isoformat(),
        "pdf_url": f"/api/certificate/{cert.code}/pdf",
        "status": "EXPIRED" if is_expired else ("ACTIVE" if cert.is_publicly_available else "BLOCKED"),
        "hash_verification": cert.hash_verification,
        "is_expired": is_expired,
        "remaining_days": remaining_days,
        "expiration_date_raw": expiration_date.isoformat(),
        "audit_trail": timeline,
        
        # Legacy frontend support fields of Certificates.tsx
        "valid": True,
        "certificate": {
            "id": cert.id,
            "code": cert.code,
            "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
            "hash_verification": cert.hash_verification,
            "is_publicly_available": cert.is_publicly_available,
        },
        "event": {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "date_start": event.date_start.isoformat() if event.date_start else None,
            "location": event.location,
            "workload": event.workload or 4,
            "category": event.category,
            "org_responsible": event.org_responsible
        },
        "user": {
            "name": user.name,
            "masked_cpf": mask_cpf(user.cpf)
        },
        # Direct support representation for raw values
        "user_name": user.name,
        "masked_cpf": mask_cpf(user.cpf)
    })

# GET /api/certificate/<code>/pdf - Serve a direct vector high-fidelity landscape print-PDF layout
@certificate_singular_bp.route('/<code>/pdf', methods=['GET'])
def view_certificate_pdf(code):
    cert = Certificate.query.filter_by(code=code).first()
    if not cert:
        return "Certificado não encontrado", 404
        
    reg = Registration.query.get(cert.registration_id)
    if not reg:
        return "Inscrição não localizada", 404
        
    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)
    if not user or not event:
        return "Dados incompletos", 404
        
    is_expired, remaining_days, expiration_date = get_certificate_expiration_info(cert)
    
    # Check if admin
    is_admin = False
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from flask_jwt_extended import decode_token
            token = auth_header.split(" ")[1]
            decoded = decode_token(token)
            req_user_id = decoded.get("sub")
            req_user = User.query.get(req_user_id)
            if req_user and req_user.role == 'ADMIN':
                is_admin = True
        except Exception:
            pass
            
    if is_expired and not is_admin:
        return f"""
        <html>
        <head>
            <title>Acesso Expirado - GOVVIVA</title>
            <style>
                body {{ font-family: sans-serif; text-align: center; padding: 50px; background-color: #f9fafb; color: #374151; }}
                .card {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
                h1 {{ color: #dc2626; font-size: 24px; }}
                p {{ font-size: 14px; line-height: 1.5; color: #4b5563; }}
                .footer {{ margin-top: 30px; font-size: 11px; color: #9ca3af; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Prazo de Download Público Expirado</h1>
                <p>O download público deste certificado digital oficial expirou de acordo com o limite constitucional de 30 dias contados a partir da data de sua emissão.</p>
                <p><strong>Cidadão:</strong> {user.name}</p>
                <p><strong>Curso/Evento:</strong> {event.title}</p>
                <div class="footer">Portal Oficial de Certificação GOVVIVA - Maricá/RJ</div>
            </div>
        </body>
        </html>
        """, 403
        
    # Render landscape A4 certificate layout
    return f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Certificado Digital {cert.code} - GOVVIVA</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&family=JetBrains+Mono:wght@700&display=swap');
            
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                background-color: #f3f4f6;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}
            
            /* Landscape A4 Frame styling */
            .certificate-container {{
                width: 297mm;
                height: 210mm;
                box-sizing: border-box;
                background-color: #ffffff;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                position: relative;
                padding: 20mm;
                border: 10px double #004B82;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }}
            
            /* Corner ornaments */
            .corner {{
                position: absolute;
                width: 40px;
                height: 40px;
                border-color: #004B82;
                border-style: solid;
                border-width: 0;
            }}
            .corner-tl {{ top: 15px; left: 15px; border-top-width: 4px; border-left-width: 4px; }}
            .corner-tr {{ top: 15px; right: 15px; border-top-width: 4px; border-right-width: 4px; }}
            .corner-bl {{ bottom: 15px; left: 15px; border-bottom-width: 4px; border-left-width: 4px; }}
            .corner-br {{ bottom: 15px; right: 15px; border-bottom-width: 4px; border-right-width: 4px; }}
            
            .header {{
                text-align: center;
                margin-bottom: 5mm;
            }}
            
            .badge-icon {{
                width: 50px;
                height: 50px;
                background-color: #004B82;
                border: 3px solid #ffdd00;
                border-radius: 50%;
                display: block;
                margin: 0 auto 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }}
            
            .municipio {{
                font-size: 11px;
                font-weight: 900;
                color: #004B82;
                letter-spacing: 3px;
                margin: 0;
                text-transform: uppercase;
            }}
            
            .secretaria {{
                font-size: 9px;
                font-weight: 700;
                color: #6b7280;
                letter-spacing: 1px;
                margin: 3px 0 0;
                text-transform: uppercase;
            }}
            
            .content {{
                text-align: center;
                padding: 0 10mm;
            }}
            
            .title {{
                font-family: 'Playfair Display', serif;
                font-weight: 900;
                font-size: 28px;
                color: #004B82;
                margin: 0 0 8mm 0;
                text-transform: uppercase;
                letter-spacing: -0.5px;
            }}
            
            .text {{
                font-size: 14px;
                line-height: 1.6;
                color: #4b5563;
                max-width: 230mm;
                margin: 0 auto;
            }}
            
            .student-name {{
                font-family: 'Playfair Display', serif;
                font-weight: 900;
                font-size: 26px;
                color: #111827;
                display: block;
                margin: 3mm 0;
                text-transform: uppercase;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 2px;
                width: fit-content;
                margin-left: auto;
                margin-right: auto;
            }}
            
            .event-box {{
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 5mm;
                margin: 6mm auto;
                max-width: 200mm;
            }}
            
            .event-title {{
                font-size: 15px;
                font-weight: 900;
                color: #111827;
                margin: 0;
                text-transform: uppercase;
            }}
            
            .event-meta {{
                font-size: 11px;
                font-weight: 700;
                color: #004B82;
                margin: 2mm 0 0 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            
            .footer {{
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 0 10mm;
            }}
            
            .qr-code-section {{
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }}
            
            .qr-code {{
                width: 70px;
                height: 70px;
                border: 1px solid #e5e7eb;
                padding: 3px;
                background-color: white;
            }}
            
            .qr-label {{
                font-size: 7px;
                font-weight: 700;
                color: #9ca3af;
                margin-top: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }}
            
            .protocol-section {{
                text-align: center;
                background-color: #eff6ff;
                border: 1px solid #bfdbfe;
                padding: 3mm 6mm;
                border-radius: 12px;
            }}
            
            .protocol-title {{
                font-size: 8px;
                font-weight: 900;
                color: #004B82;
                letter-spacing: 1px;
                margin: 0 0 1mm 0;
            }}
            
            .protocol-code {{
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                font-weight: 700;
                color: #111827;
                margin: 0;
            }}
            
            .protocol-hash {{
                font-family: 'JetBrains Mono', monospace;
                font-size: 7px;
                color: #6b7280;
                margin: 1mm 0 0 0;
                text-transform: uppercase;
            }}
            
            .signature-section {{
                text-align: right;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }}
            
            .line {{
                width: 150px;
                border-bottom: 1px solid #9ca3af;
                margin-bottom: 6px;
            }}
            
            .sign-title {{
                font-size: 9px;
                font-weight: 900;
                color: #111827;
                margin: 0;
                text-transform: uppercase;
            }}
            
            .sign-subtitle {{
                font-size: 7px;
                color: #6b7280;
                margin: 2px 0 0 0;
                text-transform: uppercase;
            }}
            
            .print-btn {{
                margin-bottom: 15px;
                background-color: #004B82;
                color: white;
                border: none;
                padding: 10px 20px;
                font-size: 12px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: background-color 0.2s;
            }}
            .print-btn:hover {{
                background-color: #00365e;
            }}
            
            /* Print rules */
            @media print {{
                body {{
                    background-color: #ffffff;
                    min-height: auto;
                    padding: 0;
                    margin: 0;
                }}
                .print-btn {{
                    display: none;
                }}
                .certificate-container {{
                    box-shadow: none;
                    border-radius: 0;
                    margin: 0;
                    width: 297mm;
                    height: 210mm;
                    page-break-inside: avoid;
                }}
            }}
        </style>
    </head>
    <body>
        <button class="print-btn" onclick="window.print()">Imprimir / Salvar como PDF</button>
        
        <div class="certificate-container">
            <!-- Corners decoration -->
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <!-- Header -->
            <div class="header">
                <div class="badge-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width: 32px; height: 32px; margin: 9px auto 0; display: block;">
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                </div>
                <h4 class="municipio">MUNICÍPIO DE MARICÁ</h4>
                <p class="secretaria">{event.org_responsible or "SECRETARIA MUNICIPAL DE MARICÁ"}</p>
            </div>
            
            <!-- Content -->
            <div class="content">
                <h1 class="title">Certificado de Capacitação</h1>
                <p class="text">
                    A Prefeitura Municipal confere outorga oficial declarando com fé pública que o cidadão(ã)
                    <strong class="student-name">{user.name}</strong>
                    portador do CPF sob máscara <strong style="color: #111827;">{mask_cpf(user.cpf)}</strong> regulamentado em frequência eletrônica de 100%, 
                    concluiu com êxito e integral aproveitamento a atividade de capacitação:
                </p>
                
                <div class="event-box">
                    <h2 class="event-title">{event.title}</h2>
                    <p class="event-meta">Categoria: {event.category} | Carga Horária: {event.workload or 4} Horas Aula</p>
                </div>
                
                <p style="font-size: 10px; color: #9ca3af; margin: 3mm 0 0 0;">
                    Realizado em {event.date_start.strftime('%d/%m/%Y') if event.date_start else datetime.utcnow().strftime('%d/%m/%Y')} no endereço {event.location}.
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="qr-code-section">
                    <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data={request.host_url}validar/{cert.code}" alt="QR Code de Validação" referrerPolicy="no-referrer">
                    <span class="qr-label">AUTENTICIDADE CERTIFICADA</span>
                </div>
                
                <div class="protocol-section">
                    <p class="protocol-title">PROTOCOLO CRIPTOGRÁFICO</p>
                    <p class="protocol-code">{cert.code}</p>
                    <p class="protocol-hash">ASSINATURA: {cert.hash_verification[:16]}...</p>
                </div>
                
                <div class="signature-section">
                    <div class="line"></div>
                    <p class="sign-title">{event.org_responsible or "Gestor Municipal"}</p>
                    <p class="sign-subtitle">Órgão Certificador Registrado</p>
                </div>
            </div>
        </div>
        
        <script>
            window.addEventListener('load', () => {{
                setTimeout(() => {{
                    window.print();
                }}, 500);
            }});
        </script>
    </body>
    </html>
    """

# POST /api/certificates/admin/reactivate - Admin reactivates expired certificates
@certificates_bp.route('/admin/reactivate', methods=['POST'])
@jwt_required()
def reactivate_certificate():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    data = request.get_json() or {}
    cert_id = data.get('certificate_id')
    if not cert_id:
        return jsonify({"error": "ID do certificado é obrigatório"}), 400

    cert = Certificate.query.get(cert_id)
    if not cert:
        return jsonify({"error": "Certificado não encontrado"}), 404

    now = datetime.utcnow()
    cert.issued_at = now
    cert.is_publicly_available = True
    cert.reactivated_at = now
    db.session.commit()

    reg = Registration.query.get(cert.registration_id)
    user = User.query.get(reg.user_id) if reg else None
    
    log_audit(
        user_id=admin_user.id,
        action="CERT_REACTIVATE",
        description=f"Certificado {cert.code} reativado pelo administrador {admin_user.name} para o cidadão {user.name if user else 'desconhecido'}."
    )

    return jsonify({
        "message": "Protocolo de certificado reativado na prefeitura com sucesso por mais 30 dias!",
        "certificate": cert.to_dict()
    })

# POST /api/certificates/manual-emit - Admin manually issues certificate
@certificates_bp.route('/manual-emit', methods=['POST'])
@jwt_required()
def manual_emit_certificate():
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

    # Verificar presença aprovada
    presence = PresenceCheck.query.filter_by(registration_id=reg.id).first()
    if not presence or presence.status != 'APPROVED':
        return jsonify({"error": "Este cidadão ainda não cumpre 100% de frequência mínima para homologar certificado."}), 400

    existing = Certificate.query.filter_by(registration_id=reg.id).first()
    if existing:
        return jsonify({
            "message": "Este certificado já está emitido.",
            "certificate": existing.to_dict()
        }), 200

    try:
        user = User.query.get(reg.user_id)
        event = Event.query.get(reg.event_id)
        
        code_token = str(uuid.uuid4())[:8].upper()
        code = f"GOV-CERT-{code_token}"
        hash_sign = hashlib.sha256(f"{code}-GOVVIVA-SIGN-2026".encode()).hexdigest()[:32].upper()
        
        cert = Certificate(
            registration_id=reg.id,
            code=code,
            hash_verification=hash_sign,
            issued_at=datetime.utcnow(),
            is_publicly_available=True
        )
        db.session.add(cert)
        db.session.commit()

        from .notifications import create_notification
        create_notification(
            user_id=user.id,
            title="Certificado Disponível",
            message=f"Seu certificado digital para a atividade '{event.title}' foi liberado pela coordenação pública!"
        )

        log_audit(
            user_id=admin_user.id,
            action="CERT_MANUAL_EMIT",
            description=f"Certificado {code} forçado MANUALMENTE pelo admin {admin_user.name} para {user.name} no evento {event.title}."
        )

        return jsonify({
            "message": "Certificado digital lavrado com sucesso no livro eletrônico oficial!",
            "certificate": cert.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Falha ao conceber emissão do certificado: {e}"}), 500

# POST /api/certificates/<int:cert_id>/resend-email - Admin manually triggers email resend
@certificates_bp.route('/<int:cert_id>/resend-email', methods=['POST'])
@jwt_required()
def resend_certificate_email_route(cert_id):
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    cert = Certificate.query.get(cert_id)
    if not cert:
        return jsonify({"error": "Certificado não encontrado"}), 404

    try:
        success, reason = send_certificate_email(cert, check_existing_log=False, is_manual=True)
        reg = Registration.query.get(cert.registration_id)
        user = User.query.get(reg.user_id) if reg else None
        event = Event.query.get(reg.event_id) if reg else None
        
        log_audit(
            user_id=admin_user.id,
            action="CERT_MANUAL_RESEND",
            description=f"Admin {admin_user.name} reenviou manualmente o certificado de {user.name if user else 'desconhecido'} para o evento '{event.title if event else 'desconhecido'}'. Resultado: {reason}"
        )

        if success:
            return jsonify({
                "message": "Parabéns! E-mail de certificado reenviado com sucesso para o cidadão.",
                "certificate": cert.to_dict()
            }), 200
        else:
            return jsonify({"error": f"O SMTP falhou ao entregar o e-mail: {reason}"}), 500

    except Exception as e:
        return jsonify({"error": f"Falha inesperada no reenvio de e-mail: {str(e)}"}), 500

# GET /api/certificates/email-logs - Access chronological list of email dispatches and failures
@certificates_bp.route('/email-logs', methods=['GET'])
@jwt_required()
def get_email_delivery_logs():
    user_id = get_jwt_identity()
    admin_user = User.query.get(user_id)
    if not admin_user or admin_user.role != 'ADMIN':
        return jsonify({"error": "Acesso administrativo negado"}), 403

    logs = EmailLog.query.order_by(EmailLog.sent_at.desc()).all()
    results = []

    for l in logs:
        cert = Certificate.query.get(l.certificate_id)
        u = None
        e = None
        if cert:
            reg = Registration.query.get(cert.registration_id)
            if reg:
                u = User.query.get(reg.user_id)
                e = Event.query.get(reg.event_id)
                
        results.append({
            "id": l.id,
            "certificate_id": l.certificate_id,
            "certificate_code": cert.code if cert else "Desconhecido",
            "recipient_email": l.recipient_email,
            "sent_at": l.sent_at.isoformat() if l.sent_at else None,
            "status": l.status,
            "error_message": l.error_message,
            "attempts": l.attempts,
            "is_manual": l.is_manual,
            "user_name": u.name if u else "Desconhecido",
            "event_title": e.title if e else "Desconhecido"
        })

    return jsonify(results)
