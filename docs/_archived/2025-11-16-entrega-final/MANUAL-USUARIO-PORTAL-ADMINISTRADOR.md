---
titulo: "Manual de Usuario — Portal de Administrador GAMILIT"
tipo: entrega
fecha_creacion: "2025-11-16"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Manual de Usuario — Portal de Administrador GAMILIT
## **Versión: 2.0.0**
## **Fecha: Febrero 2026**

---

## **2. ÍNDICE**

1.  [PORTADA](#1-portada)
2.  [ÍNDICE](#2-índice)
3.  [INTRODUCCIÓN](#3-introducción)
    -   3.1 Propósito del Portal
    -   3.2 Audiencia Objetivo
    -   3.3 Niveles de Acceso y Responsabilidades
4.  [REQUISITOS PREVIOS](#4-requisitos-previos)
    -   4.1 Requisitos Técnicos
    -   4.2 Permisos de Cuenta
5.  [DESCRIPCIÓN GENERAL](#5-descripción-general)
    -   5.1 Arquitectura del Portal
    -   5.2 Arquitectura Multi-Tenancy
    -   5.3 Navegación Principal
    -   5.4 Roles y Niveles de Acceso
6.  [GUÍA DE USO](#6-guía-de-uso)
    -   6.1 Inicio de Sesión y Autenticación
    -   6.2 Dashboard Principal (`AdminDashboardPage`)
    -   6.3 Gestión de Usuarios (`AdminUsersPage`)
    -   6.4 Gestión de Instituciones (`AdminInstitutionsPage`)
    -   6.5 Gestión de Roles y Permisos (`AdminRolesPage`)
    -   6.6 Gestión de Contenido Educativo (`AdminContentPage`)
    -   6.7 Configuración de Gamificación (`AdminGamificationPage`)
    -   6.8 Asignación Aula-Maestro (`AdminClassroomTeacherPage`)
    -   6.9 Analytics y Progreso Global (`AdminAnalyticsPage`, `AdminProgressPage`)
    -   6.10 Monitoreo del Sistema (`AdminMonitoringPage`)
    -   6.11 Alertas del Sistema (`AdminAlertsPage`)
    -   6.12 Reportes Globales (`AdminReportsPage`)
    -   6.13 Logs de Auditoría (`AdminAuditLogsPage`)
    -   6.14 Feature Flags y A/B Testing (`AdminAdvancedPage`)
    -   6.15 Configuración Global del Sistema (`AdminSettingsPage`)
    -   6.16 Notificaciones y Preferencias (`AdminNotificationsPage`, `AdminNotificationPreferencesPage`)
7.  [MANTENIMIENTO Y ACTUALIZACIÓN](#7-mantenimientoyactualización)
8.  [SOLUCIÓN DE PROBLEMAS](#8-solución-de-problemas)
9.  [GLOSARIO](#9-glosario)
10. [APÉNDICES](#10-apéndices)
    -   Apéndice A: Matriz de Permisos por Rol
    -   Apéndice B: Configuración de Feature Flags
    -   Apéndice C: Tipos de Reportes Disponibles
    -   Apéndice D: Comandos de Mantenimiento Esenciales
11. [DATOS DE CONTACTO](#11-datos-de-contacto)

---

## **3. INTRODUCCIÓN**

### **3.1 Propósito del Portal**

El Portal de Administrador de GAMILIT es el centro de control centralizado para la gestión, configuración y monitoreo de toda la plataforma educativa. Proporciona a los administradores las herramientas necesarias para supervisar la actividad de los usuarios, administrar las instituciones, configurar la experiencia de gamificación, gestionar el contenido y asegurar la salud y el rendimiento del sistema.

### **3.2 Audiencia Objetivo**

Este manual está dirigido a los usuarios con roles de **Administrador** y **Super Administrador** del sistema GAMILIT. Se asume que el lector tiene un entendimiento básico de la gestión de plataformas web y es responsable de la operación y configuración de la plataforma para una o varias instituciones educativas.

### **3.3 Niveles de Acceso y Responsabilidades**

El acceso al portal está restringido y basado en roles. Las responsabilidades clave incluyen:
-   **Super Admin:** Control total sobre todas las instituciones y configuraciones críticas del sistema. Responsable del mantenimiento global, la gestión de roles y la configuración de parámetros de alto nivel.
-   **Admin:** Control sobre las instituciones asignadas. Responsable de la gestión de usuarios, contenido, y configuraciones específicas de su tenant, dentro de los límites establecidos por el Super Admin.

---

## **4. REQUISITOS PREVIOS**

### **4.1 Requisitos Técnicos**

-   **Navegador Web:** Una versión actualizada de Google Chrome, Mozilla Firefox, Safari o Microsoft Edge.
-   **Conexión a Internet:** Conexión a internet estable de banda ancha.
-   **Resolución de Pantalla:** Mínimo 1280x800 para una visualización óptima.

### **4.2 Permisos de Cuenta**

Para acceder al Portal de Administrador, es indispensable contar con una cuenta de usuario activa en GAMILIT con uno de los siguientes roles asignados: `ADMIN` o `SUPER_ADMIN`. El acceso a funcionalidades específicas dentro del portal dependerá de los permisos granulares configurados para su rol.

---

## **5. DESCRIPCIÓN GENERAL**

### **5.1 Arquitectura del Portal**

El portal es una aplicación web moderna (Single Page Application) que se comunica con el backend de GAMILIT a través de una API REST segura. Su diseño está optimizado para la eficiencia, permitiendo la gestión de grandes volúmenes de datos y operaciones complejas de forma intuitiva.

### **5.2 Arquitectura Multi-Tenancy**

GAMILIT opera bajo un modelo Multi-Tenancy, lo que significa que múltiples instituciones educativas (tenants) coexisten en la misma plataforma, pero con sus datos (usuarios, aulas, progreso) completamente aislados y seguros. Los Super Admins pueden supervisar todos los tenants, mientras que los Admins generalmente gestionan uno o más tenants específicos.

### **5.3 Navegación Principal**

La interfaz del portal se compone de tres áreas principales:

1.  **Barra de Navegación Lateral:** Contiene enlaces a todas las páginas y módulos principales del sistema.
2.  **Área de Contenido Principal:** Muestra la página seleccionada, con sus tablas, formularios y visualizaciones de datos.
3.  **Encabezado Superior:** Muestra información del usuario administrador, acceso a notificaciones y configuraciones de perfil.

[Captura: Pantalla principal del Portal de Administrador, destacando la barra de navegación, el área de contenido y el encabezado.]

### **5.4 Roles y Niveles de Acceso**

El sistema utiliza un Control de Acceso Basado en Roles (RBAC) para gestionar los permisos.

-   **Super Admin:** Acceso sin restricciones a todas las 18 páginas y funcionalidades. Puede crear y modificar roles, así como acceder a configuraciones críticas del sistema como los Feature Flags.
-   **Admin:** Acceso a un subconjunto de páginas y funcionalidades, definido por el Super Admin. Típicamente enfocado en la gestión operativa de su institución (usuarios, aulas, contenido).

---

## **6. GUÍA DE USO**

Esta sección detalla el funcionamiento de cada una de las páginas del portal.

### **6.1 Inicio de Sesión y Autenticación**

1.  Navegue a la URL designada para el portal: `https://admin.gamilit.com`.
2.  Ingrese su correo electrónico y contraseña registrados.
3.  Si la autenticación de dos factores (2FA) está habilitada para su cuenta, se le solicitará un código de su aplicación de autenticación.
4.  Al iniciar sesión exitosamente, será redirigido al Dashboard Principal.

### **6.2 Dashboard Principal (`AdminDashboardPage`)**

El dashboard ofrece una vista panorámica del estado de la plataforma.

-   **Métricas Globales:** Widgets que muestran KPIs en tiempo real, como número total de usuarios activos, instituciones, aulas creadas y ejercicios completados.
-   **Gráficas de Actividad:** Visualizaciones de la actividad de los usuarios en las últimas 24 horas, 7 días y 30 días.
-   **Salud del Sistema:** Indicadores de rendimiento del servidor (uso de CPU, memoria, tiempo de respuesta de la API).
-   **Alertas Recientes:** Un resumen de las últimas alertas críticas del sistema que requieren atención.

[Captura: Dashboard principal con widgets de KPIs, gráficas de actividad y monitor de salud del sistema.]

### **6.3 Gestión de Usuarios (`AdminUsersPage`)**

Esta página centraliza todas las operaciones relacionadas con los usuarios.

#### **6.3.1 Crear Usuarios**
1.  Haga clic en el botón "Crear Usuario".
2.  Complete el formulario con los datos requeridos: nombre, apellido, correo electrónico, institución y rol inicial.
3.  Una vez creado, el usuario recibirá un correo de bienvenida para establecer su contraseña.

#### **6.3.2 Editar y Desactivar Usuarios**
1.  Utilice la barra de búsqueda o los filtros para localizar al usuario.
2.  Haga clic en el icono de "Editar" en la fila del usuario.
3.  En el modal de edición, modifique los datos necesarios.
4.  Puede cambiar el estado del usuario de "Activo" a "Inactivo" para suspender su acceso sin eliminar sus datos.

#### **6.3.3 Asignación de Roles**
Dentro del formulario de edición de usuario, puede modificar los roles asignados. Seleccione o deseleccione roles de la lista disponible para ajustar los permisos del usuario.

#### **6.3.4 Importación Masiva**
1.  Vaya a la pestaña "Operaciones Masivas" y seleccione "Importar Usuarios".
2.  Descargue la plantilla CSV.
3.  Rellene la plantilla con los datos de los usuarios a importar.
4.  Suba el archivo CSV. El sistema procesará la solicitud en segundo plano y le notificará al finalizar.

### **6.4 Gestión de Instituciones (`AdminInstitutionsPage`)**

Permite administrar los tenants de la plataforma.

#### **6.4.1 Crear Instituciones**
1.  Haga clic en "Crear Institución".
2.  Ingrese el nombre de la institución, un identificador único (slug) y los datos del administrador principal.
3.  Guarde los cambios para registrar la nueva institución en el sistema.

#### **6.4.2 Configurar Planes y Límites**
1.  Edite una institución existente.
2.  En la pestaña "Suscripción", seleccione el plan asignado.
3.  Establezca los límites específicos (número de usuarios, aulas, almacenamiento) según el plan contratado.

### **6.5 Gestión de Roles y Permisos (`AdminRolesPage`)**

(Generalmente accesible solo para Super Admins)
Esta sección permite una gestión granular de los permisos mediante RBAC.

1.  **Ver Roles:** La página muestra una lista de roles existentes (p. ej., Super Admin, Admin, Teacher, Student).
2.  **Crear/Editar Rol:** Puede crear roles personalizados o editar los existentes.
3.  **Asignar Permisos:** Para cada rol, se presenta una matriz de permisos que cubre todas las acciones posibles en el sistema. Marque o desmarque las casillas para conceder o revocar acceso a funcionalidades específicas (p. ej., "Puede eliminar usuarios", "Puede configurar gamificación").

[Captura: Matriz de edición de un rol, mostrando una lista de permisos granulares.]

### **6.6 Gestión de Contenido Educativo (`AdminContentPage`)**

Este módulo permite supervisar y administrar todo el catálogo de contenido de GAMILIT.

-   **Vista de Módulos y Ejercicios:** Navegue por la estructura de contenido, viendo todos los módulos y los ejercicios que contienen.
-   **Gestión de Contenido:** Cree, edite o desactive módulos y ejercicios. El editor de ejercicios permite configurar su tipo (crucigrama, línea de tiempo, etc.), preguntas, respuestas, y recursos multimedia asociados.
-   **Vista de Asignaciones (`AdminAssignmentsPage`):** Desde aquí se puede acceder a una vista global de todas las asignaciones de contenido, permitiendo filtrar por institución, aula, maestro o estado (pendiente, completada).

### **6.7 Configuración de Gamificación (`AdminGamificationPage`)**

Aquí se definen los parámetros que rigen la experiencia gamificada de toda la plataforma.

#### **6.7.1 Rangos Maya**
Configure los diferentes rangos que los usuarios pueden alcanzar (p. ej., Escriba, Sacerdote, Halach Uinik). Para cada rango, defina el umbral de Puntos de Experiencia (XP) necesario para alcanzarlo.

#### **6.7.2 ML Coins (Marie's Legacy Coins)**
Ajuste la "economía" del juego:
-   **Tasas de Ganancia:** Defina cuántas ML Coins se otorgan por completar ejercicios, iniciar sesión diariamente, etc.
-   **Costos en la Tienda:** Establezca los precios de los ítems virtuales (avatares, fondos) que los usuarios pueden comprar.

#### **6.7.3 Logros e Insignias**
Cree y gestione los logros que los usuarios pueden desbloquear. Defina el nombre, descripción, icono (insignia) y los criterios para obtenerlo (p. ej., "Completar 10 ejercicios sin errores").

#### **6.7.4 Misiones**
Configure misiones especiales (diarias, semanales) que ofrecen recompensas adicionales. Por ejemplo: "Completa 3 ejercicios del Módulo 2 hoy para ganar 100 XP extra".

### **6.8 Asignación Aula-Maestro (`AdminClassroomTeacherPage`)**

Esta herramienta facilita la gestión de la relación entre aulas y maestros.

-   **Vista Centralizada:** Muestra una tabla con todas las aulas y los maestros asignados.
-   **Asignar Maestro:** Seleccione un aula y, desde un menú desplegable, asigne uno o más maestros.
-   **Filtrado y Búsqueda:** Busque rápidamente por nombre de aula, maestro o institución para facilitar la gestión.

### **6.9 Analytics y Progreso Global (`AdminAnalyticsPage`, `AdminProgressPage`)**

Estas páginas ofrecen una visión profunda del rendimiento y la participación en la plataforma.

-   **Dashboard de Analytics:** Visualice métricas avanzadas sobre la adquisición de usuarios, retención, y engagement. Compare el rendimiento entre diferentes instituciones.
-   **Dashboard de Progreso Académico:** Monitoree el avance académico global. Vea tasas de completitud de módulos, puntajes promedio por ejercicio y detecte áreas donde los estudiantes tienen más dificultades.

[Captura: Gráfica de progreso académico que muestra el rendimiento promedio por módulo educativo.]

### **6.10 Monitoreo del Sistema (`AdminMonitoringPage`)**

Herramientas en tiempo real para supervisar la salud técnica de la plataforma.

-   **Métricas de Servidor:** Gráficas en vivo de uso de CPU, memoria RAM, tráfico de red y latencia de la base de datos.
-   **Estado de Servicios:** Indicadores de estado (verde, amarillo, rojo) para los microservicios clave (autenticación, gamificación, base de datos).
-   **Logs de Errores:** Un visor en tiempo real de los errores críticos que ocurren en el sistema.

### **6.11 Alertas del Sistema (`AdminAlertsPage`)**

Centraliza la gestión de todas las alertas generadas por el sistema.

-   **Tipos de Alertas:** El sistema genera alertas por fallos técnicos (p. ej., "La base de datos superó el 80% de su capacidad") o por eventos de intervención (p. ej., "Usuario X ha fallado 5 inicios de sesión seguidos").
-   **Gestión de Alertas:** Vea, filtre y marque las alertas como "leídas" o "resueltas".

### **6.12 Reportes Globales (`AdminReportsPage`)**

Genere y descargue reportes detallados en formato CSV o PDF.

-   **Generador de Reportes:** Seleccione el tipo de reporte (ver Apéndice C), el rango de fechas y los filtros deseados (p. ej., por institución).
-   **Historial de Reportes:** Vea una lista de los reportes generados anteriormente y descárguelos de nuevo.

### **6.13 Logs de Auditoría (`AdminAuditLogsPage`)**

Un registro inmutable de todas las acciones importantes realizadas en el sistema.

-   **Trazabilidad:** Vea quién hizo qué y cuándo. Cada entrada de log incluye el usuario, la acción realizada (p. ej., "Usuario `admin@gamilit.com` eliminó al usuario `test@example.com`"), la fecha y la dirección IP.
-   **Búsqueda y Filtrado:** Busque eventos por usuario, tipo de acción o rango de fechas para investigar incidentes de seguridad o realizar auditorías.

### **6.14 Feature Flags y A/B Testing (`AdminAdvancedPage`)**

(Generalmente accesible solo para Super Admins)
Permite habilitar o deshabilitar funcionalidades de forma dinámica sin necesidad de un despliegue de código.

-   **Gestión de Flags:** Vea una lista de todas las funcionalidades controladas por flags. Active o desactive un flag para todos los usuarios.
-   **Lanzamiento Gradual:** Configure un flag para que una nueva funcionalidad se active solo para un porcentaje de usuarios (p. ej., 10%) o para un grupo específico (p. ej., solo para una institución). Esto es clave para realizar A/B testing.

### **6.15 Configuración Global del Sistema (`AdminSettingsPage`)**

Punto central para configurar parámetros globales de la plataforma.

-   **Configuraciones de Correo:** Configure el servidor SMTP para el envío de correos transaccionales.
-   **Integraciones:** Gestione claves de API para servicios de terceros (p. ej., Google Analytics, Sentry).
-   **Parámetros de la Aplicación:** Ajuste variables como el tiempo de expiración de la sesión, políticas de contraseñas, etc.

### **6.16 Notificaciones y Preferencias (`AdminNotificationsPage`, `AdminNotificationPreferencesPage`)**

-   **Centro de Notificaciones:** Similar a una bandeja de entrada, muestra todas las notificaciones del sistema dirigidas a usted (p. ej., "Se ha generado un nuevo reporte", "Una importación masiva ha finalizado").
-   **Preferencias de Notificación:** Configure qué eventos deben notificarle y por qué canal (dentro de la app, por correo electrónico).

---

## **7. MANTENIMIENTO Y ACTUALIZACIÓN**

-   **Actualizaciones del Sistema:** Las actualizaciones se despliegan en ventanas de mantenimiento programadas y comunicadas con antelación. Durante este tiempo, el portal puede no estar disponible.
-   **Backups de Base de Datos:** El sistema realiza copias de seguridad automáticas y encriptadas de la base de datos diariamente. Las restauraciones son gestionadas por el equipo técnico.
-   **Monitoreo de Salud del Servidor:** Utilice la página de **Monitoreo del Sistema (6.10)** para una supervisión proactiva. Reporte cualquier anomalía persistente al equipo de soporte técnico.

---

## **8. SOLUCIÓN DE PROBLEMAS**

-   **Problemas de Permisos:** Si no puede ver una página o realizar una acción, es probable que su rol no tenga el permiso necesario. Contacte a un Super Administrador para verificar la configuración de su rol en la página de **Gestión de Roles y Permisos (6.5)**.
-   **Errores en Importación Masiva:** Si una importación de usuarios falla, descargue el archivo de log de errores desde la notificación. Este archivo detallará qué filas del CSV contenían errores y por qué (p. ej., "Correo electrónico duplicado", "Formato de fecha inválido").
-   **Problemas de Rendimiento:** Si el portal se siente lento, realice los siguientes pasos: 1) Verifique su conexión a internet. 2) Limpie la caché de su navegador. 3) Consulte la página de **Monitoreo del Sistema (6.10)** para ver si hay problemas globales. Si el problema persiste, contacte a soporte.
-   **Alertas Críticas del Sistema:** Al recibir una alerta crítica (p. ej., "Servicio de autenticación no responde"), siga el protocolo establecido por su organización y contacte inmediatamente al soporte técnico de GAMILIT.

---

## **9. GLOSARIO**

-   **Bulk Operations:** Operaciones masivas, como la importación o desactivación de cientos de usuarios a la vez.
-   **CRUD:** Acrónimo de Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar), las operaciones básicas de gestión de datos.
-   **Feature Flag:** Un interruptor que permite activar o desactivar una funcionalidad del sistema de forma remota.
-   **Gamificación:** El uso de mecánicas de juego (puntos, rangos, logros) en un contexto no lúdico para aumentar la motivación y el engagement.
-   **KPI:** Key Performance Indicator (Indicador Clave de Rendimiento).
-   **ML Coins:** Marie's Legacy Coins, la moneda virtual de GAMILIT.
-   **Multi-Tenancy:** Arquitectura de software donde una única instancia de la aplicación sirve a múltiples organizaciones (tenants), manteniendo sus datos aislados.
-   **RBAC:** Role-Based Access Control (Control de Acceso Basado en Roles).
-   **Tenant:** Una organización o institución que utiliza la plataforma GAMILIT.
-   **XP:** Experience Points (Puntos de Experiencia).

---

## **10. APÉNDICES**

### **Apéndice A: Matriz de Permisos por Rol (Ejemplo)**

| Funcionalidad | Super Admin | Admin |
| :--- | :---: | :---: |
| Ver Dashboard Global | ✅ | ✅ |
| Gestión de Usuarios (Global) | ✅ | ❌ |
| Gestión de Usuarios (De su Institución) | ✅ | ✅ |
| Gestión de Instituciones | ✅ | ❌ |
| Gestión de Roles y Permisos | ✅ | ❌ |
| Gestión de Contenido Educativo | ✅ | ✅ |
| Configuración de Gamificación | ✅ | ⚠️ (Solo lectura) |
| Monitoreo del Sistema | ✅ | ⚠️ (Solo lectura) |
| Generar Reportes Globales | ✅ | ❌ |
| Generar Reportes (De su Institución) | ✅ | ✅ |
-   ✅: Acceso Completo | ⚠️: Acceso Limitado | ❌: Sin Acceso

### **Apéndice B: Configuración de Feature Flags**

Un feature flag se compone de:
-   **Clave:** Un identificador único (p. ej., `enable-new-dashboard`).
-   **Descripción:** Explicación de la funcionalidad que controla.
-   **Estado:** Activado / Desactivado.
-   **Estrategia de Lanzamiento:**
    -   **Global:** Se aplica a todos los usuarios.
    -   **Porcentaje:** Se activa para un X% aleatorio de usuarios.
    -   **Grupo de Usuarios:** Se activa solo para usuarios que cumplan ciertos criterios (p. ej., pertenecen a una institución específica).

### **Apéndice C: Tipos de Reportes Disponibles**

-   **Reporte de Actividad de Usuarios:** Inicios de sesión, tiempo en la plataforma, módulos iniciados.
-   **Reporte de Progreso Académico:** Tasas de completitud, puntajes promedio, tiempo por ejercicio.
-   **Reporte de Engagement de Gamificación:** XP ganados, ML Coins gastadas, logros desbloqueados.
-   **Reporte de Adopción de Instituciones:** Crecimiento de usuarios y aulas por institución.
-   **Reporte de Auditoría:** Exportación de los logs de auditoría para un período específico.

### **Apéndice D: Comandos de Mantenimiento Esenciales**

(Para ser ejecutados por personal técnico autorizado a través de la CLI del servidor)
-   `gamilit-cli cache:clear`: Limpia la caché de la aplicación.
-   `gamilit-cli db:backup`: Inicia un backup manual de la base de datos.
-   `gamilit-cli system:health-check`: Ejecuta una comprobación de salud de todos los servicios.

---

## **11. DATOS DE CONTACTO**

Para soporte técnico, preguntas sobre el uso del portal o para reportar un problema, por favor contacte a nuestro equipo de soporte:

-   **Portal de Soporte:** [https://support.gamilit.com](https://support.gamilit.com)
-   **Correo Electrónico:** support@gamilit.com
-   **Teléfono de Emergencia:** +1 (555) 123-4567 (Solo para Super Admins y problemas críticos)