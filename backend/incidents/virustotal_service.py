"""
SERVICIO VIRUSTOTAL + GEMINI AI - TESIS CIBERSEGURIDAD
Ryan Gallegos Mera - PUCESI
Última actualización: 07 de Enero, 2026
"""

import requests
import time
import os
import google.generativeai as genai
from django.conf import settings
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


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
        """
        if not self.api_key:
            return self._error_response("API Key de VirusTotal no configurada")
        
        try:
            print(f"\n{'='*60}")
            print(f"[VIRUSTOTAL] ANALIZANDO URL: {url}")
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
                print(f"[ERROR] Error HTTP: {response.status_code}")
                return self._error_response(f"Error HTTP {response.status_code}")
            
            analysis_id = response.json()["data"]["id"]
            print(f"[INFO] URL enviada - Analysis ID: {analysis_id}")
            
            # Paso 2: Esperar 3 segundos para que VirusTotal procese
            print("[INFO] Esperando análisis...")
            time.sleep(3)
            
            # Paso 3: Obtener resultado del análisis
            result_url = f"{self.BASE_URL}/analyses/{analysis_id}"
            result_response = requests.get(result_url, headers=self.headers, timeout=15)
            
            if result_response.status_code != 200:
                print(f"[ERROR] Error obteniendo resultado: {result_response.status_code}")
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
            
            print(f"[SUCCESS] ANÁLISIS COMPLETO:")
            print(f"   Detecciones: {detections}/{total_engines}")
            print(f"   Malicioso: {malicious}")
            print(f"   Sospechoso: {suspicious}")
            print(f"   Tasa detección: {result['detection_rate']}%")
            print(f"{'='*60}\n")
            
            return result
            
        except requests.exceptions.Timeout:
            print("[ERROR] TIMEOUT - VirusTotal no respondió")
            return self._error_response("Timeout - VirusTotal no respondió a tiempo")
        
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Error de conexión: {str(e)}")
            return self._error_response(f"Error de conexión: {str(e)}")
        
        except KeyError as e:
            print(f"[ERROR] Respuesta inválida: Campo faltante {str(e)}")
            return self._error_response("Respuesta inválida de VirusTotal")
        
        except Exception as e:
            print(f"[ERROR] Error inesperado: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._error_response(f"Error inesperado: {str(e)}")
    
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

    def analyze_file(self, file_obj):
        """
        Analiza un archivo con VirusTotal (Real SHA-256 calc + Upload)
        """
        if not self.api_key:
            return self._error_response("API Key de VirusTotal no configurada")
        
        import hashlib
        
        try:
            print(f"\n{'='*60}")
            print(f"[VIRUSTOTAL] ANALIZANDO ARCHIVO: {file_obj.name}")
            print(f"{'='*60}")
            
            # 1. Calcular SHA-256
            sha256_hash = hashlib.sha256()
            for chunk in file_obj.chunks():
                sha256_hash.update(chunk)
            file_hash = sha256_hash.hexdigest()
            print(f"[INFO] SHA-256 Calculado: {file_hash}")
            
            # --- MOCK PARA ARCHIVO EICAR O DEMO (Opcional, mantener logic si es muy grande) ---
            # Si el archivo es > 32MB la API standard falla.
            # Convertimos el archivo de vuelta al inicio para leerlo de nuevo si se sube
            file_obj.seek(0)

            # Paso 2: Subir archivo
            files = {'file': (file_obj.name, file_obj, 'application/octet-stream')}
            scan_url = f"{self.BASE_URL}/files"
            
            response = requests.post(
                scan_url, 
                headers=self.headers, 
                files=files,
                timeout=60 # Mayor timeout para subidas
            )
            
            if response.status_code != 200:
                print(f"[ERROR] Error HTTP al subir: {response.status_code} - {response.text}")
                return self._error_response(f"Error VirusTotal: {response.status_code}")
            
            analysis_id = response.json()["data"]["id"]
            print(f"[INFO] Archivo enviado - Analysis ID: {analysis_id}")
            
            print("[INFO] Esperando análisis (Puede tardar)...")
            # Loop de espera (máx 30 segs)
            for i in range(5):
                time.sleep(5) 
                print(f"[INFO] Checkeando resultado... intento {i+1}")
                
                result_url = f"{self.BASE_URL}/analyses/{analysis_id}"
                result_response = requests.get(result_url, headers=self.headers, timeout=15)
                
                if result_response.status_code == 200:
                    data = result_response.json()["data"]["attributes"]
                    status = data.get("status")
                    if status == "completed":
                        break
            
            if result_response.status_code != 200:
                return self._error_response("Error al obtener análisis")
            
            data = result_response.json()["data"]["attributes"]
            stats = data.get("stats", {})
            
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            
            total_engines = sum(stats.values())
            detections = malicious + suspicious
            
            # Link permanente usando el hash calculado (más seguro)
            permalink = f"https://www.virustotal.com/gui/file/{file_hash}"
            
            result = {
                "success": True,
                "detections": detections,
                "total_engines": total_engines,
                "malicious": malicious,
                "suspicious": suspicious,
                "file_hash": file_hash,
                "permalink": permalink,
                "detection_rate": round((detections / total_engines * 100), 2) if total_engines > 0 else 0
            }
            return result

        except Exception as e:
            print(f"[ERROR] Error inesperado en análisis de archivo: {str(e)}")
            return self._error_response(f"Error procesando archivo: {str(e)}")


# =========================================================
# SERVICIO GEMINI AI (JSON STRUCTURED)
# =========================================================

def analyze_with_gemini(incident_data):
    """
    Analiza un incidente devolviendo JSON estructurado con explicaciones claras.
    """
    try:
        print(f"\n{'='*60}")
        print(f"[AI] ANALIZANDO CON GEMINI AI (JSON MODE)")
        print(f"{'='*60}")
        
        if not GEMINI_API_KEY:
            return {
                "success": False,
                "error": "Gemini API key no configurada",
                "risk_level": "DESCONOCIDO",
                "explanation_simple": "No se pudo realizar análisis.",
                "confidence": 0.0
            }
        
        # Crear el modelo
        model = genai.GenerativeModel('gemini-2.0-flash') # Modelo disponible verificado
        
        # Construir contexto de VT
        vt_info = "No hay análisis de VirusTotal disponible."
        vt = incident_data.get('virustotal_result')
        if vt and vt.get('success'):
            vt_info = f"""
            RESULTADOS VIRUSTOTAL:
            - Detecciones Maliciosas: {vt.get('detections', 0)} de {vt.get('total_engines', 0)} motores.
            - Hash del archivo: {vt.get('file_hash', 'N/A')}
            - Tasa de detección: {vt.get('detection_rate', 0)}%
            """
        
        prompt = f"""
        Actúa como un experto analista del SOC (Security Operations Center).
        Analiza el siguiente incidente reportado por un empleado y devuelve un objeto JSON ESTRICTO.
        
        DETALLES DEL INCIDENTE:
        - Tipo: {incident_data.get('incident_type', 'General')}
        - Descripción: "{incident_data.get('description', 'Sin descripción')}"
        - URL Sospechosa: {incident_data.get('url', 'Ninguna')}
        {vt_info}
        
        Genera la respuesta EXCLUSIVAMENTE en formato JSON con esta estructura:
        {{
            "risk_level": "ALTO" | "MEDIO" | "BAJO",
            "simple_explanation": "Una frase clara y directa para el empleado explicando por qué es peligroso o seguro. Sin tecnicismos.",
            "technical_context": "Un párrafo detallado para el administrador técnico explicando vectores de ataque, TTPs o detalles del malware.",
            "indicators": ["Lista", "de", "indicadores", "clave", "detectados"],
            "recommendations": ["Acción 1", "Acción 2"],
            "confidence": 95
        }}
        """
        
        print("[INFO] Enviando prompt a Gemini...")
        response = model.generate_content(prompt)
        response_text = response.text
        
        print(f"[SUCCESS] Respuesta recibida (Raw):\n{response_text[:100]}...")
        
        # Limpieza de JSON (por si viene con backticks)
        clean_json = response_text.strip()
        if clean_json.startswith('```json'):
            clean_json = clean_json.replace('```json', '').replace('```', '')
        
        import json
        try:
            data = json.loads(clean_json)
        except json.JSONDecodeError:
            print("[ERROR] Fallo al parsear JSON de Gemini. Usando fallback.")
            data = {
                "risk_level": "MEDIO",
                "simple_explanation": "El análisis automático no pudo estructurar la respuesta, pero se detectaron elementos sospechosos.",
                "technical_context": response_text,
                "indicators": ["Error de parseo IA"],
                "recommendations": ["Contactar a soporte"],
                "confidence": 50
            }

        # Mapeo final para compatibilidad
        result = {
            "success": True,
            "risk_level": data.get("risk_level", "MEDIO"),
            "analysis": data.get("simple_explanation", ""), # Compatibilidad
            "explanation": data.get("simple_explanation", ""),
            "technical_context": data.get("technical_context", ""),
            "indicators": data.get("indicators", []),
            "recommendations": " ".join(data.get("recommendations", [])), # String para compatibilidad
            "recommendations_list": data.get("recommendations", []), # Lista nueva
            "confidence": float(data.get("confidence", 70)),
            "source": "Gemini 1.5 Flash"
        }
        
        return result
        
    except Exception as e:
        print(f"[ERROR] GEMINI CRASH: {str(e)}")
        # Fallback local muy básico
        return {
             "success": True,
             "risk_level": "MEDIO", 
             "explanation": "No se pudo conectar con la IA. Se recomienda precaución.",
             "technical_context": f"Error de conexión: {str(e)}",
             "confidence": 0,
             "source": "System Fallback"
        }
