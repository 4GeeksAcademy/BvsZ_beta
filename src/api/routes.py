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
CORS(api, supports_credentials=True)


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
    
    # Enviar código de verificación por correo al registrarse
    from api.utils import send_email_via_brevo
    import random

    code = str(random.randint(1000, 9999))
    new_user.verification_code = code
    db.session.commit()

    html = f"<p>Tu código de verificación es: <strong>{code}</strong></p>"
    send_email_via_brevo(email, "Código de verificación", html)

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
    
    if not user.is_verified:
        return jsonify({'msg': 'Tu cuenta no está verificada. Revisa tu correo electrónico.'}), 403

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
        stat = MouseGameStats.query.filter_by(user_id=current_user.id).first()
    else:
        stat = KeyboardGameStats.query.filter_by(
            user_id=current_user.id).first()

    if not stat:
        return jsonify({'msg': 'No hay estadísticas disponibles.'}), 404

    return jsonify({
        'msg': 'Estadísticas obtenidas correctamente.',
        'stats': stat.serialize()
    }), 200


@api.route('/stats/<string:input_method>', methods=['POST'])
@token_required
def add_game_stat(current_user, input_method):
    if input_method not in ['mouse', 'keyboard']:
        return jsonify({'msg': 'Método de entrada inválido. Debe ser "mouse" o "keyboard".'}), 400

    data = request.get_json()

    # Verificar si el usuario ya tiene estadísticas para este método de entrada
    if input_method == 'mouse':
        existing_stat = MouseGameStats.query.filter_by(
            user_id=current_user.id).first()

        if existing_stat:
            # Actualizar las estadísticas existentes sumando los nuevos valores
            existing_stat.zombies_killed_by_player += data.get(
                'zombies_killed_by_player', 0)
            existing_stat.zombies_killed_by_environment += data.get(
                'zombies_killed_by_environment', 0)
            existing_stat.total_play_time += data.get('total_play_time', 0.0)
            existing_stat.bullets_fired += data.get('bullets_fired', 0)
            existing_stat.levels_completed += data.get('levels_completed', 0)

            # Calcular el nuevo puntaje
            existing_stat.calculate_score()
            db.session.commit()

            return jsonify({'msg': 'Estadística de juego actualizada correctamente.', 'stat': existing_stat.serialize()}), 200
        else:
            # Crear una nueva entrada si no existe
            new_stat = MouseGameStats(
                user_id=current_user.id,
                zombies_killed_by_player=data.get(
                    'zombies_killed_by_player', 0),
                zombies_killed_by_environment=data.get(
                    'zombies_killed_by_environment', 0),
                total_play_time=data.get('total_play_time', 0.0),
                bullets_fired=data.get('bullets_fired', 0),
                levels_completed=data.get('levels_completed', 0)
            )
    else:
        existing_stat = KeyboardGameStats.query.filter_by(
            user_id=current_user.id).first()

        if existing_stat:
            # Para el typing_accuracy, calculamos el promedio ponderado basado en las sesiones anteriores
            new_accuracy = data.get('typing_accuracy', 0.0)

            if new_accuracy > 0:
                # Si hay un nuevo valor de precisión, calculamos el promedio
                # Considerando el tiempo de juego como peso para el promedio
                prev_weight = existing_stat.total_play_time
                new_weight = data.get('total_play_time', 0.0)

                if prev_weight + new_weight > 0:
                    # Calculamos el promedio ponderado
                    existing_stat.typing_accuracy = (
                        (existing_stat.typing_accuracy * prev_weight) +
                        (new_accuracy * new_weight)
                    ) / (prev_weight + new_weight)

            # Actualizar las estadísticas existentes sumando los nuevos valores
            existing_stat.zombies_killed_by_player += data.get(
                'zombies_killed_by_player', 0)
            existing_stat.zombies_killed_by_environment += data.get(
                'zombies_killed_by_environment', 0)
            existing_stat.total_play_time += data.get('total_play_time', 0.0)
            existing_stat.bullets_fired += data.get('bullets_fired', 0)
            existing_stat.levels_completed += data.get('levels_completed', 0)

            # Calcular el nuevo puntaje
            existing_stat.calculate_score()
            db.session.commit()

            return jsonify({'msg': 'Estadística de juego actualizada correctamente.', 'stat': existing_stat.serialize()}), 200
        else:
            # Crear una nueva entrada si no existe
            new_stat = KeyboardGameStats(
                user_id=current_user.id,
                zombies_killed_by_player=data.get(
                    'zombies_killed_by_player', 0),
                zombies_killed_by_environment=data.get(
                    'zombies_killed_by_environment', 0),
                total_play_time=data.get('total_play_time', 0.0),
                bullets_fired=data.get('bullets_fired', 0),
                levels_completed=data.get('levels_completed', 0),
                typing_accuracy=data.get('typing_accuracy', 0.0)
            )

    # Si llegamos aquí, significa que estamos creando una nueva entrada
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
        # Consulta para obtener todas las estadísticas relevantes
        stats_query = db.session.query(
            User.username,
            StatsModel.score,
            StatsModel.zombies_killed_by_player,
            StatsModel.zombies_killed_by_environment,
            StatsModel.total_play_time,
            StatsModel.bullets_fired,
            StatsModel.levels_completed
        ).join(User).order_by(StatsModel.score.desc()).all()
        
        leaderboard = [{
            'username': row.username,
            'score': row.score,
            'zombies_killed_by_player': row.zombies_killed_by_player,
            'zombies_killed_by_environment': row.zombies_killed_by_environment,
            'total_play_time': row.total_play_time,
            'bullets_fired': row.bullets_fired,
            'levels_completed': row.levels_completed
        } for row in stats_query]
    else:
        StatsModel = KeyboardGameStats
        # Consulta para obtener todas las estadísticas relevantes, incluyendo typing_accuracy
        stats_query = db.session.query(
            User.username,
            StatsModel.score,
            StatsModel.zombies_killed_by_player,
            StatsModel.zombies_killed_by_environment,
            StatsModel.total_play_time,
            StatsModel.bullets_fired,
            StatsModel.levels_completed,
            StatsModel.typing_accuracy
        ).join(User).order_by(StatsModel.score.desc()).all()
        
        leaderboard = [{
            'username': row.username,
            'score': row.score,
            'zombies_killed_by_player': row.zombies_killed_by_player,
            'zombies_killed_by_environment': row.zombies_killed_by_environment,
            'total_play_time': row.total_play_time,
            'bullets_fired': row.bullets_fired,
            'levels_completed': row.levels_completed,
            'typing_accuracy': row.typing_accuracy
        } for row in stats_query]

    return jsonify({
        'msg': f'Leaderboard para {input_method} obtenido correctamente.',
        'leaderboard': leaderboard
    }), 200

