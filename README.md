# 🏋️ Gym Membership Tracker

Full-stack gym membership management system with separate **Admin** and **Member** dashboards.

## Tech Stack
- **Frontend:** React.js + Vite (JSX, inline styles/logic per page, react-router-dom, axios)
- **Backend:** FastAPI (Python), JWT authentication
- **Database:** MySQL
- **Testing:** pytest (backend unit tests) + Postman collection (API testing)
- **Containerization:** Docker & Docker Compose

> Note: JUnit is a Java testing framework and doesn't apply to a Python/React stack.
> This project uses **pytest** for backend tests instead — the direct Python equivalent.

## Features
### Admin Dashboard
- Overview stats (total members, active memberships, revenue, today's check-ins)
- Manage members (view/delete)
- Manage membership plans (create/delete)
- Manage trainers (create/delete)
- Assign memberships to members
- Record and view payments

### Member Dashboard
- Personal overview (visits, total paid, membership status)
- Gym check-in / check-out (attendance tracking)
- View attendance history
- View assigned membership details
- View payment history

## Default Admin Login
```
Email: srinivasrahul838@gmail.com
Password: Rahul@838
```
This admin account is auto-seeded into the database on backend startup (see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`).

---

## 🚀 Option 1: Run Everything with Docker (Recommended)

Prerequisite: Docker Desktop installed and running.

```bash
cd gym-tracker
docker-compose up --build
```

This starts:
- MySQL on `localhost:3306`
- FastAPI backend on `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)
- React frontend on `http://localhost:3000`

Open `http://localhost:3000` in your browser and log in.

To stop:
```bash
docker-compose down
```

To stop and wipe the database:
```bash
docker-compose down -v
```

---

## 🛠️ Option 2: Run Manually (without Docker)

### 1. MySQL
Create a database and user matching `backend/.env`:
```sql
CREATE DATABASE gym_tracker;
CREATE USER 'gymuser'@'%' IDENTIFIED BY 'gympassword';
GRANT ALL PRIVILEGES ON gym_tracker.* TO 'gymuser'@'%';
FLUSH PRIVILEGES;
```
Update `backend/.env` → set `DB_HOST=localhost`.

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`. Tables and the admin user are created automatically on startup.

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## ✅ Running Backend Tests (pytest)
Tests use an in-memory SQLite DB, so no MySQL connection is needed to run them.
```bash
cd backend
pip install -r requirements.txt
pytest -v
```

## 📮 API Testing with Postman
Import `postman_collection.json` into Postman.
1. Run **Login Admin** or **Login Member** first.
2. Copy the `access_token` from the response into the `token` collection variable.
3. All other requests use `{{token}}` automatically via the Authorization header.

Full interactive API docs are also available at `http://localhost:8000/docs` (Swagger UI) once the backend is running.

---

## 📁 Project Structure
```
gym-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entrypoint, seeds admin on startup
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # DB models (User, Plan, Trainer, Membership, Attendance, Payment)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT + password hashing + role guards
│   │   └── routers/           # auth, members, plans, trainers, memberships, attendance, payments, dashboard
│   ├── tests/                 # pytest tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                   # DB + JWT + admin credentials
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login + Register (HTML/CSS/logic in one file)
│   │   │   ├── AdminDashboard.jsx # Full admin panel (HTML/CSS/logic in one file)
│   │   │   └── UserDashboard.jsx  # Member panel (HTML/CSS/logic in one file)
│   │   ├── App.jsx             # Routing + protected routes
│   │   ├── api.js              # Axios instance with JWT interceptor
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── postman_collection.json
└── README.md
```

## Database Schema (MySQL)
- **users** — id, name, email, password_hash, phone, role (admin/member), joined_date
- **plans** — id, name, duration_months, price, description
- **trainers** — id, name, specialization, phone
- **memberships** — id, user_id, plan_id, trainer_id, start_date, end_date, status
- **attendance** — id, user_id, check_in, check_out
- **payments** — id, user_id, membership_id, amount, payment_date, status

## Opening in VS Code
1. Unzip the project.
2. Open the `gym-tracker` folder in VS Code.
3. Open two terminals: one for `backend/`, one for `frontend/` (or just run `docker-compose up --build` from the root).
