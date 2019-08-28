from flask import Blueprint
import jwt
from sqlalchemy.exc import IntegrityError
from restock.utils.errors import ErrorResponse

errors = Blueprint('errors', __name__)


@errors.app_errorhandler(jwt.ExpiredSignatureError)
def handle_expired_token(err):
    print('ExpiredSignatureError:', err)
    return ErrorResponse('Authentication', 'Token signature expired.').to_json(), 401


@errors.app_errorhandler(jwt.InvalidTokenError)
def handle_expired_token(err):
    print('InvalidTokenError:', err)
    return ErrorResponse('Authentication', 'Invalid token.').to_json(), 401


@errors.app_errorhandler(AssertionError)
def handle_invalid_funds(err):
    print('AssertionError:', err)

    if 'Invalid funds' in str(err):
        return ErrorResponse('Balance',
                             'Not enough funds in user balance for transaction.').to_json(), 400
    if 'Invalid shares' in str(err):
        return ErrorResponse('Input Type',
                             'Number of shares must be a nonzero integer.').to_json(), 400
    if 'Not enough shares' in str(err):
        return ErrorResponse('Shares',
                             'Not enough shares in stock to sell.').to_json(), 400

    return ErrorResponse('Server', 'Server error.').to_json(), 500


@errors.app_errorhandler(IntegrityError)
def handle_integrity_error(err):
    print('IntegrityError:', err.orig, err.params)

    error_res = ErrorResponse('Integrity')
    error_str = str(err.orig)
    if 'UNIQUE' in error_str and 'username' in error_str:
        error_res.type = 'Unique Credentials'
        error_res.msg = 'Username must be unique.'
    if 'UNIQUE' in error_str and 'email' in error_str:
        error_res.type = 'Unique Credentials'
        error_res.msg = 'Email must be unique.'

    return error_res.to_json(), 400


@errors.app_errorhandler(KeyError)
def handle_key_error(err):
    print('KeyError:', err)

    error_res = ErrorResponse('Key')
    if err.args[0] in ('password', 'username', 'email', 'symbol', 'shares', 'short'):
        error_res.type = 'Missing Field'
        error_res.msg = 'No {} field provided.'.format(err.args[0])

    return error_res.to_json(), 400


@errors.app_errorhandler(404)
def handle_404(err):
    return ErrorResponse('404', 'No such URL endpoint.').to_json(), 404
