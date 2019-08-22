from flask import jsonify

class ErrorResponse:

    def __init__(self, type, msg=''):
        self.type = type
        self.msg = msg

    def to_dict(self):
        return { 'error': { 'type': self.type, 'message': self.msg } }

    def to_json(self):
        return jsonify(self.to_dict())
