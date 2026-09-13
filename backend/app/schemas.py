from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    temporary_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    user_id: int


# ---------- User ----------
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    joined_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


# ---------- Plan ----------
class PlanCreate(BaseModel):
    name: str
    duration_months: int
    price: float
    description: Optional[str] = None


class PlanOut(PlanCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Trainer ----------
class TrainerCreate(BaseModel):
    name: str
    specialization: Optional[str] = None
    phone: Optional[str] = None


class TrainerOut(TrainerCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Membership ----------
class MembershipCreate(BaseModel):
    user_id: int
    plan_id: int
    trainer_id: Optional[int] = None
    start_date: date
    end_date: date


class MembershipOut(BaseModel):
    id: int
    user_id: int
    plan_id: int
    trainer_id: Optional[int] = None
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True


# ---------- Attendance ----------
class AttendanceOut(BaseModel):
    id: int
    user_id: int
    check_in: datetime
    check_out: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Payment ----------
class PaymentCreate(BaseModel):
    user_id: int
    membership_id: Optional[int] = None
    amount: float
    status: Optional[str] = "paid"


class PaymentOut(BaseModel):
    id: int
    user_id: int
    membership_id: Optional[int] = None
    amount: float
    payment_date: datetime
    status: str

    class Config:
        from_attributes = True
