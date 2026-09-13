def register_and_login(client, email, password, name="Test User"):
    client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


def make_admin(db_session, email):
    from app import models
    user = db_session.query(models.User).filter(models.User.email == email).first()
    user.role = models.RoleEnum.admin
    db_session.commit()


def test_member_cannot_list_members(client):
    token = register_and_login(client, "member1@example.com", "pass123")
    response = client.get("/api/members/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_can_list_members(client, db_session):
    token = register_and_login(client, "admin1@example.com", "adminpass")
    make_admin(db_session, "admin1@example.com")
    # re-login to get a fresh token reflecting admin role (role is embedded at login time)
    login_resp = client.post("/api/auth/login", json={"email": "admin1@example.com", "password": "adminpass"})
    token = login_resp.json()["access_token"]

    register_and_login(client, "member2@example.com", "pass123")

    response = client.get("/api/members/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_plan_requires_admin(client):
    token = register_and_login(client, "member3@example.com", "pass123")
    response = client.post(
        "/api/plans/",
        json={"name": "Gold Plan", "duration_months": 3, "price": 1500.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
