---
id: "RF-INIT-001"
title: "Inicializacion Automatica de Usuario"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Sistema / Inicializacion"
epic: "EAI-001"
version: "1.1"
labels: ["initialization", "user-setup", "gamification", "trigger", "onboarding"]
created_date: "2025-11-24"
updated_date: "2026-01-04"
---

# RF-INIT-001: Inicialización Automática de Usuario

**Proyecto:** GAMILIT
**Épica:** EAI-001 - Fundamentos
**Versión:** 1.1
**Fecha de creación:** 2025-11-24
**Última actualización:** 2025-11-24
**Estado:** ✅ Implementado
**Prioridad:** Crítica

---

## 📋 Información del Requerimiento

| Atributo | Valor |
|----------|-------|
| **ID** | RF-INIT-001 |
| **Tipo** | Requerimiento Funcional |
| **Categoría** | Sistema / Inicialización |
| **Epic** | EAI-001 - Fundamentos |
| **Relacionado con** | US-FUND-001 (Autenticación), US-FUND-002 (Perfiles) |
| **Prioridad** | Crítica (P0) |
| **Complejidad** | Media |
| **Documentado en** | ADR-012, ET-INIT-001 |

---

## 🎯 Descripción

El sistema GAMILIT **debe inicializar automáticamente** todos los componentes necesarios de gamificación, progreso y configuración cuando un nuevo usuario se registra en la plataforma. Esta inicialización debe ocurrir de forma transparente, inmediata y sin intervención manual.

**Contexto de Negocio:**

Cuando un estudiante o profesor se registra en GAMILIT, el sistema debe estar listo inmediatamente para su uso. Esto significa que el usuario debe tener:
- Estadísticas de gamificación inicializadas (puntos, monedas)
- Rango Maya inicial asignado
- Inventario de comodines creado
- Progreso de módulos educativos configurado para todos los módulos publicados

Sin esta inicialización automática, los usuarios verían errores o pantallas vacías al acceder por primera vez al sistema.

---

## 📐 Alcance

### Incluido en este requerimiento:

1. ✅ Inicialización automática de 4 componentes:
   - Estadísticas de usuario (user_stats)
   - Inventario de comodines (comodines_inventory)
   - Rango Maya (user_ranks)
   - Progreso de módulos (module_progress)

2. ✅ Trigger automático al momento del registro

3. ✅ Valores iniciales predeterminados:
   - 100 ML Coins (monedas de bienvenida)
   - Rango Maya: Ajaw (rango inicial)
   - Progreso de módulos: 0% en todos los módulos publicados
   - Inventario de comodines: vacío pero creado

4. ✅ Manejo de idempotencia (evitar duplicados)

5. ✅ Aplicable a roles: student, admin_teacher, super_admin

### Explícitamente excluido:

