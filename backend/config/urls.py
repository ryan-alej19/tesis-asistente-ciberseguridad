from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from incidents.views import IncidentViewSet

# Crear router para ViewSet
router = DefaultRouter()
router.register(r'incidents', IncidentViewSet, basename='incident')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Todas las rutas del ViewSet se incluyen automáticamente
    # GET    /api/incidents/          - Listar todos
    # POST   /api/incidents/          - Crear nuevo
    # GET    /api/incidents/{id}/     - Detalle
    # PUT    /api/incidents/{id}/     - Actualizar
    # DELETE /api/incidents/{id}/     - Eliminar
    # POST   /api/incidents/{id}/analyze/ - Análisis IA
    # GET    /api/incidents/stats/    - Estadísticas
    path('api/', include(router.urls)),
]
