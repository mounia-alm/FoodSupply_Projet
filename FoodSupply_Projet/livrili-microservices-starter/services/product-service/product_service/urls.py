from django.urls import include, path

urlpatterns = [path("api/products/", include("catalog.urls"))]
