"""Expose API path prefixes so the UI works behind Traefik or split ports."""

from django.conf import settings


def api_prefixes(request):
    return {
        "API_AUTH": getattr(settings, "API_AUTH_PREFIX", "/api/auth"),
        "API_SUPPLIER": getattr(settings, "API_SUPPLIER_PREFIX", "/api"),
        "API_ORDER": getattr(settings, "API_ORDER_PREFIX", "/api/orders"),
    }
