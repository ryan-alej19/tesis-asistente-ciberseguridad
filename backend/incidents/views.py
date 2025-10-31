from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Incident
from .serializers import IncidentSerializer

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Retorna estadísticas para el dashboard"""
        incidents = Incident.objects.all()
        
        stats = {
            'total': incidents.count(),
            'resolved': incidents.filter(resolved=True).count(),
            'critical': incidents.filter(criticality='CRITICO').count(),
            'threat_distribution': {
                'malware': incidents.filter(threat_type='MALWARE').count(),
                'phishing': incidents.filter(threat_type='PHISHING').count(),
                'ransomware': incidents.filter(threat_type='RANSOMWARE').count(),
            }
        }
        return Response(stats)
