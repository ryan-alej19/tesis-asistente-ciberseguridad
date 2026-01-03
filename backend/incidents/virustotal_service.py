"""
🛡️ SERVICIO VIRUSTOTAL - TESIS CIBERSEGURIDAD
Ryan Gallegos Mera - PUCESI
Última actualización: 03 de Enero, 2026
"""

import requests
import time
from django.conf import settings


class VirusTotalService:
    """
    Servicio para integrar con la API de VirusTotal v3
    Límites cuenta gratuita: 500 requests/día, 4 requests/minuto
    """
    BASE_URL = "https://www.virustotal.com/api/v3"
    
    def __init__(self):
        self.api_key = getattr(settings, 'VIRUSTOTAL_API_KEY', None)
        self.headers = {
            "x-apikey": self.api_key,
            "Accept": "application/json"
        }
    
    def analyze_url(self, url):
        """
        Analiza una URL con VirusTotal
        
        Args:
            url (str): URL a analizar
            
        Returns:
            dict: {
                'success': bool,
                'detections': int,
                'total_engines': int,
                'malicious': int,
                'suspicious': int,
                'harmless': int,
                'undetected': int,
                'permalink': str,
                'error': str (opcional)
            }
        """
        if not self.api_key:
            return self._error_response("API Key de VirusTotal no configurada")
        
        try:
            print(f"\n{'='*60}")
            print(f"🛡️ ANALIZANDO URL CON VIRUSTOTAL: {url}")
            print(f"{'='*60}")
            
            # Paso 1: Enviar URL para análisis
            scan_url = f"{self.BASE_URL}/urls"
            payload = {"url": url}
            
            response = requests.post(
                scan_url, 
                headers=self.headers, 
                data=payload,
                timeout=15
            )
            
            if response.status_code != 200:
                print(f"❌ Error HTTP: {response.status_code}")
                return self._error_response(f"Error HTTP {response.status_code}")
            
            analysis_id = response.json()["data"]["id"]
            print(f"✅ URL enviada - Analysis ID: {analysis_id}")
            
            # Paso 2: Esperar 3 segundos para que VirusTotal procese
            print("⏳ Esperando análisis...")
            time.sleep(3)
            
            # Paso 3: Obtener resultado del análisis
            result_url = f"{self.BASE_URL}/analyses/{analysis_id}"
            result_response = requests.get(result_url, headers=self.headers, timeout=15)
            
            if result_response.status_code != 200:
                print(f"❌ Error obteniendo resultado: {result_response.status_code}")
                return self._error_response("Error al obtener análisis")
            
            data = result_response.json()["data"]["attributes"]
            stats = data.get("stats", {})
            
            # Extraer estadísticas
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            harmless = stats.get("harmless", 0)
            undetected = stats.get("undetected", 0)
            
            total_engines = malicious + suspicious + harmless + undetected
            detections = malicious + suspicious
            
            result = {
                "success": True,
                "detections": detections,
                "total_engines": total_engines,
                "malicious": malicious,
                "suspicious": suspicious,
                "harmless": harmless,
                "undetected": undetected,
                "permalink": f"https://www.virustotal.com/gui/url/{analysis_id}",
                "detection_rate": round((detections / total_engines * 100), 2) if total_engines > 0 else 0
            }
            
            print(f"✅ ANÁLISIS COMPLETO:")
            print(f"   Detecciones: {detections}/{total_engines}")
            print(f"   Malicioso: {malicious}")
            print(f"   Sospechoso: {suspicious}")
            print(f"   Tasa detección: {result['detection_rate']}%")
            print(f"{'='*60}\n")
            
            return result
            
        except requests.exceptions.Timeout:
            print("❌ TIMEOUT - VirusTotal no respondió")
            return self._error_response("Timeout - VirusTotal no respondió a tiempo")
        
        except requests.exceptions.RequestException as e:
            print(f"❌ ERROR DE CONEXIÓN: {str(e)}")
            return self._error_response(f"Error de conexión: {str(e)}")
        
        except KeyError as e:
            print(f"❌ ERROR EN RESPUESTA: Campo faltante {str(e)}")
            return self._error_response("Respuesta inválida de VirusTotal")
        
        except Exception as e:
            print(f"❌ ERROR INESPERADO: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._error_response(f"Error inesperado: {str(e)}")
    
    def _error_response(self, message):
        """Respuesta estándar para errores"""
        return {
            "success": False,
            "detections": 0,
            "total_engines": 0,
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "undetected": 0,
            "error": message,
            "permalink": None,
            "detection_rate": 0
        }
