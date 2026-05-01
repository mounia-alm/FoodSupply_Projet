import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = "order-service-secret"
DEBUG = True
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS = ["django.contrib.auth", "django.contrib.contenttypes", "rest_framework", "corsheaders", "orders"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", "django.middleware.common.CommonMiddleware"]
ROOT_URLCONF = "order_service.urls"
TEMPLATES = []
WSGI_APPLICATION = "order_service.wsgi.application"
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOW_ALL_ORIGINS = True
RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "rabbitmq")
PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://product-service:8000/api/products")
REST_FRAMEWORK = {
  "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
  "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
}
