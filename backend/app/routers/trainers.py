from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/trainers", tags=["Trainers"])


@router.get("/", response_model=List[schemas.TrainerOut])
def list_trainers(db: Session = Depends(get_db), _: models.User = Depends(auth.get_current_user)):
    return db.query(models.Trainer).all()


@router.post("/", response_model=schemas.TrainerOut)
def create_trainer(payload: schemas.TrainerCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    trainer = models.Trainer(**payload.dict())
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer


@router.delete("/{trainer_id}")
def delete_trainer(trainer_id: int, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    trainer = db.query(models.Trainer).filter(models.Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    db.delete(trainer)
    db.commit()
    return {"detail": "Trainer deleted"}
