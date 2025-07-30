from flask_cors import CORS
from api.utils import generate_sitemap, APIException
from api.models import db, User, MouseGameStats, KeyboardGameStats
from flask import Flask, request, jsonify, url_for, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import re
import secrets
import jwt
import datetime

api = Blueprint('api', __name__)
# Allow CORS requests to this API
CORS(api, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

SECRET_KEY = "super-secret"  # Cambia esto por una variable de entorno en producción


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'msg': 'Token no proporcionado'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'msg': 'Usuario no encontrado'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'msg': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'msg': 'Token inválido'}), 401

        return f(current_user, *args, **kwargs)
    return decorated


def is_valid_username(username):
    return re.fullmatch(r'^[a-zA-Z0-9_]{4,}$', username) is not None


def is_valid_password(password):
    return len(password) >= 8


@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    required_fields = ['username', 'email', 'password',
                       'verify_password', 'age', 'country']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'msg': 'Todos los campos son obligatorios.'}), 400

    username = data['username']
    email = data['email']
    password = data['password']
    verify_password = data['verify_password']
    age = data['age']
    country = data['country']

    if not is_valid_username(username):
        return jsonify({'msg': 'El nombre de usuario debe tener al menos 4 caracteres alfanuméricos o guion bajo.'}), 400
    if not is_valid_password(password):
        return jsonify({'msg': 'La contraseña debe tener al menos 8 caracteres.'}), 400
    if password != verify_password:
        return jsonify({'msg': 'Las contraseñas no coinciden.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'msg': 'El nombre de usuario ya existe.'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'El correo ya está registrado.'}), 409

    hashed_password = generate_password_hash(password)
    verification_token = secrets.token_urlsafe(32)

    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        age=age,
        country=country,
        is_active=False,
        is_verified=False,
        verification_token=verification_token
    )
    db.session.add(new_user)
    db.session.commit()

    # Omite el envío de correo de verificación para pruebas locales

    return jsonify({'msg': 'Usuario registrado correctamente.', 'user': new_user.serialize()}), 201


@api.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Email y contraseña requeridos.'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'msg': 'Credenciales inválidas.'}), 401

    payload = {
        # Convert UUID to string for JSON serialization
        'user_id': str(user.id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    return jsonify({
        'msg': 'Login exitoso.',
        'token': token,
        'user': user.serialize()
    }), 200


@api.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'msg': 'Perfil obtenido correctamente.',
        'user': current_user.serialize()
    }), 200


@api.route('/game', methods=['GET'])
@token_required
def get_game_access(current_user):
    return jsonify({
        'msg': 'Acceso al juego autorizado.',
        'user': current_user.serialize(),
        'game_data': {
            'authorized': True,
            'player_id': current_user.id,
            'username': current_user.username
        }
    }), 200


@api.route('/stats/<string:input_method>', methods=['GET'])
@token_required
def get_stats(current_user, input_method):
    if input_method not in ['mouse', 'keyboard']:
        return jsonify({'msg': 'Método de entrada inválido. Debe ser "mouse" o "keyboard".'}), 400

    if input_method == 'mouse':
        stats = MouseGameStats.query.filter_by(user_id=current_user.id).all()
    else:
        stats = KeyboardGameStats.query.filter_by(
            user_id=current_user.id).all()

    if not stats:
        return jsonify({'msg': 'No hay estadísticas disponibles.'}), 404

    return jsonify({
        'msg': 'Estadísticas obtenidas correctamente.',
        'stats': [stat.serialize() for stat in stats]
    }), 200


@api.route('/stats/<string:input_method>', methods=['POST'])
@token_required
def add_game_stat(current_user, input_method):
    if input_method not in ['mouse', 'keyboard']:
        return jsonify({'msg': 'Método de entrada inválido. Debe ser "mouse" o "keyboard".'}), 400

    data = request.get_json()

    # Crear una nueva entrada según el método de entrada
    if input_method == 'mouse':
        new_stat = MouseGameStats(
            user_id=current_user.id,
            zombies_killed_by_player=data.get('zombies_killed_by_player', 0),
            zombies_killed_by_environment=data.get(
                'zombies_killed_by_environment', 0),
            total_play_time=data.get('total_play_time', 0.0),
            bullets_fired=data.get('bullets_fired', 0),
            levels_completed=data.get('levels_completed', 0)
        )
    else:
        new_stat = KeyboardGameStats(
            user_id=current_user.id,
            zombies_killed_by_player=data.get('zombies_killed_by_player', 0),
            zombies_killed_by_environment=data.get(
                'zombies_killed_by_environment', 0),
            total_play_time=data.get('total_play_time', 0.0),
            bullets_fired=data.get('bullets_fired', 0),
            levels_completed=data.get('levels_completed', 0),
            typing_accuracy=data.get('typing_accuracy', 0.0)
        )

    new_stat.calculate_score()
    db.session.add(new_stat)
    db.session.commit()

    return jsonify({'msg': 'Estadística de juego registrada correctamente.', 'stat': new_stat.serialize()}), 201


@api.route('/leaderboard/<string:input_method>', methods=['GET'])
def get_leaderboard(input_method):
    if input_method not in ['mouse', 'keyboard']:
        return jsonify({'msg': 'Método de entrada inválido. Debe ser "mouse" o "keyboard".'}), 400

    if input_method == 'mouse':
        StatsModel = MouseGameStats
    else:
        StatsModel = KeyboardGameStats

    leaderboard = db.session.query(
        User.username, db.func.max(StatsModel.score).label('highscore')
    ).join(StatsModel).group_by(User.username).order_by(
        db.desc('highscore')).limit(10).all()

    return jsonify({
        'msg': f'Leaderboard para {input_method} obtenido correctamente.',
        'leaderboard': [{'username': row.username, 'highscore': row.highscore} for row in leaderboard]
    }), 200
