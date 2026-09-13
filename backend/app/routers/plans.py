from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/plans", tags=["Plans"])


@router.get("/", response_model=List[schemas.PlanOut])
def list_plans(db: Session = Depends(get_db), _: models.User = Depends(auth.get_current_user)):
    return db.query(models.Plan).all()


@router.post("/", response_model=schemas.PlanOut)
def create_plan(payload: schemas.PlanCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    plan = models.Plan(**payload.dict())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.put("/{plan_id}", response_model=schemas.PlanOut)
def update_plan(plan_id: int, payload: schemas.PlanCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for key, value in payload.dict().items():
        setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"detail": "Plan deleted"}
