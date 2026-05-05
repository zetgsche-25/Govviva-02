import sqlite3
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuração
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///govviva.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default='CITIZEN')
    org_id = db.Column(db.String(50), nullable=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date_start = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    total_slots = db.Column(db.Integer, nullable=False)
    available_slots = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='PUBLISHED') # PUBLISHED, DRAFT, CANCELLED
    category = db.Column(db.String(50))
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    status = db.Column(db.String(20), default='CONFIRMED')
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),)

# --- ROTAS / API ---
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.filter_by(status='PUBLISHED').order_by(Event.date_start).all()
    return jsonify([{
        "id": e.id,
        "title": e.title,
        "description": e.description,
        "date_start": e.date_start.isoformat(),
        "location": e.location,
        "available_slots": e.available_slots,
        "total_slots": e.total_slots,
        "category": e.category
    } for e in events])

@app.route('/api/registrations', methods=['POST'])
def register():
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')

    event = Event.query.get(event_id)
    
    # Validações de Regra de Negócio
    if not event or event.status != 'PUBLISHED':
        return jsonify({"error": "Evento indisponível"}), 404
        
    if event.available_slots <= 0:
        return jsonify({"error": "Vagas esgotadas"}), 400

    existing = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({"error": "Usuário já inscrito"}), 400

    try:
        new_reg = Registration(user_id=user_id, event_id=event_id)
        event.available_slots -= 1
        db.session.add(new_reg)
        db.session.commit()
        return jsonify({"success": True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
