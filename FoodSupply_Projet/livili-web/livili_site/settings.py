import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-livili-web-ui-key-change-me"

DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "portal.apps.PortalConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "livili_site.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "portal" / "templates"],
        "APP_DIRS": False,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "portal.context_processors.api_prefixes",
            ],
        },
    },
]

WSGI_APPLICATION = "livili_site.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "portal" / "static"]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Traefik / Docker (same origin): leave defaults — browser calls /api/auth, /api/products, …
# Split terminals (different ports): set env vars before starting livili-web, for example:
#   LIVILI_AUTH_API=http://127.0.0.1:8001/api/auth
#   LIVILI_SUPPLIER_API=http://127.0.0.1:8002/api
#   LIVILI_ORDER_API=http://127.0.0.1:8003/api/orders
API_AUTH_PREFIX = os.environ.get("LIVILI_AUTH_API", "/api/auth")
API_SUPPLIER_PREFIX = os.environ.get("LIVILI_SUPPLIER_API", "/api")
API_ORDER_PREFIX = os.environ.get("LIVILI_ORDER_API", "/api/orders")
