from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BulkOrderViewSet

router = DefaultRouter()
router.register(r"orders", BulkOrderViewSet, basename="bulkorder")

urlpatterns = [
    path("", include(router.urls)),
]
