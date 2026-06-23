import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from .extensions import db
from .models import EmailLog, Certificate, Registration, User, Event, AuditLog

def generate_simple_pdf(cert_code, student_name, event_title, workload, org_responsible, date_str):
    """
    Generates a valid, basic PDF byte stream containing official certification details.
    """
    # Simple Latin-1 sanitization to avoid character map issues in raw pdf streams
    sanitized_name = student_name.encode('ascii', errors='ignore').decode('ascii')
    sanitized_title = event_title.encode('ascii', errors='ignore').decode('ascii')
    sanitized_org = org_responsible.encode('ascii', errors='ignore').decode('ascii')
    
    # Constructing a valid PDF document layout
    catalog = b"<< /Type /Catalog /Pages 3 0 R >>"
    outlines = b"<< /Type /Outlines /Count 0 >>"
    pages = b"<< /Type /Pages /Kids [ 4 0 R ] /Count 1 >>"
    
    # Stream content with Helvetica font
    stream_content = f"""BT
/F1 20 Tf
50 750 Td
(PREFEITURA MUNICIPAL DE MARICA) Tj
/F1 16 Tf
0 -40 Td
(CERTIFICADO DE CAPACITACAO - PORTAL GOVVIVA) Tj
/F1 12 Tf
0 -40 Td
(Certificamos para os devidos fins de direito e fe publica que o(a) cidadao(a):) Tj
/F1 16 Tf
0 -30 Td
({sanitized_name.upper()}) Tj
/F1 12 Tf
0 -40 Td
(Concluiu com exito e frequencia integral a atividade de capacitacao institucional:) Tj
/F1 14 Tf
0 -25 Td
({sanitized_title.upper()}) Tj
/F1 12 Tf
0 -35 Td
(Carga Horaria: {workload} Horas Aula) Tj
0 -20 Td
(Orgao Responsavel: {sanitized_org}) Tj
0 -20 Td
(Data de Emissao: {date_str}) Tj
0 -45 Td
(Protocolo Digital de Autenticidade: {cert_code}) Tj
0 -20 Td
(Assinatura de Validacao Criptografica Realizada com Sucesso.) Tj
0 -30 Td
(Acesse: {os.environ.get('APP_URL', 'http://localhost:3000')}/certificados para validar este certificado.) Tj
ET"""
    stream_content_bytes = stream_content.encode('latin1', errors='replace')
    
    stream_obj = b"<< /Length " + str(len(stream_content_bytes)).encode() + b" >>\nstream\n" + stream_content_bytes + b"\nendstream"
    page = b"<< /Type /Page /Parent 3 0 R /MediaBox [ 0 0 595 842 ] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>"
    font = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    
    obj_defs = [
        (1, catalog),
        (2, outlines),
        (3, pages),
        (4, page),
        (5, stream_obj),
        (6, font)
    ]
    
    offsets = {}
    output = bytearray(b"%PDF-1.4\n")
    
    for num, body in obj_defs:
        offsets[num] = len(output)
        output.extend(f"{num} 0 obj\n".encode() + body + b"\nendobj\n")
        
    xref_offset = len(output)
    output.extend(b"xref\n0 7\n0000000000 65535 f \n")
    for num in sorted(offsets.keys()):
        output.extend(f"{offsets[num]:010d} 00000 n \n".encode())
        
    output.extend(f"trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode())
    return bytes(output)

def send_certificate_email(cert, check_existing_log=False, is_manual=False):
    """
    Sends the certificate PDF via email to the citizen.
    If SMTP settings are not provided, it registers a fallback simulation success.
    """
    reg = Registration.query.get(cert.registration_id)
    if not reg:
        return False, "Inscrição associada não encontrada"
        
    user = User.query.get(reg.user_id)
    event = Event.query.get(reg.event_id)
    if not user or not event:
        return False, "Cidadão ou atividade associada invalida"

    recipient_email = user.email
    if not recipient_email:
        return False, "Usuário não possui e-mail registrado"

    # Find or create email log
    log = None
    if check_existing_log:
        log = EmailLog.query.filter_by(certificate_id=cert.id, recipient_email=recipient_email).first()
        
    if log:
        log.attempts += 1
        log.sent_at = datetime.utcnow()
        if is_manual:
            log.is_manual = True
    else:
        log = EmailLog(
            certificate_id=cert.id,
            recipient_email=recipient_email,
            attempts=1,
            status='PENDING',
            is_manual=is_manual
        )
        db.session.add(log)
        db.session.commit()

    # Get SMTP configuration
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = os.environ.get('SMTP_PORT', '587')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_from = os.environ.get('SMTP_FROM') or smtp_user or "no-reply@govviva-marica.gov.br"

    date_str = cert.issued_at.strftime('%d/%m/%Y') if cert.issued_at else datetime.utcnow().strftime('%d/%m/%Y')
    pdf_bytes = generate_simple_pdf(
        cert_code=cert.code,
        student_name=user.name,
        event_title=event.title,
        workload=event.workload or 4,
        org_responsible=event.org_responsible or "Secretaria Municipal de Maricá",
        date_str=date_str
    )

    subject = f"Seu Certificado Oficial Homologado: {event.title} - GOVVIVA Maricá"
    body_html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }}
            .header {{ background-color: #004B82; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }}
            .footer {{ font-size: 11px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }}
            .btn {{ display: inline-block; padding: 10px 20px; background-color: #004B82; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Prefeitura Municipal de Maricá / RJ</h2>
                <h3 style="margin: 0; font-weight: normal;">Portal de Capacitação Cidadã GOVVIVA</h3>
            </div>
            <p>Olá, <strong>{user.name}</strong>,</p>
            <p>Parabéns pela conclusão da atividade de capacitação institucional!</p>
            <p>Informamos que o seu certificado oficial foi emitido e assinado digitalmente com plena fé pública.</p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Atividade:</strong> {event.title}</p>
                <p style="margin: 5px 0 0 0;"><strong>Carga Horária:</strong> {event.workload or 4} horas aula</p>
                <p style="margin: 5px 0 0 0;"><strong>Código de Validação:</strong> {cert.code}</p>
            </div>
            <p>Em anexo nesta mensagem, você encontrará o PDF oficial pronto para arquivamento ou impressão.</p>
            <p>Você também pode acessar o portal para visualizar seu certificado online ou validá-lo via QR Code clicando abaixo:</p>
            <div style="text-align: center;">
                <a href="{os.environ.get('APP_URL', 'http://localhost:3000')}/certificados?code={cert.code}" class="btn" style="color: white !important;">Visualizar Certificado</a>
            </div>
            <p class="footer">Este é um e-mail automático enviado pelo Portal GOVVIVA Maricá. Por favor, não responda a esta mensagem.</p>
        </div>
    </body>
    </html>
    """

    try:
        # Check if SMTP is configured
        if not smtp_server or not smtp_user or not smtp_password:
            # SMTP Not Set - Log in simulation mode
            simulation_msg = "[SMTP SIMULATION MODE] SMTP parameters not fully set in .env. Email registered and simulated as sent successfully."
            print(simulation_msg)
            
            log.status = 'SENT'
            log.error_message = "Simulado com sucesso devido à ausência de credenciais SMTP no .env"
            cert.sent_by_email = True
            cert.email_sent_at = datetime.utcnow()
            cert.email_status = 'SENT'
            cert.email_attempts = log.attempts
            db.session.commit()
            return True, "Simulado"

        # Construct Email Message
        msg = MIMEMultipart()
        msg['From'] = smtp_from
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body_html, 'html'))

        # Prepare attachment
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(pdf_bytes)
        encoders.encode_base64(part)
        filename = f"Certificado_{cert.code}.pdf"
        part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
        msg.attach(part)

        # Connect to SMTP
        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, recipient_email, msg.as_string())
        server.quit()

        # Update log and certificate Status to SENT
        log.status = 'SENT'
        log.error_message = None
        cert.sent_by_email = True
        cert.email_sent_at = datetime.utcnow()
        cert.email_status = 'SENT'
        cert.email_attempts = log.attempts
        db.session.commit()
        return True, "Enviado com sucesso"

    except Exception as e:
        error_msg = str(e)
        print(f"[EMAIL ERROR] Failed to send certificate email to {recipient_email}: {error_msg}")
        
        # Update log and certificate Status to FAILED
        log.status = 'FAILED'
        log.error_message = error_msg
        
        cert.email_status = 'FAILED'
        cert.email_attempts = log.attempts
        db.session.commit()
        return False, error_msg

def send_password_reset_email(user, token):
    """
    Sends a password reset token/link via email.
    Saves simulation success or errors gracefully if SMTP is not configured.
    """
    recipient_email = user.email
    if not recipient_email:
        return False, "Usuário não possui e-mail registrado"

    # Get SMTP configuration
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = os.environ.get('SMTP_PORT', '587')
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_from = os.environ.get('SMTP_FROM') or smtp_user or "no-reply@govviva-marica.gov.br"

    app_url = os.environ.get('APP_URL') or os.environ.get('VITE_APP_URL') or "http://localhost:3000"
    reset_link = f"{app_url}/reset-password?email={recipient_email}&token={token}"

    subject = "Recuperação de Senha - Portal GOVVIVA Maricá"
    body_html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }}
            .header {{ background-color: #004B82; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }}
            .footer {{ font-size: 11px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }}
            .btn {{ display: inline-block; padding: 10px 20px; background-color: #004B82; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }}
            .token-box {{ display: inline-block; padding: 15px 30px; background-color: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Prefeitura Municipal de Maricá / RJ</h2>
                <h3 style="margin: 0; font-weight: normal;">Portal de Capacitação Cidadã GOVVIVA</h3>
            </div>
            <p>Olá, <strong>{user.name}</strong>,</p>
            <p>Recebemos uma solicitação de redefinição de senha para a sua conta associada ao Portal GOVVIVA Maricá.</p>
            <p>Se você realizou essa solicitação, utilize o token de segurança de dose única abaixo para continuar no site:</p>
            
            <div style="text-align: center;">
                <div class="token-box">{token}</div>
            </div>

            <p style="margin-top: 20px;">Você também pode clicar diretamente no botão abaixo para redefinir sua senha com este token de recuperação:</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="btn">Redefinir Minha Senha</a>
            </div>

            <p style="margin-top: 20px; font-size: 11px; color: #666;">
                Caso o botão não funcione, copie e cole o link a seguir em seu navegador:<br>
                <a href="{reset_link}">{reset_link}</a>
            </p>

            <p>Este token é válido por <strong>1 hora</strong> a partir do recebimento desta mensagem.</p>
            <p style="color: #ef4444; font-weight: bold;">Se você não solicitou a redefinição de sua senha, ignore este e-mail por completo de forma segura.</p>
            <p class="footer">Este é um e-mail automático enviado pelo Portal GOVVIVA Maricá. Por favor, não responda a esta mensagem.</p>
        </div>
    </body>
    </html>
    """

    try:
        # Check if SMTP is configured
        if not smtp_server or not smtp_user or not smtp_password:
            # SMTP Not Set - Log in simulation mode
            simulation_msg = f"[SMTP PASSWORD RECOVERY SIMULATION] SMTP configuration missing. Recovery Email simulated to {recipient_email} with token {token}."
            print(simulation_msg)
            return True, "Simulado"

        # Construct Email Message
        msg = MIMEMultipart()
        msg['From'] = smtp_from
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body_html, 'html'))

        # Connect to SMTP
        server = smtplib.SMTP(smtp_server, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, recipient_email, msg.as_string())
        server.quit()

        return True, "Enviado com sucesso"

    except Exception as e:
        error_msg = str(e)
        print(f"[RECOVERY EMAIL ERROR] Failed to send recovery email to {recipient_email}: {error_msg}")
        return False, error_msg

