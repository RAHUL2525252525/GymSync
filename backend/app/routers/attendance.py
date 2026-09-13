from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/checkin", response_model=schemas.AttendanceOut)
def check_in(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = models.Attendance(user_id=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/checkout/{attendance_id}", response_model=schemas.AttendanceOut)
def check_out(attendance_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    record = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id,
        models.Attendance.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.check_out = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=List[schemas.AttendanceOut])
def my_attendance(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Attendance).filter(models.Attendance.user_id == current_user.id).all()


@router.get("/", response_model=List[schemas.AttendanceOut])
def all_attendance(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    return db.query(models.Attendance).all()
