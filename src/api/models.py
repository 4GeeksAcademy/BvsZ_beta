from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid


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
