from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])

import secrets

@router.post("/forgot-password", response_model=schemas.ForgotPasswordResponse)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    temp_password = secrets.token_urlsafe(6)
    user.password_hash = auth.hash_password(temp_password)
    db.commit()

    return schemas.ForgotPasswordResponse(
        message="Password reset successful. Use this temporary password to log in, then change it.",
        temporary_password=temp_password,
    )

@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=auth.hash_password(payload.password),
        phone=payload.phone,
        role=models.RoleEnum.member,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token,
        role=user.role.value,
        name=user.name,
        user_id=user.id,
    )


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
