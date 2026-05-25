from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import EventService
from ..models import User

event_bp = Blueprint('events', __name__, strict_slashes=False)

@event_bp.route('/', methods=['GET'])
def list_events():
    events = EventService.list_active()
    return jsonify([e.to_dict() for e in events])

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
