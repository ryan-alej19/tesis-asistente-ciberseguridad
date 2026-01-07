# Arquitectura del Backend

El backend es una aplicación Django que utiliza Django REST Framework para construir una API RESTful para la gestión de incidentes de ciberseguridad.

## Módulos Principales

### 1. `config`

Este es el módulo principal del proyecto Django.

*   `settings.py`: Contiene la configuración del proyecto, incluyendo las aplicaciones instaladas (`INSTALLED_APPS`), la configuración de la base de datos, y las claves de API para servicios externos como VirusTotal y Gemini. También define el modelo de usuario personalizado (`AUTH_USER_MODEL`).
*   `urls.py`: Es el enrutador de URLs principal del proyecto. Define las rutas raíz de la API, incluyendo la autenticación y los endpoints de gestión de incidentes.

### 2. `incidents`

Este es el corazón de la aplicación, manejando toda la lógica relacionada con los incidentes.

*   `models.py`:
    *   `CustomUser`: Extiende el modelo de usuario de Django para incluir roles (`admin`, `analyst`, `employee`). Esto es fundamental para el control de acceso basado en roles.
    *   `Incident`: El modelo principal que almacena todos los datos relacionados con un incidente, incluyendo la descripción, el tipo, y los resultados del análisis de servicios externos.
*   `views.py`:
    *   Contiene la lógica de negocio principal para la API.
    *   `create_incident`: Orquesta las llamadas a los servicios de VirusTotal y Gemini para enriquecer los datos del incidente.
    *   Implementa la lógica de control de acceso basada en roles para los diferentes endpoints.
*   `serializers.py`: Define los serializadores de Django REST Framework para los modelos `Incident` y `CustomUser`, permitiendo su conversión a y desde JSON.
*   `urls.py`: Define las rutas específicas para el módulo de incidentes (`/api/incidents/`).
*   `virustotal_service.py`: Encapsula la lógica para interactuar con las APIs externas de VirusTotal y Google Gemini.
*   `gemini_service.py`: Contiene la lógica para interactuar con la API de Gemini para el análisis de incidentes.

### 3. `ia_classifier`

Este módulo proporciona una clasificación inicial de incidentes basada en reglas.

*   `classifier.py`:
    *   `IncidentClassifier`: Implementa una clasificación de incidentes basada en un conjunto de reglas predefinidas.
    *   Proporciona una evaluación de referencia de la gravedad de un incidente, que es una parte clave del aspecto de "IA explicable" del proyecto.
*   `rules.py`: Define las reglas utilizadas por el `IncidentClassifier`.

## Flujo de Datos

1.  Un usuario (generalmente un `empleado`) crea un nuevo incidente a través de la API.
2.  La vista `create_incident` recibe la solicitud.
3.  La vista llama al `IncidentClassifier` para obtener una clasificación inicial.
4.  Si se proporciona una URL, se llama al `VirusTotalService` para analizarla.
5.  Se llama a `analyze_with_gemini` para obtener un análisis contextual del incidente.
6.  Todos los datos se guardan en un nuevo objeto `Incident`.
7.  Los `analistas` y `administradores` pueden ver y gestionar los incidentes a través de otros endpoints de la API.

## Autenticación y Autorización

*   La autenticación se maneja mediante tokens (probablemente JWT o similar) a través del endpoint `/api/auth/token/`.
*   La autorización se basa en los roles definidos en el modelo `CustomUser`. Diferentes roles tienen acceso a diferentes endpoints y funcionalidades.
