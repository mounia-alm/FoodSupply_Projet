from django.urls import path

from . import views

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("signup/", views.SignupView.as_view(), name="signup"),
    path("restaurant/", views.RestaurantLandingView.as_view(), name="restaurant_home"),
    path("restaurant/catalog/", views.RestaurantBrowseView.as_view(), name="restaurant_catalog"),
    path("restaurant/orders/", views.RestaurantOrdersView.as_view(), name="restaurant_orders"),
    path("supplier/", views.SupplierLandingView.as_view(), name="supplier_home"),
    path("supplier/products/", views.SupplierProductsView.as_view(), name="supplier_products"),
    path("supplier/orders/", views.SupplierOrdersView.as_view(), name="supplier_orders"),
]
