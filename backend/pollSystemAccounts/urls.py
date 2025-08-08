from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('api/auth/register/', views.RegisterView.as_view(), name='register'),
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', views.ProfileView.as_view(), name='profile'),
]
