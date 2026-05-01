from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = "portal/index.html"


class LoginView(TemplateView):
    template_name = "portal/login.html"


class SignupView(TemplateView):
    template_name = "portal/signup.html"


class RestaurantBrowseView(TemplateView):
    template_name = "portal/restaurant_catalog.html"


class RestaurantOrdersView(TemplateView):
    template_name = "portal/restaurant_orders.html"


class SupplierProductsView(TemplateView):
    template_name = "portal/supplier_products.html"


class SupplierOrdersView(TemplateView):
    template_name = "portal/supplier_orders.html"


class RestaurantLandingView(TemplateView):
    template_name = "portal/restaurant_home.html"


class SupplierLandingView(TemplateView):
    template_name = "portal/supplier_home.html"
