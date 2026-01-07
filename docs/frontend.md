# Arquitectura del Frontend

El frontend es una aplicación React responsable de la interfaz de usuario del sistema de gestión de incidentes de ciberseguridad.

## Estructura de Carpetas y Archivos

*   **`public/`**: Contiene los archivos estáticos de la aplicación, como `index.html`, el manifiesto de la aplicación y los iconos.
*   **`src/`**: Contiene el código fuente de la aplicación React.

### `src/`

*   **`App.js`**: El componente principal de la aplicación. Es probable que gestione el enrutamiento y la disposición global de la interfaz.
*   **`index.js`**: El punto de entrada de la aplicación React, donde se renderiza el componente `App` en el DOM.
*   **`components/`**: Contiene componentes de interfaz de usuario reutilizables.
    *   `CreateIncident.js`: Formulario para la creación de nuevos incidentes.
    *   `IncidentList.js`: Muestra una lista de incidentes.
    *   `IncidentAnalysisModal.js`: Un modal para mostrar los detalles y el análisis de un incidente.
    *   `IncidentReporter.js`: Componente relacionado con el reporte de incidentes.
*   **`pages/`**: Contiene los componentes que representan las páginas completas de la aplicación, asociadas a las diferentes rutas.
    *   `LoginPage.js`: La página de inicio de sesión.
    *   `Dashboard.js`: Un panel de control genérico.
    *   `AdminDashboard.js`, `AnalystDashboard.js`, `EmployeeDashboard.js`: Paneles de control específicos para cada rol de usuario (administrador, analista, empleado).
    *   `ReportingPage.js`: La página donde los usuarios pueden reportar nuevos incidentes.
*   **`services/`**: Módulos para interactuar con la API del backend.
    *   `api.js`: Un cliente de API genérico, probablemente configurado con `axios` o `fetch` para realizar las peticiones HTTP. Puede manejar la configuración de cabeceras, como los tokens de autenticación.
    *   `incidentService.js`: Un servicio que utiliza el cliente de `api.js` para realizar llamadas específicas relacionadas con los incidentes (crear, listar, obtener detalles).
*   **`context/`**: Contiene proveedores de React Context para la gestión del estado global.
    *   `AuthContext.js`: Gestiona el estado de autenticación del usuario, como el token de acceso y la información del usuario actual.
*   **`styles/`**: Contiene archivos CSS para dar estilo a la aplicación.

## Flujo de Datos

1.  El usuario navega a la `LoginPage` e introduce sus credenciales.
2.  `AuthContext` gestiona la llamada a la API de autenticación y, si tiene éxito, almacena el token de autenticación.
3.  El usuario es redirigido a su panel de control correspondiente (`AdminDashboard`, `AnalystDashboard` o `EmployeeDashboard`).
4.  Dependiendo de su rol, el usuario puede ver una lista de incidentes (`IncidentList`) o reportar un nuevo incidente (`ReportingPage` o `CreateIncident`).
5.  Cuando se crea un incidente, `incidentService` se encarga de enviar los datos a la API del backend.
6.  Los datos de los incidentes se obtienen del backend a través de `incidentService` y se muestran en los componentes correspondientes.

## Enrutamiento

El enrutamiento de la aplicación (no visible en la estructura de archivos, pero implícito) probablemente se gestiona con una librería como `react-router-dom`, que renderiza los diferentes componentes de `pages/` en función de la URL actual.
