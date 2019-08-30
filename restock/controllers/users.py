from flask import Blueprint, jsonify

from restock.models.user import User
from restock.utils.errors import ErrorResponse

users = Blueprint('users', __name__)


@users.route('/', methods=['GET'])
def get_all_users():
    users = User.query.order_by(User.worth.desc()).all()
    serialized_users = [u.to_dict() for u in users]
    return jsonify(serialized_users), 200


@users.route('/leaderboard', methods=['GET'])
def get_top_users():
    users = User.query.order_by(User.worth.desc()).limit(100).all()
    serialized_users = [u.to_dict() for u in users]
    return jsonify(serialized_users), 200


@users.route('/<int:id>', methods=['GET'])
def get_user_by_id(id):
    user = User.query.get(id)
    if user:
        return jsonify(user.to_dict()), 200
    return ErrorResponse('Not Found',
                         'No user with ID {} exists.'.format(id)).to_json(), 404