@api.route('/verify/send-code', methods=['POST'])
def send_verification_code():
    from api.utils import send_email_via_brevo
    import random

    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    code = str(random.randint(1000, 9999))
    user.verification_code = code
    db.session.commit()

    html = f"<p>Tu código de verificación es: <strong>{code}</strong></p>"
    send_email_via_brevo(email, "Código de verificación", html)

    return jsonify({'msg': 'Código enviado al correo.'}), 200

@api.route('/password/send-reset-code', methods=['POST'])
def send_password_reset_code():
    from api.utils import send_email_via_brevo
    import random

    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    code = str(random.randint(1000, 9999))
    user.password_reset_code = code
    db.session.commit()

    html = f"<p>Tu código para restaurar contraseña es: <strong>{code}</strong></p>"
    send_email_via_brevo(email, "Restaurar contraseña", html)

    return jsonify({'msg': 'Código de restauración enviado al correo.'}), 200

@api.route('/password/verify-reset-code', methods=['POST'])
def verify_password_reset_code():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    if user.password_reset_code != code:
        return jsonify({'msg': 'Código incorrecto'}), 400

    return jsonify({'msg': 'Código válido. Procede al cambio de contraseña.'}), 200

@api.route('/password/reset', methods=['PUT'])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    if user.password_reset_code != code:
        return jsonify({'msg': 'Código incorrecto'}), 400

    if not new_password or len(new_password) < 8:
        return jsonify({'msg': 'La nueva contraseña debe tener al menos 8 caracteres.'}), 400

    if new_password != confirm_password:
        return jsonify({'msg': 'Las contraseñas no coinciden.'}), 400

    user.password = generate_password_hash(new_password)
    user.password_reset_code = None  # Limpia el código
    db.session.commit()

    return jsonify({'msg': 'Contraseña restablecida correctamente.'}), 200



@api.route('/verify/code', methods=['POST'])
def verify_user_code():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    if user.verification_code != code:
        return jsonify({'msg': 'Código incorrecto'}), 400

    user.is_verified = True
    user.verification_code = None
    db.session.commit()

    return jsonify({'msg': 'Cuenta verificada correctamente.'}), 200

@api.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response
