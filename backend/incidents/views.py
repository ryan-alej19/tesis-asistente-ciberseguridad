from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def analyze_incident(request):
    try:
        data = json.loads(request.body)
        desc = data.get('description', '').lower().strip()

        tipo = 'OTRO'
        crit = 'BAJO'
        recomendacion = 'No se identifican incidentes. Continúe con sus funciones habituales.'
        tecnico = 'Ningún síntoma ni patrón asociado a amenazas detectado en la descripción.'

        # - Mensajes para errores, irrelevancias o pruebas
        if not desc or desc in ['hola', 'buenos días', 'prueba', 'test', 'agua', 'ninguno', 'nada']:
            tipo = 'NINGUNA'
            crit = 'BAJO'
            recomendacion = 'No se detecta amenaza ni riesgo. Puede seguir con su trabajo.'
            tecnico = 'Esta entrada no presenta riesgos de seguridad informática.'
        elif any(x in desc for x in ['banco', 'enlace', 'login', 'clave', 'contrasena', 'phishing']):
            tipo = 'PHISHING'
            crit = 'ALTO'
            recomendacion = 'No haga clic ni responda. Reporte a TI inmediatamente.'
            tecnico = 'Detectado patrón de probable phishing o intento fraudulento.'
        elif any(x in desc for x in ['descarga', 'archivo', 'malware', 'virus']):
            tipo = 'MALWARE'
            crit = 'CRÍTICO'
            recomendacion = 'Aísle su equipo y contacte soporte técnico.'
            tecnico = 'Palabras clave vinculadas a software malicioso o infección.'
        elif any(x in desc for x in ['transferencia', 'dinero', 'urgente', 'ceo', 'ingeniería social']):
            tipo = 'INGENIERÍA_SOCIAL'
            crit = 'CRÍTICO'
            recomendacion = 'Verifique la identidad. No continúe sin confirmar con el área responsable.'
            tecnico = 'Posible ingeniería social o suplantación de autoridad detectada.'
        elif any(x in desc for x in ['proveedor', 'ransomware']):
            tipo = 'RANSOMWARE'
            crit = 'CRÍTICO'
            recomendacion = 'Aísle el sistema, no pague rescate y contacte a TI de inmediato.'
            tecnico = 'Indicadores de posible ataque ransomware.'

        response = {
            "success": True,
            "incident_id": 999,
            "analysis": {
                "threat_type": tipo,
                "criticality": crit,
                "confidence": 0.99 if tipo not in ['OTRO', 'NINGUNA'] else 0.85,
                "recommendation": recomendacion,
                "technical_details": tecnico
            }
        }
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "incident_id": 0,
            "analysis": {
                "threat_type": "OTRO",
                "criticality": "MEDIO",
                "confidence": 0.5,
                "recommendation": "Error inesperado. Contactar soporte técnico.",
                "technical_details": f"Error Python: {str(e)}"
            }
        })

@csrf_exempt
def get_incidents(request):
    fake_incidents = [
        {"id": 1, "threat_type": "PHISHING", "criticality": "ALTO", "resolved": False, "created_at": "2024-11-02T22:00:00Z", "confidence_score": 0.92},
        {"id": 2, "threat_type": "MALWARE", "criticality": "CRÍTICO", "resolved": True, "created_at": "2024-11-02T21:30:00Z", "confidence_score": 0.87},
        {"id": 3, "threat_type": "ACCESO_ANÓMALO", "criticality": "MEDIO", "resolved": False, "created_at": "2024-11-02T21:00:00Z", "confidence_score": 0.75},
    ]
    return JsonResponse(fake_incidents, safe=False)
