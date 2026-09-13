import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .database import Base, engine, SessionLocal
from . import models, auth
from .routers import auth as auth_router
from .routers import members, plans, trainers, memberships, attendance, payments, dashboard

app = FastAPI(title="Gym Membership Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def wait_for_db_and_create_tables(retries: int = 10, delay: int = 3):
    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            print(f"Database not ready, retrying ({attempt + 1}/{retries})...")
            time.sleep(delay)
    raise RuntimeError("Could not connect to the database after several retries")


def seed_admin():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "srinivasrahul838@gmail.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Rahul@838")
        existing = db.query(models.User).filter(models.User.email == admin_email).first()
        if not existing:
            admin = models.User(
                name="Admin",
                email=admin_email,
                password_hash=auth.hash_password(admin_password),
                role=models.RoleEnum.admin,
            )
            db.add(admin)
            db.commit()
            print(f"Seeded admin user: {admin_email}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    wait_for_db_and_create_tables()
    seed_admin()


app.include_router(auth_router.router)
app.include_router(members.router)
app.include_router(plans.router)
app.include_router(trainers.router)
app.include_router(memberships.router)
app.include_router(attendance.router)
app.include_router(payments.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Gym Membership Tracker API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
