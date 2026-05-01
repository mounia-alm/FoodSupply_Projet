import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class JwtUser:
    """Minimal user object built from JWT claims (auth DB lives in auth-service)."""

    def __init__(self, user_id, role):
        self.pk = user_id
        self.id = user_id
        self.role = role
        self.is_authenticated = True


class JWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION")
        if not header:
            return None
        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None
        raw = parts[1]
        try:
            payload = jwt.decode(
                raw,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True},
            )
        except jwt.PyJWTError as exc:
            raise AuthenticationFailed("Invalid token.") from exc

        user_id = payload.get("user_id")
        role = payload.get("role")
        if user_id is None:
            raise AuthenticationFailed("Token missing user id.")

        user = JwtUser(int(user_id), role)
        return (user, payload)


class JWTAuthenticationOptional(BaseAuthentication):
    """Same as JWTAuthentication but returns AnonymousUser when no / invalid header."""

    keyword = "Bearer"

    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION")
        if not header:
            return None
        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None
        raw = parts[1]
        try:
            payload = jwt.decode(
                raw,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True},
            )
        except jwt.PyJWTError:
            return None

        user_id = payload.get("user_id")
        role = payload.get("role")
        if user_id is None:
            return None
        user = JwtUser(int(user_id), role)
        return (user, payload)