- ❌ Inicialización de misiones (BUG FIX #3: pendiente implementación)
- ❌ Asignación de logros iniciales
- ❌ Configuración personalizada de parámetros de gamificación
- ❌ Notificaciones de bienvenida
- ❌ Roles sin gamificación (ej: viewer, auditor)

---

## 🔍 Requerimientos Funcionales Detallados

### RF-INIT-001.1: Trigger Automático de Inicialización

**Descripción:** El sistema debe disparar automáticamente el proceso de inicialización cuando se crea un nuevo perfil de usuario.

**Reglas de Negocio:**
- La inicialización se dispara DESPUÉS de insertar el registro en `auth_management.profiles`
- La inicialización es asíncrona desde la perspectiva del registro
- Si el registro falla, la inicialización NO se ejecuta
- Si la inicialización falla, el registro NO se revierte (pero se debe logear el error)

**Criterios de Aceptación:**
- [ ] La inicialización se ejecuta automáticamente para cada nuevo usuario
- [ ] La inicialización ocurre en menos de 1 segundo
- [ ] No se requiere intervención manual
- [ ] Se logean errores si algo falla

---

### RF-INIT-001.2: Inicialización de Estadísticas de Usuario

**Descripción:** El sistema debe crear un registro de estadísticas de gamificación para cada nuevo usuario.

**Reglas de Negocio:**
- Tabla: `gamification_system.user_stats`
- FK Reference: `user_id` → `auth.users.id` (NO profiles.id)
- Valores iniciales:
  - `ml_coins = 100` (monedas de bienvenida)
  - `ml_coins_earned_total = 100`
  - `total_xp = 0`
  - `level = 1`
  - Tenant heredado del perfil
- Estrategia de idempotencia: `ON CONFLICT (user_id) DO NOTHING`

**Criterios de Aceptación:**
- [ ] Se crea exactamente 1 registro por usuario
- [ ] El registro se crea incluso si otros componentes fallan
- [ ] Los valores iniciales son correctos
- [ ] No se crean duplicados si el trigger se ejecuta múltiples veces

---

### RF-INIT-001.3: Inicialización de Inventario de Comodines

**Descripción:** El sistema debe crear un inventario vacío de comodines para cada nuevo usuario.

**Reglas de Negocio:**
- Tabla: `gamification_system.comodines_inventory`
- FK Reference: `user_id` → `profiles.id` (NO auth.users.id)
- Valores iniciales:
  - Inventario vacío (todas las cantidades en 0)
- Estrategia de idempotencia: `ON CONFLICT (user_id) DO NOTHING`

**Criterios de Aceptación:**
- [ ] Se crea exactamente 1 registro por usuario
- [ ] El usuario puede empezar a ganar comodines inmediatamente
- [ ] No se crean duplicados

---

### RF-INIT-001.4: Inicialización de Rango Maya

**Descripción:** El sistema debe asignar el rango Maya inicial a cada nuevo usuario.

**Reglas de Negocio:**
- Tabla: `gamification_system.user_ranks`
- FK Reference: `user_id` → `auth.users.id` (NO profiles.id)
- Rango inicial: `Ajaw` (rango más bajo en la jerarquía Maya)
- Estrategia de idempotencia: `WHERE NOT EXISTS` (tabla sin unique constraint en user_id)
- Tenant heredado del perfil

**Criterios de Aceptación:**
- [ ] Se crea exactamente 1 registro por usuario
- [ ] El rango inicial es siempre 'Ajaw'
- [ ] No se crean duplicados (validado con WHERE NOT EXISTS)
- [ ] El usuario puede progresar a rangos superiores

---

### RF-INIT-001.5: Inicialización de Progreso de Módulos

**Descripción:** El sistema debe crear registros de progreso para TODOS los módulos educativos publicados.

**Reglas de Negocio:**
- Tabla: `progress_tracking.module_progress`
- FK Reference: `user_id` → `profiles.id` (NO auth.users.id)
- FK Reference: `module_id` → `educational_content.modules.id`
- Se crean registros solo para módulos con:
  - `is_published = true`
  - `status = 'published'`
- Valores iniciales por módulo:
  - `status = 'not_started'`
  - `progress_percentage = 0`
  - `created_at = NOW()`
  - `updated_at = NOW()`
- Estrategia de idempotencia: `ON CONFLICT (user_id, module_id) DO NOTHING`

**Criterios de Aceptación:**
- [ ] Se crean N registros donde N = número de módulos publicados
- [ ] Si hay 5 módulos publicados, se crean 5 registros
- [ ] El usuario ve inmediatamente los módulos disponibles en su dashboard
- [ ] No se crean duplicados
- [ ] Si se publica un nuevo módulo después del registro, NO se crea automáticamente (requiere migración manual)

**Nota Importante (BUG FIX #1 - GAP-003):**
Esta funcionalidad fue el objetivo del fix GAP-003. Antes de 2025-11-24, los usuarios NO tenían `module_progress` inicializado, causando "No modules available" en el dashboard. Ver ADR-012 para detalles.

---

### RF-INIT-001.6: Restricción por Rol

**Descripción:** La inicialización solo aplica a roles que participan en gamificación.

**Reglas de Negocio:**
- Roles incluidos: `'student'`, `'admin_teacher'`, `'super_admin'`
- Roles excluidos: Cualquier otro rol futuro sin gamificación

**Criterios de Aceptación:**
- [ ] La inicialización se ejecuta solo para roles especificados
- [ ] Los roles excluidos NO tienen registros de gamificación
- [ ] La lógica de filtrado está en la función de inicialización, NO en el trigger

---

## 🔗 Dependencias

### Dependencias de Entrada (Pre-requisitos)

| Objeto | Tipo | Descripción |
|--------|------|-------------|
| `auth.users` | Tabla | Usuario debe existir en auth (sistema) |
| `auth_management.profiles` | Tabla | Perfil debe ser creado ANTES de inicialización |
| `auth_management.tenants` | Tabla | Tenant debe existir para multi-tenancy |
| `educational_content.modules` | Tabla | Módulos publicados deben existir |
| `gamification_system.maya_rank` | Enum | Enum de rangos Maya debe estar definido |
| `progress_tracking.progress_status` | Enum | Enum de estados de progreso debe estar definido |

### Dependencias de Salida (Objetos que dependen de este)

| Objeto | Tipo | Descripción |
|--------|------|-------------|
| `DashboardPage.tsx` | Componente | Dashboard requiere module_progress para mostrar módulos |
| `GET /api/modules/progress` | API | Endpoint requiere module_progress existente |
| `ProfileService.getProgress()` | Servicio | Backend requiere user_stats existente |
| `GamificationService.*` | Servicios | Múltiples servicios asumen user_stats existe |

---

## 🎨 Casos de Uso

### Caso de Uso 1: Registro Exitoso de Estudiante

**Actor:** Nuevo estudiante

**Flujo Principal:**
1. Estudiante completa formulario de registro
2. Backend valida datos y crea usuario en `auth.users`
3. Backend crea perfil en `auth_management.profiles` con rol='student'
4. ⚡ **Trigger se dispara automáticamente**
5. Función `gamilit.initialize_user_stats()` se ejecuta:
   - 5.1. Crea registro en `user_stats` (100 ML Coins)
   - 5.2. Crea registro en `comodines_inventory`
   - 5.3. Crea registro en `user_ranks` (Ajaw)
   - 5.4. Crea 5 registros en `module_progress` (uno por módulo)
6. Backend retorna token JWT al frontend
7. Estudiante es redirigido a dashboard
8. **Dashboard carga exitosamente mostrando 5 módulos disponibles**

**Resultado:** ✅ Usuario listo para usar la plataforma inmediatamente

---

### Caso de Uso 2: Registro con Fallo Parcial de Inicialización

**Actor:** Nuevo estudiante

**Flujo Alternativo:**
1. Pasos 1-4 iguales a Caso 1
2. Función de inicialización comienza:
   - 5.1. Crea `user_stats` ✅
   - 5.2. Crea `comodines_inventory` ✅
   - 5.3. Crea `user_ranks` ✅
   - 5.4. **FALLA** al crear `module_progress` (ej: módulos no publicados) ❌
3. Función completa pero logea error
4. Backend retorna token JWT (registro exitoso)
5. Usuario accede a dashboard
6. Dashboard muestra error "No modules available"

**Resultado:** ⚠️ Usuario registrado pero experiencia degradada

**Mitigación:**
- Error se logea para investigación
- Script de reparación puede ejecutarse: `SELECT gamilit.initialize_user_stats_for_user(user_id)`
- Monitoreo debe alertar sobre fallos de inicialización

---

### Caso de Uso 3: Intento de Re-inicialización (Idempotencia)

**Actor:** Script de migración / Administrador

**Flujo:**
1. Administrador ejecuta script de re-inicialización para usuario existente
2. Script llama a función `gamilit.initialize_user_stats()`
3. Función intenta crear registros:
   - 3.1. `user_stats`: Conflicto detectado → DO NOTHING ✅
   - 3.2. `comodines_inventory`: Conflicto detectado → DO NOTHING ✅
   - 3.3. `user_ranks`: WHERE NOT EXISTS = false → Skip ✅
   - 3.4. `module_progress`: Conflictos detectados → DO NOTHING ✅
4. Función completa sin errores
5. **NO se crean duplicados**

**Resultado:** ✅ Función es idempotente, puede ejecutarse múltiples veces de forma segura

---

## 🧪 Criterios de Validación

### Validación Funcional

**Query de Validación Post-Registro:**
```sql
-- Verificar que usuario tiene TODAS las inicializaciones
WITH user_initialization_check AS (
    SELECT
        p.id as profile_id,
        p.email,
        COUNT(DISTINCT us.user_id) as has_user_stats,
        COUNT(DISTINCT ci.user_id) as has_comodines,
        COUNT(DISTINCT ur.user_id) as has_ranks,
        COUNT(DISTINCT mp.user_id) as has_module_progress,
        COUNT(mp.id) as module_count
    FROM auth_management.profiles p
    LEFT JOIN gamification_system.user_stats us ON us.user_id = p.user_id
    LEFT JOIN gamification_system.comodines_inventory ci ON ci.user_id = p.id
    LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = p.user_id
    LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = p.id
    WHERE p.id = '<USER_ID>'
    GROUP BY p.id, p.email
)
SELECT * FROM user_initialization_check;

-- Resultado esperado:
-- has_user_stats = 1
-- has_comodines = 1
-- has_ranks = 1
-- has_module_progress = 1
-- module_count = N (número de módulos publicados)
```

**Criterios de Aceptación Global:**
- [ ] 100% de usuarios nuevos tienen `has_user_stats = 1`
- [ ] 100% de usuarios nuevos tienen `has_comodines = 1`
- [ ] 100% de usuarios nuevos tienen `has_ranks = 1`
- [ ] 100% de usuarios nuevos tienen `has_module_progress = 1`
- [ ] module_count debe ser igual al número de módulos publicados

---

## 📊 Métricas y Monitoreo

### KPIs de Inicialización

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Tasa de inicialización completa** | 100% | % usuarios con 4/4 componentes |
| **Tiempo de inicialización** | < 1 segundo | Tiempo promedio del trigger |
| **Tasa de error** | < 0.1% | % de inicializaciones con fallo |
| **Usuarios sin module_progress** | 0 usuarios | COUNT de usuarios sin progreso |

### Alertas Recomendadas

1. ⚠️ **Alerta Alta:** Más de 5 usuarios sin module_progress en última hora
2. ⚠️ **Alerta Media:** Tiempo de inicialización > 2 segundos
3. ⚠️ **Alerta Baja:** Tasa de error > 0.5% en último día

---

## 🔧 Consideraciones de Implementación

### Estrategia de Idempotencia

**Problema:** ¿Qué pasa si el trigger se ejecuta múltiples veces?

**Solución:**
1. `user_stats`, `comodines_inventory`, `module_progress`: Usan `ON CONFLICT (user_id) DO NOTHING`
2. `user_ranks`: Usa `WHERE NOT EXISTS` (tabla sin unique constraint en user_id)

**Beneficio:** La función puede ejecutarse N veces sin crear duplicados.

### FK References: ¿auth.users.id o profiles.id?

**Regla Mnemotécnica:**

| Schema | FK Reference | Razón |
|--------|--------------|-------|
| `gamification_system` | → `auth.users.id` | Gamificación es multi-tenant, necesita user_id de auth |
| Otros schemas | → `profiles.id` | Necesitan profile_id local con tenant_id |

**Excepción:** `comodines_inventory` y `module_progress` usan `profiles.id` porque necesitan el contexto de tenant local.

### Manejo de Errores

**Filosofía:** La inicialización NO debe bloquear el registro.

- Si `user_stats` falla → El registro continúa (pero se logea error)
- Si `module_progress` falla → El registro continúa (pero usuario tiene experiencia degradada)
- El sistema debe ser **resiliente** y permitir **recuperación manual**

---

## 🐛 Historial de Bugs

### BUG FIX #1 - GAP-003: Module Progress Missing

**Fecha:** 2025-11-24
**Severidad:** Crítica
**Problema:** Los usuarios registrados NO tenían `module_progress` inicializado, causando "No modules available" en dashboard.

**Causa Raíz:** La función `gamilit.initialize_user_stats()` solo creaba 3 de 4 componentes (faltaba module_progress).

**Solución:** Se agregó la inicialización de `module_progress` en la función (líneas 60-82 del DDL).

**Evidencia:** Ver `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-GAP-003-MODULE-PROGRESS.md`

**Métricas:**
- Antes del fix: 0% usuarios con module_progress (0/3 usuarios)
- Después del fix: 100% usuarios con module_progress (5/5 usuarios)

**Lecciones Aprendidas:**
1. ✅ Validación exhaustiva pre-corrección previene duplicados
2. ✅ Tests end-to-end deben validar inicialización completa
3. ✅ Monitoreo de inicialización debe ser proactivo

---

## 📚 Referencias

### Documentación Relacionada

- **ADR-012:** `docs/97-adr/ADR-012-automatic-user-initialization-trigger.md` - Decisión arquitectónica
- **ET-INIT-001:** `docs/01-fase-alcance-inicial/EAI-001-fundamentos/especificaciones/ET-INIT-001-trigger-inicializacion.md` - Especificación técnica
- **FLUJO-INICIALIZACION:** `docs/90-transversal/FLUJO-INICIALIZACION-USUARIO.md` - Flujo end-to-end
- **DIAGRAMA-DEPENDENCIAS:** `docs/90-transversal/DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md` - Mapa de dependencias
- **TRACEABILITY:** `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/TRACEABILITY.yml` - Trazabilidad completa

### Código Fuente

- **Función:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
- **Trigger:** `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`

### Reportes de Validación

- **VALIDACION-GAP-003:** `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-GAP-003-MODULE-PROGRESS.md`
- **VALIDACION-FINAL:** `orchestration/agentes/architecture-analyst/analisis-estado-proyecto-2025-11-24/VALIDACION-FINAL-EXHAUSTIVA.md`

---

**Fin del Requerimiento RF-INIT-001**

**Autor:** Architecture-Analyst
**Fecha de creación:** 2025-11-24
**Versión:** 1.1
**Estado:** ✅ Implementado y Validado
