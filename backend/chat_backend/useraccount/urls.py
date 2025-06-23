from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from dj_rest_auth.jwt_auth import get_refresh_view
from . import api
from . import views

from django.urls import path


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", get_refresh_view().as_view(), name="api_token_refresh"),
    path("user/<uuid:pk>/", api.userDetails, name="get_user_detials"),
    path("users/", api.get_users, name="api_get_user"),
    path("user/avatar/", api.upload_avatar, name="api_upload_avatar"),
    path("google/", views.GoogleLogin.as_view(), name="google_login"),
    path(
        "google/callback/",
        views.GoogleLoginCallback.as_view(),
        name="google_login_callback",
    ),
]
