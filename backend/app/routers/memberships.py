from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/memberships", tags=["Memberships"])


@router.get("/", response_model=List[schemas.MembershipOut])
def list_memberships(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    return db.query(models.Membership).all()


@router.get("/me", response_model=List[schemas.MembershipOut])
def my_memberships(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Membership).filter(models.Membership.user_id == current_user.id).all()


@router.post("/", response_model=schemas.MembershipOut)
def create_membership(payload: schemas.MembershipCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    membership = models.Membership(**payload.dict())
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/{membership_id}/status")
def update_status(membership_id: int, status: str, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    membership = db.query(models.Membership).filter(models.Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    membership.status = status
    db.commit()
    return {"detail": "Status updated"}
