from sqlalchemy import Boolean, Column, Integer, String, UniqueConstraint, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    isAdmin = Column(Boolean, default=False)
    image_url = Column(String, nullable=True) # Almacenamos URL o path
    contact = Column(String)
    is_active = Column(Boolean, default=True) # Útil para desactivar usuarios

    # Relación con las obras creadas
    works = relationship("Work", back_populates="creator", cascade="all, delete-orphan")

class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    work_number = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Relación con el usuario creador
    creator = relationship("User", back_populates="works")

