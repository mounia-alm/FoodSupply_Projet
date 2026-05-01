from rest_framework_simplejwt.tokens import RefreshToken


class LivriliRefreshToken(RefreshToken):
    """Adds role to access token payload for downstream microservices."""

    @classmethod
    def for_user(cls, user):
        refresh = super().for_user(user)
        refresh.access_token["role"] = user.role
        return refresh
