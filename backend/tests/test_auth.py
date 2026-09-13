def test_register_new_user(client):
    response = client.post("/api/auth/register", json={
        "name": "John Doe",
        "email": "john@example.com",
        "password": "SecurePass123",
        "phone": "9999999999",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["role"] == "member"


def test_register_duplicate_email_fails(client):
    payload = {
        "name": "Jane",
        "email": "jane@example.com",
        "password": "pass123",
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400


def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Alice",
        "email": "alice@example.com",
        "password": "mypassword",
    })
    response = client.post("/api/auth/login", json={
        "email": "alice@example.com",
        "password": "mypassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "member"


def test_login_wrong_password_fails(client):
    client.post("/api/auth/register", json={
        "name": "Bob",
        "email": "bob@example.com",
        "password": "correctpass",
    })
    response = client.post("/api/auth/login", json={
        "email": "bob@example.com",
        "password": "wrongpass",
    })
    assert response.status_code == 401


def test_get_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
