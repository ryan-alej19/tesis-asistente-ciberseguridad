"""
URL Configuration 
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from incidents import auth as auth_views

urlpatterns = [
    # ========================================
    #  AUTENTICACIÓN JWT y CUSTOM
    # ========================================
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas personalizadas de autenticación
    path('api/auth/login/', auth_views.login_view, name='login'),
    path('api/auth/register/', auth_views.register_user, name='register'),
    path('api/auth/profile/', auth_views.profile, name='profile'),
    path('api/auth/logout/', auth_views.logout_view, name='logout'),
    
    # ========================================
    # GESTIÓN DE INCIDENTES
    # ========================================
    path('api/incidents/', include('incidents.urls')),
    
    # ========================================
    #  ADMIN PANEL
    # ========================================
    path('admin/', admin.site.urls),
]
