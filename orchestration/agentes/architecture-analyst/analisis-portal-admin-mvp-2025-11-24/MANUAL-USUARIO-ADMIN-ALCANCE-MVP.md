# MANUAL DE USUARIO - PORTAL DE ADMINISTRADOR
## Alcance MVP - GAMILIT

**Versión:** 2.0 MVP
**Fecha:** Noviembre 2025
**Audiencia:** Administradores del Sistema GAMILIT
**Tipo:** Manual de Usuario - Alcance MVP

---

## TABLA DE CONTENIDO

1. [Introducción: MVP vs Producto Completo](#1-introducción-mvp-vs-producto-completo)
2. [Capítulo 1: Dashboard](#2-capítulo-1-dashboard)
3. [Capítulo 2: Instituciones/Organizaciones](#3-capítulo-2-institucionesorganizaciones)
4. [Capítulo 3: Gamificación Config](#4-capítulo-3-gamificación-config)
5. [Capítulo 4: Classroom-Teacher Assignments](#5-capítulo-4-classroom-teacher-assignments)
6. [Capítulo 5: Funcionalidades "En Construcción"](#6-capítulo-5-funcionalidades-en-construcción)
7. [Apéndice: Tabla Comparativa](#7-apéndice-tabla-comparativa)

---

## 1. INTRODUCCIÓN: MVP vs PRODUCTO COMPLETO

### ¿Qué es el MVP?

El **MVP (Minimum Viable Product)** es la versión inicial del Portal de Administrador GAMILIT que incluye las funcionalidades **esenciales** para operar la plataforma educativa.

**MVP incluye:**
- ✅ Dashboard con métricas en tiempo real
- ✅ Visualización de instituciones
- ✅ Consulta de configuración de gamificación
- ✅ Gestión completa de asignaciones Classroom-Teacher

**Producto Completo incluirá (Fase 2 y 3):**
- ⏳ Gestión completa de usuarios (CRUD)
- ⏳ Gestión de contenido educativo
- ⏳ Sistema de aprobaciones
- ⏳ Reportes avanzados
- ⏳ Monitoreo del sistema
- ⏳ Configuración global
- ⏳ Roles y permisos dinámicos
- ⏳ Herramientas avanzadas

---

### Filosofía del MVP

**¿Por qué un MVP?**

En lugar de esperar 12 meses para tener todas las funcionalidades, decidimos lanzar el MVP en 3 meses con las **4 funcionalidades más críticas** para:

1. Obtener feedback temprano de administradores reales
2. Validar arquitectura y diseño de UI
3. Iterar rápidamente basado en uso real
4. Entregar valor de negocio inmediato

**¿Qué significa "En Construcción"?**

Verá páginas marcadas como "En Construcción" con estimaciones de disponibilidad. Esto NO significa que el sistema esté incompleto, sino que hemos priorizado las funcionalidades core del MVP.

---

### Ciclo de Desarrollo

```
┌─────────────────────────────────────────────────────────┐
│ TIMELINE DE DESARROLLO                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Noviembre 2025: MVP (Fase 1)                           │
│ ✅ Dashboard                                            │
│ ✅ Instituciones (vista)                                │
│ ✅ Gamificación (vista)                                 │
│ ✅ Classroom-Teacher (completo)                         │
│                                                         │
│ Q1 2026: Fase 2A (CRUD Básico)                         │
│ ⏳ Gestión de usuarios                                  │
│ ⏳ Gestión de instituciones (edición)                   │
│ ⏳ Configuración global                                 │
│                                                         │
│ Q2 2026: Fase 2B (Analytics)                           │
│ ⏳ Reportes ejecutivos                                  │
│ ⏳ Monitoreo del sistema                                │
│                                                         │
│ Q3-Q4 2026: Fase 2C-3 (Avanzado)                       │
│ ⏳ Gestión de contenido                                 │
│ ⏳ Sistema de aprobaciones                              │
│ ⏳ RBAC dinámico                                        │
│ ⏳ Herramientas avanzadas                               │
└─────────────────────────────────────────────────────────┘
```

---

### Cómo Usar Este Manual

**Estructura:**
- ✅ **Capítulos 1-4:** Funcionalidades MVP DISPONIBLES ahora
- 🚧 **Capítulo 5:** Funcionalidades "En Construcción" (Fase 2-3)
- 📊 **Apéndice:** Tabla comparativa completa

**Iconos utilizados:**
- ✅ Funcionalidad completa y disponible
- ⏳ Funcionalidad en desarrollo (estimación visible)
- ⚠️ Funcionalidad parcial (solo lectura)
- 🚧 Página "En Construcción"
- 💡 Tip o recomendación
- ⚙️ Workaround temporal

---

## 2. CAPÍTULO 1: DASHBOARD

### 2.1 Acceso al Portal

**URL:** `https://admin.gamilit.com`

**Credenciales de Prueba:**
- Email: `admin@gamilit.com`
- Contraseña: (solicitar a soporte técnico)

**Roles que pueden acceder:**
- `ADMIN`
- `SUPER_ADMIN`

**Inicio de sesión:**

1. Abrir el navegador (Chrome, Firefox, Edge recomendados)
2. Ir a `https://admin.gamilit.com`
3. Ingresar email y contraseña
4. Clic en "Iniciar Sesión"
5. Será redirigido al Dashboard automáticamente

💡 **Tip:** Puede marcar la página como favorita para acceso rápido.

---

### 2.2 Navegación Principal

El Portal Admin utiliza un **sidebar lateral** con los siguientes elementos:

**Menú Principal:**
```
┌─────────────────────────┐
│ GAMILIT Admin           │
├─────────────────────────┤
│ 📊 Dashboard            │  ✅ Disponible
│ 🏢 Instituciones        │  ⚠️ Solo lectura
│ 👥 Usuarios             │  🚧 En construcción
│ 🔐 Roles y Permisos     │  🚧 En construcción
│ 📚 Contenido            │  🚧 En construcción
│ ✅ Aprobaciones         │  🚧 En construcción
│ 🎮 Gamificación         │  ⚠️ Solo lectura
│ 🔗 Classroom-Teacher    │  ✅ Disponible
│ 📈 Monitoreo            │  🚧 En construcción
│ 🛠️ Herramientas         │  🚧 En construcción
│ 📊 Reportes             │  🚧 En construcción
│ ⚙️ Configuración        │  🚧 En construcción
└─────────────────────────┘
```

**Header (Parte Superior):**
- Nombre del administrador
- **Datos de gamificación en tiempo real:**
  - Nivel actual
  - XP acumulados
  - ML Coins disponibles
  - Rango Maya actual
- Botón de "Cerrar Sesión"

💡 **Importante:** Los datos de gamificación en el header son REALES y específicos de su usuario. Ya no son datos de prueba hardcoded.

---

### 2.3 Vista del Dashboard

El Dashboard es la **página principal** del Portal Admin con métricas en tiempo real.

**Secciones del Dashboard:**

#### A. Métricas Generales (Tarjetas Superiores)

**Usuarios:**
- Total de usuarios registrados
- Usuarios activos (últimos 30 días)
- Porcentaje de crecimiento mensual

**Instituciones:**
- Total de organizaciones educativas
- Instituciones activas
- Distribución por plan (Free, Pro, Enterprise)

**Almacenamiento:**
- Espacio utilizado (GB)
- Espacio disponible (GB)
- Porcentaje de uso

**Ejercicios:**
- Total de ejercicios completados (todos los usuarios)
- Promedio de completitud
- Ejercicios más populares

#### B. Estado de Salud del Sistema

**Health Checks:**
- 🟢 **API Backend:** Responde correctamente
- 🟢 **Base de Datos:** Conectada y operativa
- 🟢 **CPU:** Uso normal (<70%)
- 🟢 **Memoria:** Uso normal (<80%)

**Estados posibles:**
- 🟢 Verde: Todo operativo
- 🟡 Amarillo: Advertencia (uso alto de recursos)
- 🔴 Rojo: Error crítico (servicio caído)

⚠️ **Nota:** Si ve indicadores rojos o amarillos, contactar a soporte técnico inmediatamente.

#### C. Alertas y Notificaciones

Lista de alertas recientes del sistema:
- Usuarios nuevos registrados
- Instituciones que necesitan atención
- Errores críticos del sistema
- Respaldos completados

#### D. Acciones Rápidas

Botones de acceso directo a funcionalidades comunes:
- "Gestionar Instituciones"
- "Ver Configuración de Gamificación"
- "Asignar Classroom-Teacher"
- "Ver Reportes" (próximamente)

---

### 2.4 Datos de Gamificación del Administrador

**Ubicación:** Header superior derecho

**Datos mostrados:**
- **Nivel:** Su nivel actual como administrador (ej: Nivel 5)
- **XP:** Puntos de experiencia acumulados (ej: 1,250 XP)
- **ML Coins:** Monedas Marie Curie's Legacy disponibles (ej: 500 ML Coins)
- **Rango Maya:** Su rango jerárquico actual (ej: "Nacom")

**¿Cómo gano XP como administrador?**
- Realizar acciones administrativas (crear usuarios, editar configuración)
- Completar tareas del sistema
- Aprobar contenido educativo
- Gestionar instituciones

💡 **Dato curioso:** Los administradores también juegan con el sistema de gamificación. Esto demuestra el compromiso y uso de la plataforma.

---

### 2.5 Casos de Uso Comunes

**Caso 1: Verificar salud del sistema al inicio del día**

1. Hacer login en el Portal Admin
2. Revisar Dashboard
3. Verificar que todos los health checks estén en verde 🟢
4. Revisar alertas recientes
5. Si todo está bien, continuar con tareas diarias

**Caso 2: Ver estadísticas de crecimiento de usuarios**

1. Ir al Dashboard
2. Revisar tarjeta de "Usuarios"
3. Ver total de usuarios registrados
4. Ver usuarios activos últimos 30 días
5. Calcular % de usuarios activos vs total

**Caso 3: Verificar cuánto almacenamiento queda**

1. Ir al Dashboard
2. Revisar tarjeta de "Almacenamiento"
3. Ver espacio utilizado vs disponible
4. Si uso es >80%, considerar plan de expansión

---

## 3. CAPÍTULO 2: INSTITUCIONES/ORGANIZACIONES

### 3.1 Vista General de Instituciones

**Ubicación:** Menú lateral → "Instituciones"

**Funcionalidad Actual:** ⚠️ **Solo lectura** (MVP)

**¿Qué puedo hacer?**
- ✅ Ver lista completa de instituciones
- ✅ Ver información básica de cada institución
- ✅ Buscar instituciones por nombre
- ❌ Crear nuevas instituciones (Fase 2A - Q1 2026)
- ❌ Editar instituciones existentes (Fase 2A - Q1 2026)
- ❌ Eliminar instituciones (Fase 2A - Q1 2026)

---

### 3.2 Lista de Instituciones

**Vista de lista:**

La página muestra una tabla con todas las instituciones:

| Logo | Nombre | Código | Estado | Fecha Creación | Plan | Acciones |
|------|--------|--------|--------|----------------|------|----------|
| 🏫 | Colegio San José | CSJ-001 | Activa | 15/01/2025 | Pro | Ver detalle |
| 🏫 | Instituto Maya | IM-002 | Activa | 20/02/2025 | Enterprise | Ver detalle |
| 🏫 | Escuela Primaria Central | EPC-003 | Inactiva | 10/03/2025 | Free | Ver detalle |

**Columnas mostradas:**
- **Logo:** Imagen de la institución
- **Nombre:** Nombre completo de la organización educativa
- **Código:** ID único alfanumérico
- **Estado:** Activa o Inactiva
- **Fecha de Creación:** Cuándo fue registrada
- **Plan:** Free, Pro o Enterprise
- **Acciones:** Botón "Ver detalle"

---

### 3.3 Búsqueda de Instituciones

**Funcionalidad de búsqueda:**

1. En la parte superior de la lista, hay un campo de búsqueda
2. Escribir nombre de la institución (ej: "San José")
3. La lista se filtra automáticamente en tiempo real
4. Mostrar solo instituciones que coincidan

💡 **Tip:** La búsqueda es sensible a acentos. "San Jose" (sin acento) NO encontrará "San José" (con acento).

---

### 3.4 Detalle de Institución

**¿Cómo ver el detalle?**

1. En la lista de instituciones, clic en "Ver detalle"
2. Se abre la página de detalle con información completa

**Información mostrada (solo lectura):**

**Información General:**
- Nombre completo de la institución
- Código/ID único
- Logo (si tiene)
- Estado (Activa/Inactiva)
- Fecha de creación
- Plan actual (Free, Pro, Enterprise)

**Estadísticas:**
- Total de usuarios por rol:
  - Estudiantes
  - Maestros
  - Administradores
- Total de aulas
- Promedio de progreso de estudiantes
- Engagement metrics (DAU, MAU)

**Datos de Contacto:**
- Nombre del administrador principal
- Email de contacto
- Teléfono
- Dirección

**Datos de Facturación:**
- Plan contratado
- Fecha de inicio del plan
- Fecha de renovación
- Estado de pago

⚠️ **Limitación MVP:** Solo puede VER esta información. No puede editar.

---

### 3.5 Workarounds Temporales (hasta Fase 2A)

**¿Cómo crear una nueva institución?**

⚙️ **Método 1: SQL Directo**
```sql
INSERT INTO organizations.organizations (name, code, is_active, plan)
VALUES ('Nueva Institución', 'NI-001', true, 'pro');
```

⚙️ **Método 2: Contactar Soporte**
- Enviar email a: soporte@gamilit.com
- Incluir:
  - Nombre de la institución
  - Código deseado
  - Plan (Free, Pro, Enterprise)
  - Datos de contacto
- Tiempo de respuesta: 24-48 horas hábiles

**¿Cómo editar una institución existente?**

⚙️ **Método 1: SQL Directo**
```sql
UPDATE organizations.organizations
SET name = 'Nuevo Nombre', plan = 'enterprise'
WHERE code = 'CSJ-001';
```

⚙️ **Método 2: Contactar Soporte**
- Enviar email con detalles del cambio

**¿Cómo desactivar una institución?**

⚙️ **Método 1: SQL Directo**
```sql
UPDATE organizations.organizations
SET is_active = false
WHERE code = 'CSJ-001';
```

💡 **Importante:** Desactivar una institución NO elimina sus datos. Solo oculta la institución y bloquea el acceso de sus usuarios.

---

### 3.6 Roadmap de Funcionalidades Futuras

**Q1 2026 (Fase 2A):**
- ✅ Crear nuevas instituciones desde UI
- ✅ Editar información de instituciones
- ✅ Cambiar logo de institución
- ✅ Asignar administrador principal
- ✅ Cambiar plan (Free ↔ Pro ↔ Enterprise)
- ✅ Desactivar/activar instituciones
- ✅ Configurar feature flags por institución

**Q2 2026 (Fase 2B):**
- ✅ Dashboard de estadísticas por institución
- ✅ Reportes comparativos entre instituciones
- ✅ Exportar lista de instituciones a Excel

**Q3 2026 (Fase 2C):**
- ✅ Configuración personalizada por institución
- ✅ Multi-tenant completo (aislamiento de datos)

---

## 4. CAPÍTULO 3: GAMIFICACIÓN CONFIG

### 4.1 Vista General de Gamificación

**Ubicación:** Menú lateral → "Gamificación"

**Funcionalidad Actual:** ⚠️ **Solo lectura** (MVP)

**¿Qué puedo hacer?**
- ✅ Ver todos los parámetros de gamificación
- ✅ Ver configuración de Rangos Maya
- ✅ Ver estadísticas del sistema
- ✅ Ver parámetros de economía ML Coins
- ❌ Editar parámetros (Fase 2 - Q2 2026)
- ❌ Editar rangos Maya (Fase 2 - Q2 2026)
- ❌ Actualizar insignias (Fase 2 - Q2 2026)

---

### 4.2 Tabs de Gamificación

La página tiene **4 tabs**:

1. **Rangos Maya:** Configuración de los 5 rangos jerárquicos
2. **Logros:** Sistema de insignias (en desarrollo)
3. **Economía ML Coins:** Parámetros de monedas
4. **Estadísticas:** Métricas generales del sistema

---

### 4.3 Tab "Rangos Maya"

**¿Qué son los Rangos Maya?**

Los Rangos Maya son niveles jerárquicos que los usuarios alcanzan según su XP acumulado. Están basados en la mitología maya auténtica:

| Rango | XP Mínimo | XP Máximo | Color | Multiplicador XP | Multiplicador Coins |
|-------|-----------|-----------|-------|------------------|---------------------|
| Ajaw | 0 | 999 | Gris | 1.0x | 1.0x |
| Nacom | 1,000 | 2,999 | Azul | 1.1x | 1.05x |
| Ah K'in | 3,000 | 5,999 | Púrpura | 1.2x | 1.1x |
| Halach Uinic | 6,000 | 9,999 | Dorado | 1.3x | 1.15x |
| K'uk'ulkan | 10,000+ | ∞ | Verde | 1.5x | 1.25x |

**Vista de Rangos (solo lectura):**

Para cada rango se muestra:
- ⭐ Nombre del rango (español + maya)
- 🎨 Color representativo
- 📊 Rango de XP (mínimo - máximo)
- 📈 Nivel jerárquico
- ✖️ Multiplicador de XP (ej: 1.1x = +10% de XP)
- 💰 Multiplicador de ML Coins (ej: 1.05x = +5% de coins)
- ✅ Estado (activo/inactivo)

**¿Qué significa el multiplicador?**

Si un estudiante completa un ejercicio que otorga 100 XP:
- **Rango Ajaw (1.0x):** Recibe 100 XP
- **Rango Nacom (1.1x):** Recibe 110 XP (+10%)
- **Rango K'uk'ulkan (1.5x):** Recibe 150 XP (+50%)

💡 **Filosofía:** Los rangos superiores recompensan la experiencia y fomentan la persistencia.

---

### 4.4 Tab "Economía ML Coins"

**¿Qué son los ML Coins?**

ML Coins (Marie Curie's Legacy Coins) son la moneda virtual del sistema GAMILIT. Los estudiantes las ganan y las gastan en la tienda virtual.

**Sección: Estadísticas Generales**

Tres tarjetas con métricas:

1. **Parámetros Totales:** Cantidad total de parámetros configurables (ej: 28)
2. **Parámetros Activos:** Cantidad de parámetros que están activos (ej: 25)
3. **Categoría Coins:** Cantidad de parámetros relacionados con monedas (ej: 8)

**Sección: Parámetros de Economía**

Lista de parámetros relacionados con ML Coins:

| Parámetro | Valor Actual | Descripción |
|-----------|--------------|-------------|
| coins.welcome_bonus | 500 | ML Coins otorgados al registrarse |
| coins.daily_login | 10 | ML Coins por login diario |
| coins.exercise_completion | 20 | ML Coins por completar ejercicio |
| coins.perfect_score | 50 | ML Coins por puntaje perfecto |
| coins.streak_bonus | 5 | ML Coins por racha de días |
| coins.module_completion | 100 | ML Coins por completar módulo |
| coins.level_up | 50 | ML Coins por subir de nivel |
| coins.achievement_unlock | 30 | ML Coins por desbloquear logro |

**Para cada parámetro se muestra:**
- 🔑 Key del parámetro (identificador único)
- 💰 Valor actual configurado
- 📝 Descripción (qué hace el parámetro)
- 🔄 Valor por defecto
- 📊 Tipo de dato (number, percentage, etc.)

⚠️ **Limitación MVP:** Solo puede VER estos valores. No puede editarlos desde la UI.

**Botón "Configurar Parámetros":**
- Estado: Deshabilitado
- Muestra alert: "Edición de parámetros - Funcionalidad próximamente"

---

### 4.5 Tab "Estadísticas"

Dashboard con métricas del sistema de gamificación:

**Tarjetas Principales:**

1. **Total Parámetros:** Cantidad total de parámetros configurables (ej: 28)
2. **Parámetros Activos:** Cantidad de parámetros que están activos (ej: 25)
3. **Total Rangos Maya:** Cantidad total de rangos (siempre 5)
4. **Rangos Activos:** Cantidad de rangos activos (ej: 5)

**Desglose por Categorías:**

Grid con 6 categorías de parámetros:

| Categoría | Cantidad |
|-----------|----------|
| Points (XP) | 8 |
| Coins | 7 |
| Levels | 3 |
| Ranks | 5 |
| Penalties | 3 |
| Bonuses | 2 |

**¿Qué significa cada categoría?**
- **Points (XP):** Parámetros relacionados con experiencia
- **Coins:** Parámetros relacionados con ML Coins
- **Levels:** Parámetros de niveles de usuario
- **Ranks:** Configuración de Rangos Maya
- **Penalties:** Penalizaciones por acciones negativas
- **Bonuses:** Bonificaciones especiales

---

### 4.6 Tab "Logros"

**Estado:** 🚧 En desarrollo

Muestra un mensaje:

```
┌────────────────────────────────────────┐
│ 🏆 Achievements en desarrollo           │
├────────────────────────────────────────┤
│                                        │
│ La gestión de logros estará           │
│ disponible en una próxima versión.    │
│                                        │
│ Total de logros configurados: 28      │
└────────────────────────────────────────┘
```

**Botón "Nuevo Logro":**
- Estado: Deshabilitado
- Muestra alert: "Funcionalidad en desarrollo"

**Roadmap:** Sistema de insignias completo en Q2 2026 (Fase 2B)

---

### 4.7 Workarounds Temporales (hasta Fase 2)

**¿Cómo editar un parámetro de gamificación?**

⚙️ **Método 1: SQL Directo**
```sql
UPDATE gamification_system.gamification_parameters
SET value = '150'
WHERE key = 'xp.base_per_exercise';
```

⚙️ **Método 2: Contactar Desarrollo**
- Enviar email a: dev@gamilit.com
- Incluir:
  - Key del parámetro a modificar
  - Nuevo valor deseado
  - Justificación del cambio
- Tiempo de respuesta: 2-3 días hábiles

**¿Cómo editar un Rango Maya?**

⚙️ **Método 1: SQL Directo**
```sql
UPDATE gamification_system.maya_ranks
SET min_xp = 1000, max_xp = 2500
WHERE name = 'Nacom';
```

⚠️ **ADVERTENCIA:** Al editar umbrales de rangos, asegúrese de que NO se solapen:
- `min_xp` del rango actual >= `max_xp` del rango anterior
- `max_xp` del rango actual <= `min_xp` del rango siguiente

**¿Cómo desactivar una insignia temporalmente?**

⚙️ **Método 1: SQL Directo**
```sql
UPDATE gamification_system.achievements
SET is_active = false
WHERE name = 'Primera Victoria';
```

💡 **Consejo:** Los usuarios que ya obtuvieron la insignia NO la perderán. Solo NO se otorgará a nuevos usuarios.

---

### 4.8 Casos de Uso Comunes

**Caso 1: Verificar XP otorgado por completar ejercicios**

1. Ir a "Gamificación" → Tab "Economía ML Coins"
2. Buscar parámetro `xp.base_per_exercise`
3. Ver valor actual (ej: 10 XP)
4. Anotar valor para cálculos

**Caso 2: Ver qué rango tiene un usuario con 5,000 XP**

1. Ir a "Gamificación" → Tab "Rangos Maya"
2. Revisar tabla de rangos
3. Buscar rango donde: 5,000 >= min_xp AND 5,000 <= max_xp
4. Resultado: "Ah K'in" (3,000 - 5,999 XP)

**Caso 3: Verificar multiplicadores de cada rango**

1. Ir a "Gamificación" → Tab "Rangos Maya"
2. Ver columna "Multiplicador XP"
3. Ver columna "Multiplicador ML Coins"
4. Anotar valores para documentación

**Caso 4: Consultar cuántos parámetros están activos**

1. Ir a "Gamificación" → Tab "Estadísticas"
2. Ver tarjeta "Parámetros Activos"
3. Comparar con "Total Parámetros"
4. Calcular % activo = (Activos / Total) * 100

---

### 4.9 Roadmap de Funcionalidades Futuras

**Q2 2026 (Fase 2B - US-AE-005):**
- ✅ Editar parámetros desde UI (con modal)
- ✅ Editar umbrales de Rangos Maya
- ✅ Activar/desactivar parámetros
- ✅ Restaurar valores por defecto
- ✅ Actualización masiva de parámetros (bulk update)
- ✅ Preview de impacto antes de aplicar cambios

**Q3 2026 (Fase 2C):**
- ✅ Sistema de insignias completo
- ✅ Crear logros personalizados
- ✅ Configurar criterios de obtención
- ✅ Gestionar rareza de insignias

**Q4 2026 (Fase 3):**
- ✅ Historial de cambios de configuración
- ✅ A/B testing de parámetros
- ✅ Configuración por institución (multi-tenant)

---

## 5. CAPÍTULO 4: CLASSROOM-TEACHER ASSIGNMENTS

### 5.1 Vista General

**Ubicación:** Menú lateral → "Classroom-Teacher"

**Funcionalidad Actual:** ✅ **100% completa** (MVP)

**¿Qué puedo hacer?**
- ✅ Ver todas las aulas de un maestro específico
- ✅ Ver todos los maestros asignados a un aula
- ✅ Asignar un maestro a una o varias aulas
- ✅ Actualizar asignaciones existentes (cambiar rol, permisos)
- ✅ Desasignar maestros de aulas
- ✅ Buscar maestros y aulas con filtros

💡 **Esta es la funcionalidad MÁS COMPLETA del Portal Admin MVP.**

---

### 5.2 Estructura de la Página

La página tiene **2 tabs principales**:

1. **Por Classroom (Aula):** Ver maestros asignados a cada aula
2. **Por Teacher (Maestro):** Ver aulas asignadas a cada maestro

Ambos tabs proporcionan la misma funcionalidad pero desde perspectivas diferentes.

---

### 5.3 Tab "Por Classroom" - Maestros por Aula

**Vista de selector de aula:**

1. En la parte superior, hay un selector de aula (dropdown)
2. Seleccionar el aula deseada (ej: "3° A")
3. Se carga la lista de maestros asignados a esa aula

**Tabla de maestros asignados:**

| Foto | Nombre del Maestro | Email | Rol | Fecha Asignación | Permisos | Acciones |
|------|-------------------|-------|-----|------------------|----------|----------|
| 👨‍🏫 | Juan Pérez | juan@escuela.com | Titular | 01/09/2025 | Completos | Editar / Desasignar |
| 👩‍🏫 | María González | maria@escuela.com | Suplente | 15/09/2025 | Limitados | Editar / Desasignar |

**Columnas mostradas:**
- **Foto:** Avatar del maestro
- **Nombre del Maestro:** Nombre completo
- **Email:** Email de contacto
- **Rol:** Titular, Suplente o Asistente
- **Fecha de Asignación:** Cuándo fue asignado
- **Permisos:** Completos, Limitados o Personalizados
- **Acciones:** Botones de Editar y Desasignar

**Botón "Agregar Maestro":**
- Ubicación: Parte superior derecha
- Abre modal para asignar un nuevo maestro al aula seleccionada

---

### 5.4 Tab "Por Teacher" - Aulas por Maestro

**Vista de selector de maestro:**

1. En la parte superior, hay un selector de maestro (dropdown)
2. Seleccionar el maestro deseado (ej: "Juan Pérez")
3. Se carga la lista de aulas asignadas a ese maestro

**Tabla de aulas asignadas:**

| Nombre Aula | Grado | Grupo | Estudiantes | Rol del Maestro | Fecha Asignación | Acciones |
|-------------|-------|-------|-------------|-----------------|------------------|----------|
| 3° A | 3 | A | 25 | Titular | 01/09/2025 | Editar / Desasignar |
| 3° B | 3 | B | 28 | Suplente | 15/09/2025 | Editar / Desasignar |
| 4° A | 4 | A | 22 | Titular | 01/09/2025 | Editar / Desasignar |

**Columnas mostradas:**
- **Nombre Aula:** Identificador del aula (ej: "3° A")
- **Grado:** Nivel educativo (1-6)
- **Grupo:** Sección (A, B, C)
- **Estudiantes:** Cantidad de estudiantes en el aula
- **Rol del Maestro:** Titular, Suplente o Asistente
- **Fecha de Asignación:** Cuándo fue asignado
- **Acciones:** Botones de Editar y Desasignar

**Estadísticas del maestro:**
- Total de aulas asignadas
- Total de estudiantes bajo su cargo
- Distribución por grado

---

### 5.5 Asignar Maestro a Aula

**¿Cómo asignar un maestro?**

**Desde Tab "Por Classroom":**

1. Seleccionar el aula deseada (ej: "3° A")
2. Clic en botón "Agregar Maestro"
3. Se abre modal "Asignar Maestro a Aula"

**Desde Tab "Por Teacher":**

1. Seleccionar el maestro deseado
2. Clic en botón "Asignar a Nueva Aula"
3. Se abre modal "Asignar Maestro a Aula"

**Formulario del modal:**

```
┌────────────────────────────────────────┐
│ Asignar Maestro a Aula          [X]    │
├────────────────────────────────────────┤
│                                        │
│ Maestro:                               │
│ ┌──────────────────────────────┐      │
│ │ Juan Pérez               ▼   │      │
│ └──────────────────────────────┘      │
│                                        │
│ Aula:                                  │
│ ┌──────────────────────────────┐      │
│ │ 3° A                     ▼   │      │
│ └──────────────────────────────┘      │
│                                        │
│ Rol del Maestro:                       │
│ ● Titular                              │
│ ○ Suplente                             │
│ ○ Asistente                            │
│                                        │
│ Fecha de Inicio (opcional):            │
│ ┌──────────────────────────────┐      │
│ │ 01/09/2025               📅  │      │
│ └──────────────────────────────┘      │
│                                        │
│ Permisos:                              │
│ ☑ Editar calificaciones                │
│ ☑ Gestionar estudiantes                │
│ ☑ Crear asignaciones                   │
│ ☐ Eliminar estudiantes                 │
│                                        │
│         [Cancelar]  [Asignar Maestro]  │
└────────────────────────────────────────┘
```

**Campos del formulario:**

1. **Maestro:** Selector de maestro (buscar por nombre)
2. **Aula:** Selector de aula (buscar por nombre)
3. **Rol del Maestro:**
   - **Titular:** Maestro principal del aula (full permissions)
   - **Suplente:** Maestro temporal o de apoyo (limited permissions)
   - **Asistente:** Ayudante del titular (read-only)
4. **Fecha de Inicio:** Cuándo comienza la asignación (opcional, default: hoy)
5. **Permisos:** Checkboxes de permisos específicos

**Validaciones:**
- No se puede asignar el mismo maestro dos veces al mismo aula con el mismo rol
- Aula debe tener al menos 1 titular
- Un aula puede tener máximo 2 titulares

**Al hacer clic en "Asignar Maestro":**
1. Se validan los datos
2. Se crea la asignación en la base de datos
3. Aparece toast de éxito: "Maestro asignado correctamente"
4. El modal se cierra
5. La lista se actualiza automáticamente

---

### 5.6 Editar Asignación Existente

**¿Cómo editar una asignación?**

1. En la tabla de maestros/aulas, clic en botón "Editar"
2. Se abre modal "Editar Asignación"

**Formulario del modal (pre-llenado):**

```
┌────────────────────────────────────────┐
│ Editar Asignación de Maestro    [X]    │
├────────────────────────────────────────┤
│                                        │
│ Maestro: Juan Pérez                    │
│ Aula: 3° A                             │
│ Fecha Asignación: 01/09/2025           │
│                                        │
│ Cambiar Rol:                           │
│ ○ Titular                              │
│ ● Suplente  ⬅️ Actual                  │
│ ○ Asistente                            │
│                                        │
│ Actualizar Permisos:                   │
│ ☑ Editar calificaciones                │
│ ☑ Gestionar estudiantes                │
│ ☐ Crear asignaciones                   │
│ ☐ Eliminar estudiantes                 │
│                                        │
│ Fecha de Fin (opcional):               │
│ ┌──────────────────────────────┐      │
│ │ 30/12/2025               📅  │      │
│ └──────────────────────────────┘      │
│                                        │
│ [Cancelar]  [Guardar Cambios]          │
└────────────────────────────────────────┘
```

**Cambios permitidos:**
- ✅ Cambiar rol (Titular ↔ Suplente ↔ Asistente)
- ✅ Actualizar permisos (activar/desactivar checkboxes)
- ✅ Establecer fecha de fin (para asignaciones temporales)
- ❌ NO se puede cambiar el maestro o aula (crear nueva asignación)

**Al hacer clic en "Guardar Cambios":**
1. Se validan los datos
2. Se actualiza la asignación en la base de datos
3. Aparece toast de éxito: "Asignación actualizada correctamente"
4. El modal se cierra
5. La lista se actualiza

---

### 5.7 Desasignar Maestro de Aula

**¿Cómo desasignar un maestro?**

1. En la tabla de maestros/aulas, clic en botón "Desasignar"
2. Se abre modal de confirmación

**Modal de confirmación:**

```
┌────────────────────────────────────────┐
│ ⚠️ Confirmar Desasignación      [X]     │
├────────────────────────────────────────┤
│                                        │
│ ¿Está seguro de que desea desasignar   │
│ a este maestro del aula?               │
│                                        │
│ Maestro: Juan Pérez                    │
│ Aula: 3° A                             │
│ Rol: Suplente                          │
│                                        │
│ Estudiantes afectados: 25              │
│                                        │
│ ⚠️ Esta acción NO se puede deshacer.   │
│                                        │
│ El maestro perderá acceso al aula      │
│ y a los estudiantes.                   │
│                                        │
│ [Cancelar]  [Desasignar]               │
└────────────────────────────────────────┘
```

**Información mostrada:**
- Nombre del maestro
- Nombre del aula
- Rol actual
- Cantidad de estudiantes afectados
- Advertencia de acción irreversible

**Al hacer clic en "Desasignar":**
1. Se elimina la asignación de la base de datos
2. Aparece toast de éxito: "Maestro desasignado correctamente"
3. El modal se cierra
4. La lista se actualiza (el maestro ya no aparece)

⚠️ **IMPORTANTE:** Desasignar NO elimina al maestro del sistema. Solo elimina la relación con el aula específica.

---

### 5.8 Búsqueda y Filtros

**Búsqueda de Maestros:**

En el selector de maestro, se puede:
- Buscar por nombre (ej: "Juan")
- Buscar por email (ej: "juan@")
- Filtrar por institución
- Filtrar por número de aulas asignadas
- Filtrar por estado (activo/inactivo)

**Búsqueda de Aulas:**

En el selector de aula, se puede:
- Buscar por nombre (ej: "3° A")
- Filtrar por grado (1-6)
- Filtrar por número de maestros asignados
- Filtrar por número de estudiantes
- Filtrar por institución

---

### 5.9 Casos de Uso Comunes

**Caso 1: Asignar un nuevo maestro a un aula**

**Contexto:** La escuela contrató a María González como maestra titular de 4° B.

1. Ir a "Classroom-Teacher"
2. Tab "Por Classroom"
3. Seleccionar aula "4° B"
4. Clic en "Agregar Maestro"
5. Seleccionar "María González"
6. Rol: "Titular"
7. Permisos: Marcar todos
8. Clic en "Asignar Maestro"
9. ✅ María ahora tiene acceso a 4° B

**Caso 2: Ver todas las aulas de un maestro**

**Contexto:** Necesito saber cuántas aulas tiene Juan Pérez.

1. Ir a "Classroom-Teacher"
2. Tab "Por Teacher"
3. Seleccionar "Juan Pérez"
4. Ver lista de aulas asignadas
5. Ver estadísticas: "Total aulas: 3, Total estudiantes: 75"

**Caso 3: Cambiar un maestro de titular a suplente**

**Contexto:** Juan Pérez solicitó reducción de carga. Ahora será suplente de 3° B en lugar de titular.

1. Ir a "Classroom-Teacher"
2. Tab "Por Classroom"
3. Seleccionar aula "3° B"
4. En la fila de Juan Pérez, clic en "Editar"
5. Cambiar rol: Seleccionar "Suplente"
6. Actualizar permisos (desmarcar "Eliminar estudiantes")
7. Clic en "Guardar Cambios"
8. ✅ Juan ahora es suplente con permisos limitados

**Caso 4: Reasignar un aula cuando un maestro se va**

**Contexto:** La maestra Laura Ramírez renunció. Su aula 5° A debe ser asignada a Pedro Sánchez.

1. **Desasignar a Laura:**
   - Ir a "Classroom-Teacher" → Tab "Por Classroom"
   - Seleccionar "5° A"
   - En la fila de Laura, clic en "Desasignar"
   - Confirmar desasignación
   - ✅ Laura ya no tiene acceso

2. **Asignar a Pedro:**
   - Clic en "Agregar Maestro"
   - Seleccionar "Pedro Sánchez"
   - Rol: "Titular"
   - Permisos: Marcar todos
   - Clic en "Asignar Maestro"
   - ✅ Pedro ahora es titular de 5° A

**Caso 5: Asignar un maestro a múltiples aulas**

**Contexto:** El maestro Carlos Díaz enseña matemáticas en 3 aulas: 6° A, 6° B y 6° C.

1. Ir a "Classroom-Teacher" → Tab "Por Teacher"
2. Seleccionar "Carlos Díaz"
3. Clic en "Asignar a Nueva Aula"
4. Seleccionar "6° A", Rol: "Titular"
5. Clic en "Asignar"
6. Repetir para "6° B"
7. Repetir para "6° C"
8. ✅ Carlos ahora tiene 3 aulas asignadas

**Vista final:**
```
Maestro: Carlos Díaz
Total aulas: 3
Total estudiantes: 72

Aulas:
- 6° A (24 estudiantes) - Titular
- 6° B (25 estudiantes) - Titular
- 6° C (23 estudiantes) - Titular
```

---

### 5.10 Roles y Permisos

**Roles disponibles:**

1. **Titular:**
   - Maestro principal del aula
   - Acceso completo a todas las funcionalidades
   - Puede:
     - ✅ Ver y editar calificaciones
     - ✅ Gestionar estudiantes (agregar, editar, eliminar)
     - ✅ Crear y gestionar asignaciones
     - ✅ Ver progreso detallado
     - ✅ Generar reportes

2. **Suplente:**
   - Maestro temporal o de apoyo
   - Acceso limitado
   - Puede:
     - ✅ Ver y editar calificaciones
     - ✅ Ver estudiantes (pero no editar)
     - ✅ Crear asignaciones
     - ❌ NO puede eliminar estudiantes
     - ❌ NO puede cambiar configuración del aula

3. **Asistente:**
   - Ayudante del titular
   - Solo lectura
   - Puede:
     - ✅ Ver estudiantes
     - ✅ Ver calificaciones
     - ✅ Ver progreso
     - ❌ NO puede editar nada
     - ❌ NO puede crear asignaciones

**Permisos personalizables:**

Además del rol, se pueden configurar permisos específicos:

| Permiso | Titular | Suplente | Asistente |
|---------|---------|----------|-----------|
| Ver estudiantes | ✅ | ✅ | ✅ |
| Editar estudiantes | ✅ | ❌ | ❌ |
| Eliminar estudiantes | ✅ | ❌ | ❌ |
| Ver calificaciones | ✅ | ✅ | ✅ |
| Editar calificaciones | ✅ | ✅ | ❌ |
| Crear asignaciones | ✅ | ✅ | ❌ |
| Editar asignaciones | ✅ | ❌ | ❌ |
| Generar reportes | ✅ | ✅ | ✅ |
| Configurar aula | ✅ | ❌ | ❌ |

💡 **Tip:** Los permisos se pueden personalizar al asignar o editar un maestro.

---

### 5.11 Preguntas Frecuentes

**P: ¿Puedo asignar el mismo maestro a varias aulas?**
R: ✅ Sí, un maestro puede estar asignado a múltiples aulas con diferentes roles en cada una.

**P: ¿Cuántos maestros puede tener un aula?**
R: No hay límite técnico. Usualmente: 1-2 titulares, 0-2 suplentes, 0-3 asistentes.

**P: ¿Qué pasa si desasigno el único titular de un aula?**
R: ⚠️ El aula quedará sin titular. Se recomienda asignar un nuevo titular antes de desasignar al actual.

**P: ¿Puedo cambiar el aula de una asignación existente?**
R: ❌ No. Debe desasignar al maestro del aula actual y luego asignarlo a la nueva aula.

**P: ¿Se notifica al maestro cuando es asignado a un aula?**
R: ⏳ Actualmente NO se envían notificaciones automáticas. Esta funcionalidad llegará en Q2 2026.

**P: ¿Puedo ver el historial de asignaciones de un maestro?**
R: ⏳ Actualmente NO. El historial de asignaciones estará disponible en Q3 2026.

---

## 6. CAPÍTULO 5: FUNCIONALIDADES "EN CONSTRUCCIÓN"

### 6.1 Páginas Fuera del Alcance MVP

De las 13 páginas del Portal Admin, **9 están fuera del alcance MVP** y muestran un badge "En Construcción":

**Lista de páginas "En Construcción":**

1. 👥 **Usuarios** - Gestión completa de usuarios (CRUD)
2. 🔐 **Roles y Permisos** - RBAC dinámico
3. 📚 **Contenido** - Editor de módulos y ejercicios
4. ✅ **Aprobaciones** - Sistema de aprobación de contenido
5. 📈 **Monitoreo** - Monitoreo del sistema en tiempo real
6. 🛠️ **Herramientas** - Multi-tenant, Feature Flags, A/B Testing
7. 📊 **Reportes** - Reportes ejecutivos y dashboards
8. ⚙️ **Configuración** - Configuración global del sistema
9. 🏫 **Detalle de Institución** - Vista completa de institución (parcial)

---

### 6.2 Usuarios - Gestión de Usuarios

**Ruta:** `/admin/users`
**Estado:** 🚧 En Construcción (15% completo)
**Estimación:** Q1 2026 (Fase 2A)

**Funcionalidades Planificadas:**

**CRUD Completo:**
- ✅ Ver lista de usuarios (disponible parcialmente)
- ⏳ Crear nuevos usuarios desde UI
- ⏳ Editar usuarios existentes
- ⏳ Eliminar usuarios (soft delete)
- ⏳ Suspender/reactivar usuarios

**Gestión Avanzada:**
- ⏳ Importación masiva desde CSV
- ⏳ Exportación a Excel
- ⏳ Resetear contraseña de usuario
- ⏳ Enviar email de bienvenida
- ⏳ Ver historial de actividad del usuario

**Workaround Actual:**
- Crear usuarios: SQL directo o contactar soporte
- Editar usuarios: SQL directo o contactar soporte

---

### 6.3 Roles y Permisos - RBAC Dinámico

**Ruta:** `/admin/roles`
**Estado:** 🚧 En Construcción (0% completo)
**Estimación:** Q3 2026 (Fase 2C)

**Funcionalidades Planificadas:**

**RBAC Dinámico:**
- ⏳ Crear roles personalizados
- ⏳ Definir permisos granulares por rol
- ⏳ Matriz de permisos interactiva
- ⏳ Asignar roles a usuarios
- ⏳ Herencia de permisos
- ⏳ Roles por institución (multi-tenant)

**Estado Actual:**
Sistema de roles fijos:
- STUDENT
- TEACHER
- ADMIN
- SUPER_ADMIN

**Workaround Actual:**
- Roles se asignan al crear usuarios (campo `role`)
- Modificación de roles: SQL directo

---

### 6.4 Contenido - Editor de Módulos y Ejercicios

**Ruta:** `/admin/content`
**Estado:** 🚧 En Construcción (25% completo)
**Estimación:** Q3-Q4 2026 (Fase 2C-3)

**Funcionalidades Planificadas:**

**Gestión de Módulos:**
- ⏳ Lista de módulos educativos
- ⏳ Crear nuevos módulos
- ⏳ Editar módulos existentes
- ⏳ Reordenar módulos (drag & drop)
- ⏳ Activar/desactivar módulos

**Gestión de Ejercicios:**
- ⏳ Lista de ejercicios por módulo
- ⏳ Crear nuevos ejercicios
- ⏳ Editor visual de configuración JSONB
- ⏳ Vista previa del ejercicio
- ⏳ Editar ejercicios existentes
- ⏳ Duplicar ejercicios

**Biblioteca Multimedia:**
- ⏳ Upload de imágenes, videos, audios
- ⏳ Organización por categorías/tags
- ⏳ Búsqueda de recursos
- ⏳ Gestión de almacenamiento

**Estado Actual:**
Contenido se gestiona vía seeds SQL:
- `apps/database/seeds/prod/educational_content/`

**Workaround Actual:**
- Crear/editar contenido: Modificar archivos SQL
- Recrear base de datos: `./drop-and-recreate-database.sh`

---

### 6.5 Aprobaciones - Sistema de Aprobaciones

**Ruta:** `/admin/approvals`
**Estado:** 🚧 En Construcción (50% completo)
**Estimación:** Q4 2026 (Fase 3)

**Funcionalidades Planificadas:**

**Flujo de Aprobación:**
- ⏳ Estados completos (draft → pending → approved/rejected)
- ⏳ Interfaz de revisión completa
- ⏳ Checklist de verificación
- ⏳ Modo de prueba interactivo
- ⏳ Panel de comentarios
- ⏳ Historial de aprobaciones

**Estado Actual:**
Sistema básico de aprobaciones:
- ✅ Lista de contenido pendiente
- ✅ Botones de Aprobar/Rechazar
- ⏳ Flujo de estados incompleto

**Workaround Actual:**
- Aprobación manual fuera del sistema (email, reuniones)
- Admin activa/desactiva contenido con flag `is_active`

---

### 6.6 Monitoreo - Monitoreo del Sistema

**Ruta:** `/admin/monitoring`
**Estado:** 🚧 En Construcción (5% completo)
**Estimación:** Q2 2026 (Fase 2B)

**Funcionalidades Planificadas:**

**Estado del Sistema:**
- ⏳ Health check de servicios
- ⏳ Uso de recursos (CPU, memoria, disco)
- ⏳ Latencia de APIs
- ⏳ Tasa de errores

**Alertas del Sistema:**
- ⏳ Configurar alertas personalizadas
- ⏳ Notificaciones por email/Slack
- ⏳ Alertas de caída de servicios

**Logs:**
- ⏳ Visualizador de logs
- ⏳ Filtrar por nivel (info, warn, error)
- ⏳ Búsqueda en logs
- ⏳ Streaming en tiempo real

**Workaround Actual:**
- Health checks: Endpoint `/health` básico
- Logs: Acceso directo al servidor (SSH)
- Monitoreo: Herramientas externas (Grafana, Prometheus)

---

### 6.7 Herramientas - Herramientas Avanzadas

**Ruta:** `/admin/advanced`
**Estado:** 🚧 En Construcción (10% completo)
**Estimación:** Q4 2026+ (Fase 3)

**Funcionalidades Planificadas:**

**Multi-Tenant:**
- ⏳ Gestión de tenants (organizaciones)
- ⏳ Aislamiento de datos por tenant
- ⏳ Configuración por tenant

**Feature Flags:**
- ⏳ Sistema de feature flags
- ⏳ Activar/desactivar features por organización
- ⏳ Gradual rollout (% de usuarios)
- ⏳ Rollback instantáneo

**A/B Testing:**
- ⏳ Configurador de experimentos
- ⏳ Segmentación de usuarios
- ⏳ Métricas de conversión
- ⏳ Análisis estadístico

**Data Migration:**
- ⏳ Herramientas de migración de datos
- ⏳ Importación masiva
- ⏳ Backup/restore por tenant

**Workaround Actual:**
- Feature flags: Hardcoded en código
- Multi-tenant: Tabla `organizations` existe
- A/B testing: No disponible

---

### 6.8 Reportes - Reportes Ejecutivos

**Ruta:** `/admin/reports`
**Estado:** 🚧 En Construcción (0% completo)
**Estimación:** Q2 2026 (Fase 2B)

**Funcionalidades Planificadas:**

**Reportes Globales:**
- ⏳ Reporte de adopción (usuarios activos)
- ⏳ Reporte de progreso global
- ⏳ Reporte de gamificación (distribución de rangos)
- ⏳ Reporte de instituciones (comparativa)
- ⏳ Reporte de contenido (ejercicios populares)

**Generación de Reportes:**
- ⏳ Configurador de reporte
- ⏳ Rango de fechas personalizado
- ⏳ Exportar a PDF, Excel, CSV
- ⏳ Programar envío automático por email

**Dashboards:**
- ⏳ Dashboard ejecutivo
- ⏳ Dashboard de engagement
- ⏳ Dashboards personalizables

**Workaround Actual:**
- Reportes: Consultas SQL manuales
- Exportación: pgAdmin o scripts personalizados
- Dashboards: Grafana externo (si está configurado)

---

### 6.9 Configuración - Configuración Global

**Ruta:** `/admin/settings`
**Estado:** 🚧 En Construcción (0% completo)
**Estimación:** Q1 2026 (Fase 2A)

**Funcionalidades Planificadas:**

**Parámetros del Sistema:**
- ⏳ Nombre de la plataforma
- ⏳ Logo personalizado (upload)
- ⏳ Colores del tema
- ⏳ Idioma por defecto
- ⏳ Zona horaria

**Email y Notificaciones:**
- ⏳ Configuración SMTP
- ⏳ Templates de emails
- ⏳ Notificaciones push

**Seguridad:**
- ⏳ Duración de sesiones
- ⏳ Máximo de intentos de login
- ⏳ Requerir 2FA para admins
- ⏳ Política de contraseñas

**Mantenimiento:**
- ⏳ Modo mantenimiento
- ⏳ Programar respaldos automáticos
- ⏳ Limpieza de caché

**Workaround Actual:**
- Configuración: Variables de entorno (.env)
- Logo: Archivo estático en código
- SMTP: Configurado en backend directamente

---

### 6.10 ¿Cómo Solicitar Priorización de Funcionalidades?

Si necesita una funcionalidad "En Construcción" con urgencia:

**Proceso de Solicitud:**

1. **Enviar email a:** product@gamilit.com
2. **Incluir:**
   - Nombre de la funcionalidad
   - Justificación de negocio (¿por qué es urgente?)
   - Impacto si no está disponible
   - Fecha límite deseada
   - Usuarios afectados
3. **Esperar respuesta:** 5-7 días hábiles
4. **Evaluación:** Product Manager evaluará viabilidad
5. **Decisión:** Se comunicará si se prioriza o no

**Criterios de Priorización:**
- Impacto en usuarios finales (estudiantes, maestros)
- Bloqueador crítico de operación
- Cantidad de usuarios afectados
- Esfuerzo de implementación (Story Points)
- Dependencias técnicas

💡 **Tip:** Funcionalidades con ALTO impacto y BAJA complejidad son priorizadas más rápido.

---

## 7. APÉNDICE: TABLA COMPARATIVA

### 7.1 MVP vs Producto Completo

**Matriz de Funcionalidades:**

| Funcionalidad | MVP (Nov 2025) | Fase 2A (Q1 2026) | Fase 2B (Q2 2026) | Fase 2C-3 (Q3-Q4 2026) |
|---------------|----------------|-------------------|-------------------|------------------------|
| **Dashboard** | ✅ Completo | - | - | - |
| **Instituciones (Vista)** | ✅ Completo | - | - | - |
| **Instituciones (CRUD)** | ❌ | ✅ Completo | - | - |
| **Gamificación (Vista)** | ✅ Completo | - | - | - |
| **Gamificación (Edición)** | ❌ | - | ✅ Completo | - |
| **Classroom-Teacher** | ✅ Completo | - | - | - |
| **Usuarios (Vista)** | ⚠️ Parcial | ✅ Completo | - | - |
| **Usuarios (CRUD)** | ❌ | ✅ Completo | - | - |
| **Roles y Permisos** | ❌ | - | - | ✅ Completo |
| **Contenido (Vista)** | ❌ | - | - | ⚠️ Parcial |
| **Contenido (Editor)** | ❌ | - | - | ✅ Completo |
| **Aprobaciones** | ❌ | - | - | ✅ Completo |
| **Monitoreo** | ❌ | - | ✅ Completo | - |
| **Reportes** | ❌ | - | ✅ Completo | - |
| **Configuración** | ❌ | ✅ Completo | - | - |
| **Herramientas Avanzadas** | ❌ | - | - | ⚠️ Parcial |

---

### 7.2 Funcionalidades por Fase

**FASE 1: MVP (Noviembre 2025) - ENTREGADO ✅**

Funcionalidades Core:
- ✅ Dashboard con métricas en tiempo real
- ✅ Visualización de instituciones
- ✅ Consulta de configuración de gamificación (rangos, parámetros, economía)
- ✅ Gestión completa de Classroom-Teacher (asignar, editar, desasignar)

Total: 4 funcionalidades principales

---

**FASE 2A: CRUD Básico (Q1 2026) - PLANIFICADO**

Objetivo: Autonomía del administrador para operaciones básicas

Funcionalidades:
- ⏳ Gestión completa de usuarios (CRUD)
- ⏳ Gestión completa de instituciones (CRUD)
- ⏳ Configuración global del sistema
- ⏳ Vista detallada de institución

Estimación: 34-40 Story Points (4 semanas con 2 devs)

---

**FASE 2B: Analytics & Monitoring (Q2 2026) - PLANIFICADO**

Objetivo: Visibilidad y monitoreo del sistema

Funcionalidades:
- ⏳ Sistema de reportes ejecutivos
- ⏳ Dashboards personalizables
- ⏳ Monitoreo del sistema en tiempo real
- ⏳ Edición de gamificación desde UI

Estimación: 42-48 Story Points (6 semanas con 2 devs)

---

**FASE 2C-3: Avanzado (Q3-Q4 2026) - PLANIFICADO**

Objetivo: Funcionalidades avanzadas de gestión

Funcionalidades:
- ⏳ RBAC dinámico (roles y permisos personalizados)
- ⏳ Editor de contenido educativo (módulos y ejercicios)
- ⏳ Biblioteca multimedia
- ⏳ Sistema de aprobaciones completo
- ⏳ Herramientas avanzadas (feature flags, A/B testing)

Estimación: 103-114 Story Points (20+ semanas con 2 devs)

---

### 7.3 Comparación de Alcance

**Resumen Ejecutivo:**

| Métrica | MVP | Producto Completo | % Completitud MVP |
|---------|-----|-------------------|-------------------|
| Páginas Implementadas | 4 / 13 | 13 / 13 | 31% |
| Funcionalidades Completas | 4 | 16 | 25% |
| Story Points | ~50 SP | ~230 SP | 22% |
| Tiempo de Desarrollo | 3 meses | 12 meses | 25% |

**Interpretación:**
- El MVP representa ~25% del producto completo
- Incluye las 4 funcionalidades MÁS CRÍTICAS para operación básica
- Permite validar arquitectura y diseño de UI antes de invertir más tiempo
- ROI inmediato: Administradores pueden operar sin SQL directo

---

### 7.4 Roadmap Visual

```
2025-2026 ROADMAP
════════════════════════════════════════════════════════

Nov 2025: ✅ MVP LANZADO
├─ Dashboard
├─ Instituciones (vista)
├─ Gamificación (vista)
└─ Classroom-Teacher (completo)

Q1 2026: Fase 2A (CRUD Básico)
├─ Usuarios (CRUD)
├─ Instituciones (CRUD)
├─ Detalle de Institución
└─ Configuración Global

Q2 2026: Fase 2B (Analytics)
├─ Reportes Ejecutivos
├─ Monitoreo del Sistema
└─ Edición de Gamificación

Q3 2026: Fase 2C (Avanzado)
├─ RBAC Dinámico
└─ Editor de Contenido (Parte 1)

Q4 2026: Fase 3 (Enterprise)
├─ Editor de Contenido (Parte 2)
├─ Sistema de Aprobaciones
└─ Herramientas Avanzadas

2027+: Mejoras Continuas
└─ Basadas en feedback de usuarios
```

---

## GLOSARIO DE TÉRMINOS

**MVP (Minimum Viable Product):** Versión inicial con funcionalidades esenciales.

**SP (Story Points):** Unidad de medida de complejidad de desarrollo.

**CRUD:** Create, Read, Update, Delete (operaciones básicas).

**RBAC:** Role-Based Access Control (control de acceso basado en roles).

**Classroom-Teacher:** Asignación de maestros a aulas.

**ML Coins:** Marie Curie's Legacy Coins (moneda virtual del sistema).

**Rangos Maya:** Niveles jerárquicos de gamificación (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan).

**XP:** Experience Points (puntos de experiencia).

**Feature Flags:** Interruptores para activar/desactivar funcionalidades.

**Multi-Tenant:** Arquitectura que permite múltiples organizaciones con datos aislados.

**Soft Delete:** Eliminación lógica (marcar como inactivo sin borrar físicamente).

---

## SOPORTE Y AYUDA

### Contactos de Soporte:

**Soporte Técnico:**
- Email: soporte@gamilit.com
- Horario: Lunes a Viernes, 9:00 - 18:00 hrs
- Tiempo de respuesta: 24-48 horas hábiles

**Soporte de Emergencia:**
- Email: urgente@gamilit.com
- Criterios: Caída del sistema, pérdida de datos, errores críticos
- Tiempo de respuesta: 4 horas

**Product Manager (Funcionalidades):**
- Email: product@gamilit.com
- Para: Solicitar priorización de funcionalidades, feedback sobre roadmap

**Development Team (Técnico):**
- Email: dev@gamilit.com
- Para: Workarounds temporales, consultas SQL, cambios en configuración

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 2.0 MVP
**Total páginas:** 35
**Audiencia:** Administradores del Sistema GAMILIT
