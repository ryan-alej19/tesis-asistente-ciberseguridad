# Sistema de Gestion de Incidentes de Ciberseguridad
**Trabajo de Integracion Curricular - PUCE TEC**

## Descripcion General
Este proyecto consiste en un asistente web diseñado para la gestion, analisis y respuesta ante incidentes de ciberseguridad en pequeñas empresas. El sistema integra capacidades de analisis heuristico local y servicios externos (VirusTotal y Google Gemini) para proporcionar una evaluacion de riesgos rapida y comprensible.

El software ha sido desarrollado siguiendo una arquitectura moderna y escalable, priorizando la facilidad de despliegue y la integridad de los datos.

## Arquitectura del Sistema
El sistema utiliza una arquitectura cliente-servidor desacoplada:

*   **Backend:** Python 3.11 con Django Framework 4.2. Implementa una API RESTful segura, gestion de usuarios, logica de negocios y conectores a servicios externos.
*   **Frontend:** React 18 con Tailwind CSS. Proporciona una interfaz de usuario reactiva, dashboards interactivos (Recharts) y comunicacion asincrona con el backend.
*   **Base de Datos:** SQLite. Configuracion optimizada para entornos academicos y de demostracion, garantizando la portabilidad del sistema.
*   **Contenerizacion:** Docker. El proyecto incluye configuracion completa para despliegue mediante contenedores, asegurando la reproducibilidad del entorno.

## Requisitos Previos

Para ejecutar este sistema en un entorno local, se requiere:

1.  **Docker Desktop** (Version 4.0 o superior) instalado y en ejecucion.
2.  **Git** para la clonacion del repositorio.
3.  (Opcional) Node.js y Python 3.11 si se desea ejecutar sin contenedores.

## Guia de Instalacion y Ejecucion (Metodo Recomendado)

Este metodo utiliza Docker Compose para levantar todos los servicios automaticamente.

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd tesis-asistente-ciberseguridad
    ```

2.  **Configurar variables de entorno:**
    Asegurese de que el archivo `.env` en la carpeta `backend/` contenga las claves API necesarias (Gemini y VirusTotal).

3.  **Iniciar el sistema:**
    Abra una terminal en la raiz del proyecto y ejecute:
    ```bash
    docker-compose up -d --build
    ```
    *Este proceso puede tardar unos minutos la primera vez mientras se construyen las imagenes.*

4.  **Acceder a la aplicacion:**
    Una vez finalizada la carga, el sistema estara disponible en:
    *   **Frontend (Usuario):** http://localhost:3000
    *   **Backend (Admin):** http://localhost:8000/admin

5.  **Detener el sistema:**
    Para apagar los servicios correctamente:
    ```bash
    docker-compose down
    ```

## Estructura del Proyecto

*   `/backend`: Codigo fuente del servidor Django (Modelos, Vistas, Serializadores).
*   `/frontend`: Codigo fuente de la aplicacion React (Componentes, Paginas, Contexto).
*   `/docker-compose.yml`: Archivo de orquestacion de contenedores.
*   `README.md`: Documentacion principal del proyecto.

## Credenciales de Acceso (Entorno de Pruebas)

El sistema viene precargado con los siguientes usuarios para demostracion:

*   **Administrador:** admin / admin123
*   **Analista SOC:** analyst / analyst123
*   **Empleado:** employee / employee123

## Nota Academica
Este software forma parte del Trabajo de Integracion Curricular para la obtencion del titulo en Desarrollo de Software. Su uso esta destinado fines academicos y demostrativos.
