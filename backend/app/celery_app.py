from celery import Celery
from app.core.config import settings

if not settings.redis_url or not isinstance(settings.redis_url, str) or not settings.redis_url.strip():
    raise RuntimeError("Celery configuration error: settings.redis_url is not set or invalid. Please check your configuration.")

celery_app = Celery(
    "lifelog",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.processing_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
)
