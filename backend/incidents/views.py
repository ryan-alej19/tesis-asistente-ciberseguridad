"""
Vistas para gestión de incidentes con Django REST Framework
Soporte completo para roles: admin, analyst, employee
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from datetime import timedelta

from incidents.models import Incident, CustomUser
from incidents.serializers import IncidentSerializer, UserSerializer
from ia_classifier.classifier import classify_incident, get_classification_explanation


class IncidentListCreateView(APIView):
    """
    GET: Listar incidentes (filtrados por rol del usuario)
    POST: Crear nuevo incidente con clasificación automática
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Listar incidentes según el rol del usuario.
        
        Admin: Ve TODO
        Analyst: Ve los asignados a él y los sin asignar
        Employee: Ve solo los que reportó
        """
        user = request.user
        
        # Filtrado por rol
        if user.role == 'admin':
            # Admin ve TODOS los incidentes
            incidents = Incident.objects.all()
        elif user.role == 'analyst':
            # Analista ve los asignados a él + los sin asignar
            incidents = Incident.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        else:  # employee
            # Empleado ve solo los que él reportó
            incidents = Incident.objects.filter(reported_by=user)
        
        # Ordenar por más reciente
        incidents = incidents.order_by('-created_at')
        
        # Serializar
        serializer = IncidentSerializer(incidents, many=True)
        
        return Response({
            'count': incidents.count(),
            'results': serializer.data,
            'user_role': user.role
        })
    
    def post(self, request):
        """
        Crear nuevo incidente con clasificación automática.
        
        Body esperado:
        {
            "title": "Título del incidente",
            "description": "Descripción detallada",
            "incident_type": "phishing"  // Opcional
        }
        """
        user = request.user
        
        # Solo empleados y analistas pueden reportar
        # (admins no reportan, solo gestionan)
        if user.role == 'admin':
            return Response(
                {'error': 'Admin no puede reportar incidentes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validaciones básicas
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        incident_type = request.data.get('incident_type', '').strip()
        
        if not title or not description:
            return Response(
                {'error': 'Título y descripción son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 🤖 CLASIFICACIÓN AUTOMÁTICA CON IA
        severity, confidence, threat_type = classify_incident(
            title, description, incident_type
        )
        
        # Crear incidente
        incident = Incident.objects.create(
            title=title,
            description=description,
            incident_type=incident_type or 'unknown',
            severity=severity,
            confidence=confidence,
            threat_type=threat_type,
            status='new',
            reported_by=user,
            detected_at=timezone.now(),
            created_at=timezone.now()
        )
        
        serializer = IncidentSerializer(incident)
        
        return Response({
            'status': 'success',
            'message': f'Incidente creado y clasificado como {severity}',
            'incident': serializer.data
        }, status=status.HTTP_201_CREATED)


class IncidentDetailView(APIView):
    """
    GET: Obtener detalles de un incidente
    PATCH: Actualizar un incidente
    DELETE: Eliminar un incidente
    """
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        """
        Obtener incidente verificando permisos
        """
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return None
        
        # Verificar permisos
        if user.role == 'employee':
            # Empleado solo ve los suyos
            if incident.reported_by != user:
                return None
        # Admin y analyst ven todos
        
        return incident
    
    def get(self, request, pk):
        """
        Obtener detalles de un incidente
        """
        incident = self.get_object(pk, request.user)
        
        if not incident:
            return Response(
                {'error': 'No encontrado o sin permisos'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = IncidentSerializer(incident)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        """
        Actualizar incidente (cambiar estado, asignar, etc)
        """
        incident = self.get_object(pk, request.user)
        
        if not incident:
            return Response(
                {'error': 'No encontrado o sin permisos'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Solo admin y analyst pueden actualizar
        if request.user.role == 'employee':
            return Response(
                {'error': 'Empleado no puede actualizar incidentes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Actualizar campos permitidos
        if 'status' in request.data:
            incident.status = request.data['status']
        
        if 'notes' in request.data:
            incident.notes = request.data['notes']
        
        if 'assigned_to' in request.data:
            user_id = request.data['assigned_to']
            if user_id:
                try:
                    assigned_user = CustomUser.objects.get(id=user_id)
                    incident.assigned_to = assigned_user
                except CustomUser.DoesNotExist:
                    return Response(
                        {'error': 'Usuario no encontrado'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        incident.updated_at = timezone.now()
        incident.save()
        
        serializer = IncidentSerializer(incident)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        """
        Eliminar incidente (solo admin)
        """
        if request.user.role != 'admin':
            return Response(
                {'error': 'Solo admin puede eliminar incidentes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incident = self.get_object(pk, request.user)
        
        if not incident:
            return Response(
                {'error': 'No encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        incident.delete()
        
        return Response(
            {'message': 'Incidente eliminado'},
            status=status.HTTP_204_NO_CONTENT
        )


class DashboardStatsView(APIView):
    """
    Estadísticas del dashboard filtradas por rol
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna estadísticas según el rol del usuario
        """
        user = request.user
        
        # Filtrado base
        if user.role == 'admin':
            incidents = Incident.objects.all()
        elif user.role == 'analyst':
            incidents = Incident.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        else:  # employee
            incidents = Incident.objects.filter(reported_by=user)
        
        # Calcular estadísticas
        total = incidents.count()
        
        # Críticos sin resolver
        critical_unresolved = incidents.filter(
            severity='critical',
            status__in=['new', 'under_review', 'in_progress']
        ).count()
        
        # Confianza promedio
        avg_confidence = incidents.aggregate(avg=Avg('confidence'))['avg'] or 0.0
        
        # Por severidad
        by_severity = {}
        for choice_value, choice_label in Incident.SEVERITY_CHOICES:
            by_severity[choice_value] = incidents.filter(severity=choice_value).count()
        
        # Por estado
        by_status = {}
        for choice_value, choice_label in Incident.STATUS_CHOICES:
            by_status[choice_value] = incidents.filter(status=choice_value).count()
        
        return Response({
            'total_incidents': total,
            'critical_unresolved': critical_unresolved,
            'average_confidence': round(avg_confidence, 2),
            'by_severity': by_severity,
            'by_status': by_status,
            'user_role': user.role,
        })


class ClassifyIncidentView(APIView):
    """
    Endpoint para clasificar un incidente manualmente
    (prueba de la IA)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Clasificar un incidente sin guardarlo
        
        Body:
        {
            "title": "Título",
            "description": "Descripción",
            "incident_type": "phishing"
        }
        """
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        incident_type = request.data.get('incident_type', '')
        
        if not description:
            return Response(
                {'error': 'description es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clasificar
        severity, confidence, threat_type = classify_incident(
            title, description, incident_type
        )
        
        # Obtener explicación
        explanation = get_classification_explanation(severity, confidence, threat_type)
        
        return Response({
            'severity': severity,
            'confidence': confidence,
            'threat_type': threat_type,
            'explanation': explanation
        })
