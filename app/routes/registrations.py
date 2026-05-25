from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import RegistrationService
from ..models import Registration, Event

registration_bp = Blueprint('registrations', __name__, strict_slashes=False)

@registration_bp.route('/', methods=['POST'])
@jwt_required()
def enroll():
    user_id = get_jwt_identity()
    data = request.get_json()
    reg, error = RegistrationService.enroll(user_id, data.get('event_id'))
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({"message": "Inscrição confirmada!", "id": reg.id}), 201

@registration_bp.route('/me', methods=['GET'])
@jwt_required()
def my_registrations():
    user_id = get_jwt_identity()
    regs = Registration.query.filter_by(user_id=user_id).all()
    
    # Detalhar eventos nas inscrições
    result = []
    for r in regs:
        ev = Event.query.get(r.event_id)
        result.append({
            "registration_id": r.id,
            "status": r.status,
            "event": ev.to_dict()
        })
    return jsonify(result)
