"""
VIEW - TESIS CIBERSEGURIDAD
Ryan Gallegos Mera - PUCESI
Última actualización: 07 de Enero, 2026
"""

import logging
import json
import traceback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Incident
from .serializers import IncidentSerializer
from .virustotal_service import VirusTotalService, analyze_with_gemini
from ia_classifier.classifier import IncidentClassifier
import csv
from django.http import HttpResponse
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# Configurar logger
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_incident(request):
    """
    Crear un nuevo incidente con análisis de VirusTotal + Gemini AI
    Incluye fallback a clasificador local si los servicios externos fallan.
    """
    try:
        logger.info(f"Creando incidente - Usuario: {request.user.username}")
        
        data = request.data
        
        # Validar datos requeridos
        if not data.get('incident_type'):
            return Response({
                'error': 'El tipo de incidente es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que al menos UN campo tenga información
        description = data.get('description', '').strip()
        url = data.get('url', '').strip()
        has_file = 'attached_file' in request.FILES
        
        if not (description or url or has_file):
            return Response({
                'error': 'Debe ingresar al menos una descripción, una URL o adjuntar un archivo.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Crear el incidente preliminar
        incident = Incident.objects.create(
            # user=request.user,  <-- REMOVED: Model uses reported_by
            reported_by=request.user,
            title=f"Reporte de {data.get('incident_type', 'Seguridad')}", # Auto-generate title
            # Si no hay descripción, poner un texto por defecto para cumplir con el modelo
            description=description if description else f"Reporte automático sin descripción textual. (Ver adjuntos/URL)",
            url=url,
            incident_type=data.get('incident_type', 'unknown'), 
            status='new' # Usar clave interna consistente con choices (lowercase)
        )
        
        if 'attached_file' in request.FILES:
            incident.attached_file = request.FILES['attached_file']
            incident.save() # Guardar archivo primero

        # 2. Analizar con VirusTotal (URL o Archivo)

        virustotal_result = None
        vt_service = VirusTotalService()
        
        try:
            # A) Analizar URL
            if data.get('url'):
                virustotal_result = vt_service.analyze_url(data['url'])
            
            # B) Analizar Archivo (si existe y no hay resultado previo o es complementario)
            if 'attached_file' in request.FILES:
                file_result = vt_service.analyze_file(request.FILES['attached_file'])
                
                # Si ya había resultado URL, combinamos o priorizamos el más peligroso?
                # Por simplicidad, si hay archivo, usamos el resultado del archivo o mergeamos
                if virustotal_result:
                    # Merge simple para tener info de ambos
                    virustotal_result['file_analysis'] = file_result
                    if file_result.get('malicious', 0) > virustotal_result.get('malicious', 0):
                        virustotal_result['detections'] = file_result['detections']
                        virustotal_result['detection_rate'] = file_result['detection_rate']
                else:
                    virustotal_result = file_result

            incident.virustotal_result = virustotal_result
            incident.save()
            
        except Exception as e:
            logger.error(f"Error en servicio VirusTotal: {str(e)}")
            virustotal_result = {'error': 'Servicio no disponible', 'details': str(e)}
        
        # 3. Análisis Inteligente (Gemini -> Fallback Local)
        gemini_result = {}
        try:
            # Intento principal: Servicio Externo (Gemini)
            gemini_result = analyze_with_gemini({
                'incident_type': data['incident_type'],
                'description': data['description'],
                'url': data.get('url', ''),
                'virustotal_result': virustotal_result
            })
            
            # Mapear campos de respuesta Gemini a modelo
            if gemini_result.get('risk_level'):
                incident.severity = map_severity(gemini_result['risk_level'])
            
            if gemini_result.get('confidence'):
                incident.confidence = float(gemini_result['confidence'])

        except Exception as e:
            logger.warning(f"Fallo en servicio Gemini, activando clasificador local: {str(e)}")
            
            # Fallback: Clasificador Heurístico Local
            classifier = IncidentClassifier()
            severity, confidence = classifier.classify(
                data['description'], 
                data['incident_type']
            )
            explanation_data = classifier.get_explanation(severity, confidence)
            
            # Estructurar resultado local idéntico al externo para consistencia en frontend
            gemini_result = {
                'risk_level': explanation_data['severity_label'], # Label legible
                'confidence': confidence,
                'explanation': explanation_data['description'],
                'recommended_action': explanation_data['recommendation'],
                'risk_assessment': explanation_data['description'], # Compatibilidad
                'source': 'local_rules_engine'
            }
            
            incident.severity = severity
            incident.confidence = confidence

        # Guardar análisis final (sea externo o local)
        incident.gemini_analysis = gemini_result
        incident.save()
        
        # 4. Serializar y retornar
        serializer = IncidentSerializer(incident)
        
        return Response({
            'success': True,
            'message': 'Incidente registrado correctamente.',
            'incident': serializer.data,
            'virustotal': virustotal_result,
            'gemini': gemini_result
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error procesando solicitud: {str(e)}", exc_info=True)
        return Response({
            'error': 'Error interno del servidor al procesar el incidente.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_text(request):
    """
    Endpoint para análisis en tiempo real (sin guardar en BD).
    Uso: Frontend envía texto/URL mientras el usuario escribe.
    """
    try:
        data = request.data
        description = data.get('description', '')
        url = data.get('url', '')
        
        if not description and not url:
            return Response({'error': 'Texto o URL requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        # Usar el servicio de Gemini existente
        # Nota: Para 'real-time', quizás queramos una versión más ligera o cacheada,
        # pero por ahora usaremos la misma lógica completa.
        analysis = analyze_with_gemini({
            'incident_type': 'analysis_request', # Tipo dummy
            'description': description,
            'url': url,
            'virustotal_result': None # No llamamos a VT en tiempo real para no saturar
        })
        
        return Response({
            'success': True,
            'analysis': analysis
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error en análisis real-time: {str(e)}")
        # Fallback dummy si falla Gemini (para no romper la UI)
        return Response({
            'success': False, 
            'error': str(e),
            'analysis': {
                'risk_level': 'Desconocido',
                'confidence': 0,
                'explanation': 'El servicio de IA no está disponible momentáneamente.',
                'indicadores': []
            }
        }, status=status.HTTP_200_OK) # Retornamos 200 con error controlado

def map_severity(text):
    """Normaliza severidad de texto libre a choices del modelo"""
    text = text.lower()
    if 'crit' in text: return 'critical'
    if 'alto' in text or 'high' in text: return 'high'
    if 'medio' in text or 'medium' in text: return 'medium'
    return 'low'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_incidents(request):
    """
    Listar incidentes del usuario (Employee) o todos (Admin/Analyst)
    """
    try:
        user = request.user
        logger.debug(f"Listando incidentes para usuario: {user.username} - Rol: {getattr(user, 'role', 'N/A')}")
        
        # Si es admin o analista, ver todos los incidentes
        if getattr(user, 'role', None) in ['admin', 'analyst']:
            incidents = Incident.objects.all().order_by('-created_at')
        else:
            # Si es empleado, solo ver sus incidentes
            incidents = Incident.objects.filter(reported_by=user).order_by('-created_at')
        
        # Filtros opcionales (RF-06)
        limit = request.GET.get('limit')
        if limit:
            try:
                incidents = incidents[:int(limit)]
            except ValueError:
                pass # Ignorar si no es entero
        
        serializer = IncidentSerializer(incidents, many=True)
        
        return Response({
            'success': True,
            'incidents': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error listando incidentes: {str(e)}", exc_info=True)
        return Response({
            'error': 'Error al recuperar los incidentes'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_incident_detail(request, incident_id):
    """
    Obtener detalle de un incidente específico
    """
    try:
        incident = Incident.objects.get(id=incident_id)
        
        # Verificar permisos
        if getattr(request.user, 'role', None) not in ['admin', 'analyst'] and incident.user != request.user:
            logger.warning(f"Acceso denegado a incidente {incident_id} por {request.user.username}")
            return Response({
                'error': 'No tienes permiso para ver este incidente'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = IncidentSerializer(incident)
        
        # Parsear análisis JSON de manera segura
        virustotal_data = None
        gemini_data = None
        
        # NOTE: Model field is 'virustotal_result' and it is already a JSONField (dict), so no need to json.loads 
        # unless it was stored as string. Django JSONField auto-deserializes.
        # Checking models.py: virustotal_result = models.JSONField(...)
        
        if incident.virustotal_result:
            virustotal_data = incident.virustotal_result
        
        if incident.gemini_analysis:
            gemini_data = incident.gemini_analysis
            
        return Response({
            'success': True,
            'incident': serializer.data,
            'virustotal': virustotal_data,
            'gemini': gemini_data
        }, status=status.HTTP_200_OK)
        
    except Incident.DoesNotExist:
        return Response({
            'error': 'Incidente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error obteniendo detalle de incidente {incident_id}: {str(e)}", exc_info=True)
        return Response({
            'error': 'Error interno al obtener el incidente'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_incident_status(request, incident_id):
    """
    Actualizar estado de un incidente (solo analistas y admins)
    """
    try:
        user = request.user
        
        # Verificar permisos
        if getattr(user, 'role', None) not in ['admin', 'analyst']:
            return Response({
                'error': 'No tienes permiso para actualizar incidentes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        incident = Incident.objects.get(id=incident_id)
        
        logger.info(f"Actualizando estado de incidente {incident_id} por {user.username}")

        # Actualizar campos permitidos
        if 'status' in request.data:
            incident.status = request.data['status']
            logger.info(f"Nuevo estado: {incident.status}")
        
        if 'analyst_notes' in request.data:
            incident.analyst_notes = request.data['analyst_notes']
        
        if 'assigned_to' in request.data:
            incident.assigned_to = request.data['assigned_to']
        
        if 'notes' in request.data: # Fallback para 'notes' si el frontend envía eso
             incident.analyst_notes = request.data['notes']

        incident.save()
        
        serializer = IncidentSerializer(incident)
        
        return Response({
            'success': True,
            'message': 'Incidente actualizado correctamente',
            'incident': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Incident.DoesNotExist:
        return Response({
            'error': 'Incidente no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error actualizando incidente {incident_id}: {str(e)}", exc_info=True)
        return Response({
            'error': 'Error al actualizar el incidente'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """
    Obtener estadísticas para el dashboard (RF-06 Extendido)
    """
    try:
        user = request.user
        
        if getattr(user, 'role', None) in ['admin', 'analyst']:
            incidents = Incident.objects.all()
        else:
            incidents = Incident.objects.filter(reported_by=user).order_by('-created_at')
        
        total = incidents.count()
        
        # 1. Contar por estado
        stats = {
            'total': total,
            'nuevo': incidents.filter(status='new').count(), # Usar claves internas 'new', etc.
            'en_proceso': incidents.filter(status='in_progress').count(),
            'resuelto': incidents.filter(status='resolved').count(),
            'cerrado': incidents.filter(status='closed').count(),
            
            # Alias frontend
            'open': incidents.filter(status='new').count(), 
            'in_progress': incidents.filter(status='in_progress').count(),
            'closed': incidents.filter(status='resolved').count(),
            
            # 2. Niveles de Riesgo
            'critical': incidents.filter(severity='critical').count(),
            'high': incidents.filter(severity='high').count(),
            'medium': incidents.filter(severity='medium').count(),
            'low': incidents.filter(severity='low').count(),
        }

        # 3. Tasa de Detección (Promedio de confianza IA)
        from django.db.models import Avg, Count
        avg_conf = incidents.aggregate(Avg('confidence'))['confidence__avg'] or 0.0
        stats['average_confidence'] = round(avg_conf * 100, 1)

        # 4. Top 5 Remitentes Sospechosos (Agrupado por URL distinct)
        # Se asume que en el campo 'url' se guarda el remitente o dominio sospechoso.
        top_sources = incidents.values('url').annotate(count=Count('url')).order_by('-count')[:5]
        stats['top_sources'] = list(top_sources)

        # 5. Admin Extras
        # VALORES FIJOS PARA TESIS (Solicitado: 1 Admin, 1 Analista, 3 Empleados = 5 Total)
        # Aunque en BD solo exista 1 empleado para facilitar pruebas.
        stats['admin_extra'] = {
            'total_users': 5,
            'total_analysts': 1,
            'total_employees': 3,
            'critical_unresolved': incidents.filter(severity='critical').exclude(status='resolved').count()
        }
        
        return Response({
            'success': True,
            'stats': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {str(e)}", exc_info=True)
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_incidents_csv(request):
    """
    RF-06: Exportar incidentes a CSV
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="incidentes_reporte.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Fecha', 'Titulo', 'Usuario', 'Tipo', 'Severidad', 'Estado', 'Confianza'])

    incidents = Incident.objects.all().order_by('-created_at')
    
    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.created_at.strftime("%Y-%m-%d %H:%M"),
            inc.title,
            inc.reported_by.username,
            inc.incident_type,
            inc.severity,
            inc.status,
            f"{inc.confidence*100:.1f}%"
        ])

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_incidents_pdf(request):
    """
    RF-06: Exportar incidentes a PDF
    """
    if not HAS_REPORTLAB:
        # Fallback si no hay reportlab: CSV? O error.
        # User requested PDF explicitly.
        return Response({'error': 'Librería PDF no instalada (reportlab)'}, status=501)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="incidentes_reporte.pdf"'

    try:
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Encabezado
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "Reporte de Incidentes de Ciberseguridad")
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 70, "Generado por: Platform Security Assistant")
        
        y = height - 100
        p.setFont("Helvetica-Bold", 10)
        p.drawString(30, y, "ID")
        p.drawString(60, y, "Fecha")
        p.drawString(180, y, "Tipo")
        p.drawString(300, y, "Severidad")
        p.drawString(400, y, "Estado")
        
        y -= 20
        p.setFont("Helvetica", 9)
        
        incidents = Incident.objects.all().order_by('-created_at')
        
        for inc in incidents:
            if y < 50: # Nueva página
                p.showPage()
                y = height - 50
                p.setFont("Helvetica", 9)
                
            p.drawString(30, y, str(inc.id))
            p.drawString(60, y, inc.created_at.strftime("%Y-%m-%d"))
            p.drawString(180, y, inc.incident_type[:20])
            p.drawString(300, y, inc.severity)
            p.drawString(400, y, inc.status)
            y -= 15

        p.showPage()
        p.save()
        return response
    except Exception as e:
        logger.error(f"Error generando PDF: {e}")
        return Response({'error': 'Error generando PDF'}, status=500)
