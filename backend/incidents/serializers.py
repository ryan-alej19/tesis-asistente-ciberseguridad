from rest_framework import serializers
from .models import Incident

class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['id', 'description', 'threat_type', 'criticality', 'ai_recommendation', 'created_at', 'resolved']
