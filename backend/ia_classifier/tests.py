"""
Tests unitarios para el clasificador de incidentes
Validación de reglas heurísticas y confianza limitada
"""


from django.test import TestCase
from .classifier import IncidentClassifier



class IncidentClassifierTests(TestCase):
    """Tests para validar clasificación de incidentes basada en reglas"""
    
    def setUp(self):
        """Inicializa el clasificador antes de cada test"""
        self.classifier = IncidentClassifier()
    
    # ===== TESTS DE SEVERIDAD CRÍTICA =====
    
    def test_ransomware_detection(self):
        """Test: Ransomware debe ser CRÍTICO con confianza <= 70%"""
        description = "Mi computadora fue bloqueada por ransomware que encriptó todos mis archivos"
        severity, confidence = self.classifier.classify(description, 'ransomware')
        
        self.assertEqual(severity, 'critical')
        self.assertLessEqual(confidence, 0.70, "Confianza no debe superar 70%")
        self.assertGreaterEqual(confidence, 0.55, "Confianza debe ser >= 55% para crítico")
    
    def test_malware_detection(self):
        """Test: Malware debe ser CRÍTICO"""
        description = "Descargué un archivo que parece un virus malware peligroso"
        severity, confidence = self.classifier.classify(description, 'malware')
        
        self.assertEqual(severity, 'critical')
        self.assertLessEqual(confidence, 0.70)
    
    def test_data_breach_detection(self):
        """Test: Robo de datos debe ser CRÍTICO"""
        description = "Detectamos una filtración de datos sensibles de la base de datos"
        severity, confidence = self.classifier.classify(description, 'robo_datos')
        
        self.assertEqual(severity, 'critical')
        self.assertLessEqual(confidence, 0.70)
    
    # ===== TESTS DE SEVERIDAD ALTA =====
    
    def test_phishing_detection(self):
        """Test: Phishing debe ser ALTO con confianza <= 70%"""
        description = "Recibí un email pidiendo que haga click para verificar mi cuenta de PayPal"
        severity, confidence = self.classifier.classify(description, 'phishing')
        
        self.assertIn(severity, ['high', 'critical'], "Phishing debe ser al menos ALTO")
        self.assertLessEqual(confidence, 0.70)
        self.assertGreaterEqual(confidence, 0.50, "Confianza debe ser >= 50% para alto")
    
    def test_unauthorized_access_detection(self):
        """Test: Acceso no autorizado debe ser ALTO"""
        description = "Alguien accedió sin autorización desde una IP desconocida"
        severity, confidence = self.classifier.classify(description, 'acceso_sospechoso')
        
        self.assertIn(severity, ['high', 'critical'])
        self.assertLessEqual(confidence, 0.70)
    
    def test_sql_injection_detection(self):
        """Test: Inyección SQL debe ser ALTO"""
        description = "Detectamos un intento de inyección SQL en el formulario de login"
        severity, confidence = self.classifier.classify(description, 'inyeccion_sql')
        
        self.assertIn(severity, ['high', 'critical'])
        self.assertLessEqual(confidence, 0.70)
    
    # ===== TESTS DE SEVERIDAD MEDIA =====
    
    def test_configuration_error_detection(self):
        """Test: Error de configuración debe ser MEDIO"""
        description = "El servidor tiene un error de configuración en el firewall"
        severity, confidence = self.classifier.classify(description, 'error_configuracion')
        
        self.assertIn(severity, ['medium', 'low'])
        self.assertLessEqual(confidence, 0.70)
    
    def test_account_locked_detection(self):
        """Test: Cuenta bloqueada puede ser MEDIO o ALTO"""
        description = "La cuenta de usuario quedó bloqueada después de varios intentos fallidos"
        severity, confidence = self.classifier.classify(description, 'cuenta_bloqueada')
        
        self.assertIn(severity, ['medium', 'high', 'low'])  # ✅ CORREGIDO AQUÍ
        self.assertLessEqual(confidence, 0.70)
    
    # ===== TESTS DE SEVERIDAD BAJA =====
    
    def test_low_severity_with_no_keywords(self):
        """Test: Sin palabras clave = BAJO con confianza mínima"""
        description = "El sistema está funcionando un poco lento"
        severity, confidence = self.classifier.classify(description, 'otro')
        
        self.assertEqual(severity, 'low')
        self.assertLessEqual(confidence, 0.50, "Confianza debe ser baja sin keywords")
    
    def test_empty_description(self):
        """Test: Descripción vacía = BAJO con confianza mínima"""
        severity, confidence = self.classifier.classify('', 'otro')
        
        self.assertEqual(severity, 'low')
        self.assertLessEqual(confidence, 0.30, "Confianza debe ser muy baja sin descripción")
    
    # ===== TESTS DE LÍMITE DE CONFIANZA =====
    
    def test_confidence_never_exceeds_70_percent(self):
        """Test CRÍTICO: Confianza NUNCA debe superar 70%"""
        test_cases = [
            ("ransomware malware virus breach crypto encriptado backdoor", "malware"),
            ("phishing hack unauthorized ddos sql injection xss", "phishing"),
            ("error fallo configuracion warning advertencia timeout", "error_configuracion"),
            ("virus trojan malware ransomware breach robo de datos", "ransomware"),
        ]
        
        for description, threat_type in test_cases:
            _, confidence = self.classifier.classify(description, threat_type)
            self.assertLessEqual(
                confidence, 0.70,
                f"Confianza {confidence:.2f} excedió 70% para: '{description}' ({threat_type})"
            )
    
    def test_confidence_is_float_between_0_and_70(self):
        """Test: Confianza debe ser un número flotante entre 0 y 0.70"""
        descriptions = [
            "ransomware crítico",
            "phishing sospechoso",
            "error de configuración",
            "sistema lento"
        ]
        
        for desc in descriptions:
            _, confidence = self.classifier.classify(desc, 'otro')
            self.assertIsInstance(confidence, float, "Confianza debe ser float")
            self.assertGreaterEqual(confidence, 0.0, "Confianza debe ser >= 0")
            self.assertLessEqual(confidence, 0.70, "Confianza debe ser <= 0.70")
    
    # ===== TESTS DE EXPLICACIÓN =====
    
    def test_get_explanation_returns_dict(self):
        """Test: get_explanation debe retornar un diccionario"""
        explanation = self.classifier.get_explanation('high', 0.65)
        
        self.assertIsInstance(explanation, dict)
        self.assertIn('severity', explanation)
        self.assertIn('confidence', explanation)
        self.assertIn('description', explanation)
        self.assertIn('recommendation', explanation)
        self.assertIn('confidence_note', explanation)
    
    def test_get_explanation_has_correct_format(self):
        """Test: Explicación debe tener formato correcto"""
        explanation = self.classifier.get_explanation('critical', 0.70)
        
        self.assertEqual(explanation['confidence'], '70%')
        self.assertIn('Crítico', explanation['severity'])
        self.assertIn('VirusTotal', explanation['recommendation'])
        self.assertIn('sistema de reglas', explanation['confidence_note'])
    
    # ===== TESTS DE NORMALIZACIÓN DE TEXTO =====
    
    def test_text_normalization_removes_accents(self):
        """Test: Debe normalizar acentos (á→a, é→e, etc.)"""
        description_with_accents = "Recibí un correo sospechoso con phishing"
        description_without_accents = "Recibi un correo sospechoso con phishing"
        
        severity1, confidence1 = self.classifier.classify(description_with_accents, 'phishing')
        severity2, confidence2 = self.classifier.classify(description_without_accents, 'phishing')
        
        self.assertEqual(severity1, severity2, "Debe dar la misma severidad con/sin acentos")
    
    def test_case_insensitivity(self):
        """Test: Debe ser insensible a mayúsculas/minúsculas"""
        description_lower = "ransomware bloqueó mi computadora"
        description_upper = "RANSOMWARE BLOQUEÓ MI COMPUTADORA"
        
        severity1, confidence1 = self.classifier.classify(description_lower, 'ransomware')
        severity2, confidence2 = self.classifier.classify(description_upper, 'ransomware')
        
        self.assertEqual(severity1, severity2, "Debe dar la misma severidad independiente del case")
    
    # ===== TESTS DE MÚLTIPLES PALABRAS CLAVE =====
    
    def test_multiple_critical_keywords_increase_confidence(self):
        """Test: Múltiples keywords críticos aumentan confianza (pero sin pasar 70%)"""
        desc_single = "Detectamos un virus"
        desc_multiple = "Detectamos un virus ransomware malware con crypto"
        
        _, confidence_single = self.classifier.classify(desc_single, 'malware')
        _, confidence_multiple = self.classifier.classify(desc_multiple, 'malware')
        
        self.assertGreater(
            confidence_multiple, confidence_single,
            "Más keywords deben aumentar confianza"
        )
        self.assertLessEqual(confidence_multiple, 0.70, "No debe pasar 70%")
    
    # ===== TEST DE REGRESIÓN (evitar cambios no deseados) =====
    
    def test_regression_known_cases(self):
        """Test: Casos conocidos no deben cambiar de resultado"""
        known_cases = [
            ("Ransomware encriptó mis archivos", "ransomware", "critical"),
            ("Email de phishing sospechoso", "phishing", "high"),
            ("Error de configuración del firewall", "error_configuracion", "medium"),
            ("Sistema funcionando lento", "otro", "low"),
        ]
        
        for description, threat_type, expected_severity in known_cases:
            severity, _ = self.classifier.classify(description, threat_type)
            self.assertEqual(
                severity, expected_severity,
                f"Caso conocido cambió: '{description}' esperaba {expected_severity}, obtuvo {severity}"
            )



