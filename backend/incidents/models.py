from django.db import models

class Incident(models.Model):
    CRITICALITY_CHOICES = [
        ('BAJO', 'Bajo'),
        ('MEDIO', 'Medio'),
        ('ALTO', 'Alto'),
        ('CRITICO', 'Crítico'),
    ]
    
    THREAT_TYPE_CHOICES = [
        ('MALWARE', 'Malware'),
        ('PHISHING', 'Phishing'),
        ('RANSOMWARE', 'Ransomware'),
        ('ACCESO_NO_AUTORIZADO', 'Acceso no autorizado'),
        ('DOS', 'Ataque DoS'),
        ('OTRO', 'Otro'),
    ]
    
    description = models.TextField()
    threat_type = models.CharField(max_length=50, choices=THREAT_TYPE_CHOICES, default='OTRO')
    criticality = models.CharField(max_length=20, choices=CRITICALITY_CHOICES, default='MEDIO')
    ai_recommendation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.threat_type} - {self.created_at}"
    
    class Meta:
        ordering = ['-created_at']
