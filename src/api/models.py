from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy import ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime


db = SQLAlchemy()


class User(db.Model):
    id: Mapped[str] = mapped_column(UUID(
        as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(
        nullable=False)  # Debe almacenarse encriptada
    age: Mapped[int] = mapped_column(nullable=False)
    country: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=False)
    is_verified: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=False)
    verification_token: Mapped[str] = mapped_column(String(128), nullable=True)
    password_reset_code: Mapped[str] = mapped_column(String(4), nullable=True)
    verification_code: Mapped[str] = mapped_column(String(4), nullable=True)

    # Relaciones con los modelos de estadísticas
    mouse_stats = relationship("MouseGameStats", back_populates="user")
    keyboard_stats = relationship("KeyboardGameStats", back_populates="user")

    def serialize(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "age": self.age,
            "country": self.country,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            # No serializar password ni token por seguridad
        }

    def get_highscore(self, input_method):
        if input_method == 'mouse':
            highest_score = db.session.query(db.func.max(
                MouseGameStats.score)).filter_by(user_id=self.id).scalar()
            return highest_score or 0
        elif input_method == 'keyboard':
            highest_score = db.session.query(db.func.max(
                KeyboardGameStats.score)).filter_by(user_id=self.id).scalar()
            return highest_score or 0
        return 0


class BaseGameStats:
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    zombies_killed_by_player: Mapped[int] = mapped_column(Integer, default=0)
    zombies_killed_by_environment: Mapped[int] = mapped_column(
        Integer, default=0)
    total_play_time: Mapped[float] = mapped_column(Float, default=0.0)
    bullets_fired: Mapped[int] = mapped_column(Integer, default=0)
    levels_completed: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        default=datetime.datetime.utcnow)

    def base_serialize(self):
        return {
            "zombies_killed_by_player": self.zombies_killed_by_player,
            "zombies_killed_by_environment": self.zombies_killed_by_environment,
            "total_play_time": self.total_play_time,
            "bullets_fired": self.bullets_fired,
            "levels_completed": self.levels_completed,
            "score": self.score,
            "created_at": self.created_at.isoformat()
        }


class MouseGameStats(db.Model, BaseGameStats):
    __tablename__ = 'mouse_game_stats'

    user = relationship("User", back_populates="mouse_stats")

    def calculate_score(self):
        self.score = (
            self.zombies_killed_by_player * 10 +
            self.zombies_killed_by_environment * 5 +
            self.levels_completed * 50 +
            self.bullets_fired * -0.1 +
            self.total_play_time * -0.01
        )
        return self.score

    def serialize(self):
        return {
            **self.base_serialize(),
            "input_method": "mouse"
        }


class KeyboardGameStats(db.Model, BaseGameStats):
    __tablename__ = 'keyboard_game_stats'

    typing_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    user = relationship("User", back_populates="keyboard_stats")

    def calculate_score(self):
        self.score = (
            self.zombies_killed_by_player * 10 +
            self.zombies_killed_by_environment * 5 +
            self.levels_completed * 50 +
            self.bullets_fired * -0.1 +
            self.typing_accuracy * 20 +
            self.total_play_time * -0.01
        )
        return self.score

    def serialize(self):
        return {
            **self.base_serialize(),
            "typing_accuracy": self.typing_accuracy,
            "input_method": "keyboard"
        }
