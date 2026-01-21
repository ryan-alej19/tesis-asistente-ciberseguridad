"""
URLS - TESIS CIBERSEGURIDAD
Ryan Gallegos Mera - PUCESI
Última actualización: 04 de Enero, 2026
"""

from django.urls import path
from . import views  # ← Importa las vistas de esta app

urlpatterns = [
    # Crear incidente con análisis de IA
    path('create/', views.create_incident, name='create_incident'),
    path('create', views.create_incident), # Alias sin slash
    
    # Listar incidentes
    path('', views.list_incidents, name='list_incidents'),
    
    # Detalle de incidente
    path('<int:incident_id>/', views.get_incident_detail, name='get_incident_detail'),
    
    # Actualizar estado de incidente
    path('<int:incident_id>/status/', views.update_incident_status, name='update_incident_status'),
    
    # Estadísticas para dashboard
    path('stats/', views.get_dashboard_stats, name='get_dashboard_stats'),
    
    # Exportaciones (RF-06)
    path('export/csv/', views.export_incidents_csv, name='export_csv'),
    path('export/pdf/', views.export_incidents_pdf, name='export_pdf'),

    # Análisis en tiempo real
    path('analyze/', views.analyze_text, name='analyze_text'),
]
