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
    Incluye información del usuario que reportó y del asignado
    """
    reported_by_username = serializers.CharField(
        source='reported_by.username',
        read_only=True
    )
    reported_by_email = serializers.CharField(
        source='reported_by.email',
        read_only=True
    )
    assigned_to_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True,
        allow_null=True
    )
    assigned_to_email = serializers.CharField(
        source='assigned_to.email',
        read_only=True,
        allow_null=True
    )
    
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
            'ip_source',
            'ip_destination',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'detected_at',
            'reported_by',
            'reported_by_username',
            'reported_by_email',
        ]


class IncidentListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listar incidentes
    Menos campos que el serializer completo para respuestas más rápidas
    """
    reported_by_username = serializers.CharField(
        source='reported_by.username',
        read_only=True
    )
    assigned_to_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Incident
        fields = [
            'id',
            'title',
            'severity',
            'status',
            'confidence',
            'threat_type',
            'created_at',
            'reported_by_username',
            'assigned_to_username',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'reported_by_username',
        ]


class IncidentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear incidentes
    Solo acepta campos básicos que el usuario puede llenar
    """
    class Meta:
        model = Incident
        fields = [
            'title',
            'description',
            'incident_type',
        ]


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar incidentes
    Permite cambiar estado, notas y asignación
    """
    class Meta:
        model = Incident
        fields = [
            'status',
            'notes',
            'assigned_to',
        ]
