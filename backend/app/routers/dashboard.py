from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, auth
from ..database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/admin")
def admin_dashboard(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    total_members = db.query(models.User).filter(models.User.role == models.RoleEnum.member).count()
    active_memberships = db.query(models.Membership).filter(models.Membership.status == models.StatusEnum.active).count()
    total_trainers = db.query(models.Trainer).count()
    total_revenue = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).scalar()
    today_checkins = db.query(models.Attendance).filter(
        func.date(models.Attendance.check_in) == func.current_date()
    ).count()

    return {
        "total_members": total_members,
        "active_memberships": active_memberships,
        "total_trainers": total_trainers,
        "total_revenue": float(total_revenue),
        "today_checkins": today_checkins,
    }


@router.get("/user")
def user_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    membership = db.query(models.Membership).filter(
        models.Membership.user_id == current_user.id,
        models.Membership.status == models.StatusEnum.active,
    ).first()
    total_visits = db.query(models.Attendance).filter(models.Attendance.user_id == current_user.id).count()
    total_paid = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(
        models.Payment.user_id == current_user.id
    ).scalar()

    return {
        "name": current_user.name,
        "active_membership": {
            "plan_id": membership.plan_id,
            "start_date": str(membership.start_date),
            "end_date": str(membership.end_date),
            "status": membership.status.value,
        } if membership else None,
        "total_visits": total_visits,
        "total_paid": float(total_paid),
    }
