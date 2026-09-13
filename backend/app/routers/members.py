from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/members", tags=["Members"])


@router.get("/", response_model=List[schemas.UserOut])
def list_members(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    return db.query(models.User).filter(models.User.role == models.RoleEnum.member).all()


@router.get("/{member_id}", response_model=schemas.UserOut)
def get_member(member_id: int, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    member = db.query(models.User).filter(models.User.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member


@router.put("/{member_id}", response_model=schemas.UserOut)
def update_member(member_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    member = db.query(models.User).filter(models.User.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if payload.name is not None:
        member.name = payload.name
    if payload.phone is not None:
        member.phone = payload.phone
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    member = db.query(models.User).filter(models.User.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"detail": "Member deleted"}
