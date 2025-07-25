import os
# Set test secrets before importing app/config
os.environ["JWT_SECRET"] = "test-secret"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_EXPIRATION_HOURS"] = "24"
os.environ["UPLOAD_DIR"] = "uploads"
os.environ["MAX_FILE_SIZE"] = str(100 * 1024 * 1024)  # 100MB

import subprocess
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import models
from app.core.database import engine
from app.core.config import settings
from app.tasks.processing_tasks import process_file_task
from app.core.database import SessionLocal
from app.celery_app import celery_app
celery_app.conf.task_always_eager = True
celery_app.conf.task_eager_propagates = True
celery_app.conf.result_backend = "cache+memory://"

print("Using database:", settings.database_url)

client = TestClient(app)

def setup_module(module):
    # Remove the old test DB
    db_path = "lifelog_dev.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    # Create all tables
    models.Base.metadata.create_all(bind=engine)

def get_auth_token():
    payload = {"email": "demo@example.com", "password": "testpass"}
    response = client.post("/auth/demo", json=payload)
    assert response.status_code == 200
    return response.json()["access_token"]

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_timeline_invalid_date():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/timeline/?date_from=invalid-date", headers=headers)
    assert response.status_code == 400
    assert "Invalid date_from format" in response.json()["detail"]

def test_search_empty_query():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/search/", json={"query": "", "limit": 5}, headers=headers)
    assert response.status_code == 400

def test_file_upload_too_large(monkeypatch):
    from app.core import config
    monkeypatch.setattr(config.settings, "max_file_size", 1)  # 1 byte
    token = get_auth_token()
    files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
    data = {"title": "Test File"}
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/uploads/file", files=files, data=data, headers=headers)
    assert response.status_code == 413  # Should be 413 for file too large

def test_auth_demo():
    payload = {"email": "demo@example.com", "password": "testpass"}
    response = client.post("/auth/demo", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user" in data

def test_auth_demo_password_check():
    # Register a new demo user
    payload = {"email": "demotest@example.com", "password": "rightpass"}
    response = client.post("/auth/demo", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user" in data
    # Try logging in with wrong password
    payload_wrong = {"email": "demotest@example.com", "password": "wrongpass"}
    response_wrong = client.post("/auth/demo", json=payload_wrong)
    assert response_wrong.status_code == 401
    assert "Invalid email or password" in response_wrong.json()["detail"]
    # Try logging in with correct password again
    response_right = client.post("/auth/demo", json=payload)
    assert response_right.status_code == 200
    assert "access_token" in response_right.json()

def test_process_file_task_file_not_found():
    db = SessionLocal()
    entry = models.Entry(
        user_id=1,
        title="Test Missing File",
        entry_type="text",
        file_path="/tmp/does_not_exist.txt",
        processed=False
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    entry_id = entry.id
    try:
        with pytest.raises(FileNotFoundError):
            process_file_task.apply(args=(entry_id,)).get()
    finally:
        db.delete(entry)
        db.commit()
        db.close()

def test_env_file_path():
    from app.core.config import settings
    assert getattr(settings, "test_env_path", None) == "success"
    print("settings.test_env_path:", getattr(settings, "test_env_path", None))

def test_db_pool_settings():
    from app.core.database import engine
    print("Pool size:", getattr(engine.pool, 'size', lambda: 'n/a')())
    print("Max overflow:", getattr(engine.pool, '_max_overflow', 'n/a'))
    print("Timeout:", getattr(engine.pool, '_timeout', 'n/a'))
    print("Recycle:", getattr(engine.pool, '_recycle', 'n/a')) 