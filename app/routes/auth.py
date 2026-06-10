from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User
from ..services import UserService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user, error = UserService.create_user(
        data.get('name'), 
        data.get('email'), 
        data.get('password'),
        data.get('role', 'CITIZEN'),
        data.get('org_id')
    )
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Usuário criado!", "user": user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({"error": "Credenciais inválidas"}), 401
    
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict())
