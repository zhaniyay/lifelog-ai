import pytest
import os

@pytest.fixture(scope="session", autouse=True)
def apply_migrations():
    # Remove the old test DB if it exists
    db_path = os.path.abspath("lifelog_dev.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    # Apply Alembic migrations
    yield 