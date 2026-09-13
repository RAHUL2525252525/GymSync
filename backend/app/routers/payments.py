from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("/", response_model=List[schemas.PaymentOut])
def list_payments(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    return db.query(models.Payment).all()


@router.get("/me", response_model=List[schemas.PaymentOut])
def my_payments(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).filter(models.Payment.user_id == current_user.id).all()


@router.post("/", response_model=schemas.PaymentOut)
def record_payment(payload: schemas.PaymentCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    payment = models.Payment(**payload.dict())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
