"""
🚨 SERIALIZERS DE INCIDENTES - TESIS CIBERSEGURIDAD
Ryan Gallegos Mera - PUCESI
Última actualización: 03 de Enero, 2026
"""

from rest_framework import serializers
from incidents.models import Incident, CustomUser


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para CustomUser
    Retorna información del usuario incluyendo su rol
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name']
        read_only_fields = ['id']


class IncidentSerializer(serializers.ModelSerializer):
    """
    Serializer completo para Incident
    CON VIRUSTOTAL Y GEMINI
    """
    reported_by_username = serializers.SerializerMethodField()
    reported_by_email = serializers.SerializerMethodField()
    assigned_to_username = serializers.SerializerMethodField()
    assigned_to_email = serializers.SerializerMethodField()
    reported_url = serializers.CharField(source='url', read_only=True, allow_null=True, allow_blank=True)
    
    # 🛡️ VirusTotal
    virustotal_result = serializers.JSONField(required=False, allow_null=True)
    
    # 🤖 NUEVO: Gemini
    gemini_analysis = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Incident
        fields = [
            'id',
            'title',
            'description',
            'incident_type',
            'severity',
            'status',
            'confidence',
            'threat_type',
            'reported_url',  
            'detected_at',
            'created_at',
            'updated_at',
            'resolved_at',
            'reported_by',
            'reported_by_username',
            'reported_by_email',
            'assigned_to',
            'assigned_to_username',
            'assigned_to_email',
            'notes',
            'log_source',
            'virustotal_result',
            'gemini_analysis',  # 🤖 NUEVO
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'detected_at',
            'reported_by',
            'severity',
            'confidence',
            'virustotal_result',
            'gemini_analysis',  # 🤖 NUEVO
        ]
    
    def get_reported_by_username(self, obj):
        return obj.reported_by.username if obj.reported_by else 'Desconocido'
    
    def get_reported_by_email(self, obj):
        return obj.reported_by.email if obj.reported_by else 'N/A'
    
    def get_assigned_to_username(self, obj):
        return obj.assigned_to.username if obj.assigned_to else 'Sin asignar'
    
    def get_assigned_to_email(self, obj):
        return obj.assigned_to.email if obj.assigned_to else 'N/A'


class IncidentListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listar incidentes
    """
    reported_by_username = serializers.SerializerMethodField()
    assigned_to_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = [
            'id',
            'title',
            'severity',
            'status',
            'confidence',
            'threat_type',
            'url',
            'created_at',
            'reported_by_username',
            'assigned_to_username',
            'virustotal_result',
            'gemini_analysis',  # 🤖 NUEVO
        ]
        read_only_fields = [
            'id',
            'created_at',
            'virustotal_result',
            'gemini_analysis',  # 🤖 NUEVO
        ]
    
    def get_reported_by_username(self, obj):
        return obj.reported_by.username if obj.reported_by else 'Desconocido'
    
    def get_assigned_to_username(self, obj):
        return obj.assigned_to.username if obj.assigned_to else 'Sin asignar'


class IncidentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear incidentes
    """
    class Meta:
        model = Incident
        fields = [
            'title',
            'description',
            'incident_type',
            'threat_type',
            'url',
        ]


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar incidentes
    """
    class Meta:
        model = Incident
        fields = [
            'status',
            'notes',
            'assigned_to',
        ]
