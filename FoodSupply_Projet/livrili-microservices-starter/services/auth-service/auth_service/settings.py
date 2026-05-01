from pathlib import Path
from datetime import timedelta
BASE_DIR=Path(__file__).resolve().parent.parent
SECRET_KEY='livrili-secret'
DEBUG=True
ALLOWED_HOSTS=['*']
INSTALLED_APPS=['django.contrib.contenttypes','django.contrib.auth','rest_framework','rest_framework_simplejwt','corsheaders','authapp']
MIDDLEWARE=['corsheaders.middleware.CorsMiddleware']
ROOT_URLCONF='auth_service.urls'
DATABASES={'default':{'ENGINE':'django.db.backends.sqlite3','NAME':BASE_DIR/'db.sqlite3'}}
AUTH_USER_MODEL='authapp.Account'
REST_FRAMEWORK={
  'DEFAULT_PERMISSION_CLASSES':['rest_framework.permissions.AllowAny'],
  'DEFAULT_RENDERER_CLASSES':('rest_framework.renderers.JSONRenderer',),
}
SIMPLE_JWT={'ACCESS_TOKEN_LIFETIME':timedelta(minutes=30)}
CORS_ALLOW_ALL_ORIGINS=True
