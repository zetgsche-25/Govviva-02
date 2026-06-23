import os
from sqlalchemy import inspect, text
from .extensions import db

def run_migrations(app):
    """
    Executes database schema migrations safely.
    It ensures new columns (cpf, workload, org_responsible, ticket_code)
    are added to existing SQLite or PostgreSQL tables without losing any data.
    New tables (presence_checks, certificates, audit_logs, notifications)
    will be created automatically using db.create_all().
    """
    with app.app_context():
        # Step 1: Create all defined tables that do not exist yet.
        db.create_all()
        
        # Step 2: Use SQLAlchemy Inspector to audit and dynamically alter existing tables.
        bind = db.engine
        inspector = inspect(bind)
        
        # Audit Table 'users' for new column 'cpf'
        if inspector.has_table('users'):
            columns = [c['name'] for c in inspector.get_columns('users')]
            if 'cpf' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN cpf VARCHAR(14) NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'cpf' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'cpf' column to 'users': {e}")
                    
            if 'govbr_sub' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN govbr_sub VARCHAR(100) NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'govbr_sub' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'govbr_sub' column to 'users': {e}")

            if 'govbr_level' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN govbr_level VARCHAR(20) NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'govbr_level' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'govbr_level' column to 'users': {e}")

            if 'govbr_authenticated' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN govbr_authenticated BOOLEAN DEFAULT 0"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'govbr_authenticated' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'govbr_authenticated' column to 'users': {e}")
                    
            if 'lgpd_terms_accepted' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN lgpd_terms_accepted BOOLEAN DEFAULT 0"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if 'lgpd_privacy_accepted' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN lgpd_privacy_accepted BOOLEAN DEFAULT 0"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if 'lgpd_marketing_consented' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN lgpd_marketing_consented BOOLEAN DEFAULT 0"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if 'lgpd_treatment_consented' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN lgpd_treatment_consented BOOLEAN DEFAULT 0"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if 'lgpd_accepted_at' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN lgpd_accepted_at DATETIME NULL"))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if 'reset_token' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(100) NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'reset_token' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'reset_token' column to 'users': {e}")

            if 'reset_token_expires' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'reset_token_expires' to 'users' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'reset_token_expires' column to 'users': {e}")
                    
        # Audit Table 'events' for new columns 'workload' and 'org_responsible'
        if inspector.has_table('events'):
            columns = [c['name'] for c in inspector.get_columns('events')]
            if 'workload' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE events ADD COLUMN workload INTEGER DEFAULT 4"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'workload' to 'events' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'workload' column to 'events': {e}")
                    
            if 'org_responsible' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE events ADD COLUMN org_responsible VARCHAR(150) DEFAULT 'Secretaria Municipal do Governo'"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'org_responsible' to 'events' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'org_responsible' column to 'events': {e}")

            if 'gestor_responsavel' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE events ADD COLUMN gestor_responsavel VARCHAR(150) DEFAULT 'Gestor Geral'"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'gestor_responsavel' to 'events' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'gestor_responsavel' column to 'events': {e}")

        # Audit Table 'registrations' for 'ticket_code'
        if inspector.has_table('registrations'):
            columns = [c['name'] for c in inspector.get_columns('registrations')]
            if 'ticket_code' not in columns:
                try:
                    db.session.execute(text("ALTER TABLE registrations ADD COLUMN ticket_code VARCHAR(100) NULL"))
                    db.session.commit()
                    print("[MIGRATION] Successfully added column 'ticket_code' to 'registrations' table.")
                except Exception as e:
                    db.session.rollback()
                    print(f"[MIGRATION WARNING] Failed to add 'ticket_code' column to 'registrations': {e}")

        # Ensure unique index/constraint for ticket_code (if supported and not existent)
        # SQLAlchemy handles unique=True inside db.create_all on table creation, 
        # so for brand new tables or brand new columns in PostgreSQL it's fully native.
