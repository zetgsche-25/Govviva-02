from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Notification, User
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

def create_notification(user_id, title, message):
    """
    Programmatically logs an alert/notification for a citizen inside GOVVIVA.
    """
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.session.add(notif)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[NOTIFICATION RECOGNITION ERROR] Failed to record notification for user {user_id}: {e}")
        return False

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    
    # Verify user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 444

    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        "success": True,
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count
    }), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(notification_id):
    user_id = get_jwt_identity()
    
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notificação não encontrada"}), 404

    notif.is_read = True
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Notificação marcada como lida.",
        "notification": notif.to_dict()
    }), 200

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    user_id = get_jwt_identity()
    
    # Mark all unread notifications of user as read
    unread_notifs = Notification.query.filter_by(user_id=user_id, is_read=False).all()
    for notif in unread_notifs:
        notif.is_read = True
    
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Todas as notificações foram marcadas como lidas."
    }), 200

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    user_id = get_jwt_identity()
    
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notificação não encontrada"}), 404

    db.session.delete(notif)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Notificação removida do histórico."
    }), 200