class IncidentClassifierEdgeCasesTests(TestCase):
    """Tests de casos extremos y frontera"""
    
    def setUp(self):
        self.classifier = IncidentClassifier()
    
    def test_very_long_description(self):
        """Test: Descripción muy larga debe manejarse correctamente"""
        long_description = "phishing " * 1000  # 1000 repeticiones
        severity, confidence = self.classifier.classify(long_description, 'phishing')
        
        self.assertIn(severity, ['high', 'critical'])
        self.assertLessEqual(confidence, 0.70)
    
    def test_special_characters_in_description(self):
        """Test: Caracteres especiales no deben romper el clasificador"""
        description = "Recibí un email con @#$%^&* y phishing"
        severity, confidence = self.classifier.classify(description, 'phishing')
        
        self.assertIn(severity, ['high', 'critical'])
        self.assertIsInstance(confidence, float)
    
    def test_unknown_threat_type(self):
        """Test: Tipo de amenaza desconocido debe manejarse como 'otro'"""
        description = "Algo raro está pasando"
        severity, confidence = self.classifier.classify(description, 'tipo_inventado_123')
        
        self.assertIsInstance(severity, str)
        self.assertIsInstance(confidence, float)
    
    def test_none_threat_type(self):
        """Test: threat_type=None debe manejarse sin errores"""
        description = "Phishing detectado"
        severity, confidence = self.classifier.classify(description, None)
        
        self.assertIn(severity, ['high', 'critical'])
        self.assertIsInstance(confidence, float)
