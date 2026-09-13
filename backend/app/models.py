from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class RoleEnum(str, enum.Enum):
    admin = "admin"
    member = "member"


class StatusEnum(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.member, nullable=False)
    joined_date = Column(DateTime(timezone=True), server_default=func.now())

    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    duration_months = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)

    memberships = relationship("Membership", back_populates="plan")


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.active)

    user = relationship("User", back_populates="memberships")
    plan = relationship("Plan", back_populates="memberships")
    trainer = relationship("Trainer")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(DateTime(timezone=True), server_default=func.now())
    check_out = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="attendances")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(30), default="paid")

    user = relationship("User", back_populates="payments")
