# Referencias Cruzadas Maestro - GAMILIT

**Proyecto:** GAMILIT Platform
**Versión:** 1.0
**Fecha:** 2025-11-07
**Propósito:** Documento maestro de navegación entre todos los sistemas de referencia

---

## 📖 Guía de Uso de Este Documento

Este documento actúa como **hub central** para navegar entre todos los sistemas de mapeo y referencias del proyecto GAMILIT. Úsalo para encontrar rápidamente la relación entre cualquier componente del sistema.

---

## 🗺️ Sistemas de Referencia Disponibles

### 1. **Inventario Completo del Sistema**
📄 **Archivo:** [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md)

**Contenido:**
- ✅ Inventario de 17 módulos backend
- ✅ Inventario de 34 controladores
- ✅ Inventario de 48 servicios
- ✅ Inventario de 283 endpoints HTTP
- ✅ Inventario de 14 schemas de base de datos
- ✅ Inventario de 62 tablas, 69 funciones, 12 views, 10 enums
- ✅ Inventario de 33 mecánicas educativas frontend

**Usa este documento para:**
- Ver listado completo de módulos y componentes
- Identificar qué existe en el sistema
- Detectar componentes duplicados
- Planificar nuevos desarrollos

---

### 2. **Matriz de Mapeo de Referencias**
📄 **Archivo:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md)

**Contenido:**
- ✅ Mapeo completo: API → Controlador → Servicio → Tabla
- ✅ Mapeo de DTOs → Entidades → Tablas
- ✅ Mapeo de Enums (Backend → Database)
- ✅ Mapeo de Funciones de Base de Datos
- ✅ Diagramas de flujos críticos (3 flujos principales)
- ✅ Referencias cruzadas por dominio

**Usa este documento para:**
- Seguir el flujo de un endpoint desde API hasta base de datos
- Entender qué DTOs mapean a qué tablas
- Ver qué funciones de base de datos se usan desde qué servicios
- Comprender flujos end-to-end (ej: submit exercise)

---

### 3. **Trazabilidad End-to-End (Especificaciones Técnicas)**
📄 **Archivo:** [`../02-especificaciones-tecnicas/trazabilidad/`](../02-especificaciones-tecnicas/trazabilidad/)

**Archivos clave:**
- `01-foundation-authentication.md` - Flujo de autenticación completo
- `02-educational-mechanics.md` - Flujo de ejercicios educativos
- `03-economy-transactions.md` - Flujo de ML Coins
- `04-gamification-progression.md` - Flujo de rangos y achievements
- `05-realtime-notifications.md` - Flujo de notificaciones en tiempo real
- `06-teacher-classroom-portal.md` - Flujo de portal de profesor
- `07-type-mappings-reference.md` - Mapeo de tipos DB → Backend → Frontend
- `08-patterns-architecture.md` - Patrones arquitectónicos

**Usa estos documentos para:**
- Entender flujos completos de features
- Ver transformación de datos entre capas
- Comprender patrones arquitectónicos aplicados
- Documentación más detallada que el mapeo

---

### 4. **Documentación de Desarrollo**
📄 **Carpeta:** [`./`](./README.md)

**Subcarpetas clave:**
- `backend/` - Documentación de módulos backend
- `frontend/` - Documentación de features frontend
- `base-de-datos/` - Esquemas y objetos de base de datos
- `testing/` - Estrategias y guías de testing

**Usa esta carpeta para:**
- Leer documentación detallada de módulos específicos
- Entender cómo implementar features
- Ver ejemplos de código
- Guías paso a paso

---

## 🔍 Casos de Uso Comunes

### Caso 1: "Necesito entender cómo funciona el submit de ejercicios"

**Ruta de navegación:**
1. **Inicio:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 5.1 "Flujo: Resolver Ejercicio Completo"
2. **Detalles de API:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 1.4 "Módulo: Progress"
3. **Trazabilidad:** [`../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md`](../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md)
4. **Implementación:** [`backend/estructura/Modulos-Core.md`](./backend/estructura/Modulos-Core.md) → Progress Module

**Resultado:** Entiendes el flujo completo desde frontend hasta base de datos.

---

### Caso 2: "¿Qué tablas usa el módulo de gamificación?"

**Ruta de navegación:**
1. **Inicio:** [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) → Sección 2.2 "gamification_system"
2. **Mapeo:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 1.2 "Módulo: Gamification"
3. **Esquema DB:** [`base-de-datos/ESQUEMA-COMPLETO.md`](./base-de-datos/ESQUEMA-COMPLETO.md) → Schema gamification_system

**Resultado:** Lista de 13 tablas, 23 funciones, 4 views, 2 enums.

---

### Caso 3: "¿Cómo se calculan los ML Coins con multiplier de rango?"

**Ruta de navegación:**
1. **Inicio:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 5.1 "Paso 5: Otorgar ML Coins"
2. **Función DB:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 4.1 "award_ml_coins()"
3. **Algoritmo:** [`../02-especificaciones-tecnicas/trazabilidad/03-economy-transactions.md`](../02-especificaciones-tecnicas/trazabilidad/03-economy-transactions.md)
4. **Rangos:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 1.2 "5 Rangos Maya"

**Resultado:** Fórmula completa: `ML Coins = base_reward × rank_multiplier`

---

### Caso 4: "¿Qué endpoints existen para el módulo teacher?"

**Ruta de navegación:**
1. **Inicio:** [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) → Sección 1.1 "Módulo teacher"
2. **Endpoints:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 1.6 "Módulo: Teacher"
3. **Detalle API:** [`backend/api/API-Teacher.md`](./backend/api/API-Teacher.md) (si existe)

**Resultado:** Lista de ~30 endpoints estimados, 10 documentados.

---

### Caso 5: "¿Qué DTOs mapean a la tabla `exercise_submissions`?"

**Ruta de navegación:**
1. **Inicio:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 2.3 "Educational DTOs"
2. **DTO específico:** Buscar `SubmitExerciseDto` y `ExerciseAttemptDto`
3. **Tipos compartidos:** [`../02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL-PROGRESS.md`](../02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL-PROGRESS.md)

**Resultado:** `SubmitExerciseDto` → `progress_tracking.exercise_submissions`

---

### Caso 6: "¿Cuáles son los enums de base de datos y cómo se usan en backend?"

**Ruta de navegación:**
1. **Inicio:** [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) → Sección 2.1 "Schemas" → Columna "Enums"
2. **Mapeo:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 3.1 "Backend Enums → Database Enums"
3. **Detalle:** [`base-de-datos/TIPOS-Y-ENUMS.md`](./base-de-datos/TIPOS-Y-ENUMS.md)

**Resultado:** 10 enums mapeados entre backend y base de datos.

---

### Caso 7: "¿Qué funciones de base de datos llama el servicio de gamificación?"

**Ruta de navegación:**
1. **Inicio:** [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) → Sección 4.1 "Funciones por Módulo Backend"
2. **Filtrar por:** "gamification module"
3. **Detalle de funciones:** [`base-de-datos/TRIGGERS-Y-FUNCIONES.md`](./base-de-datos/TRIGGERS-Y-FUNCIONES.md)

**Resultado:** 8 funciones principales: `award_ml_coins()`, `deduct_ml_coins()`, `unlock_achievement()`, etc.

---

## 📊 Matriz de Navegación Rápida

### Por Tipo de Pregunta

| Pregunta | Documento Principal | Sección |
|----------|---------------------|---------|
| "¿Qué módulos existen?" | [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) | 1.1 |
| "¿Qué controladores tiene módulo X?" | [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) | 1.2 |
| "¿Qué endpoints existen?" | [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) | 1.2 + [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) 1.x |
| "¿Qué tablas usa módulo X?" | [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) | 4.1 |
| "¿Cómo fluye feature X?" | [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) | 5.x |
| "¿Qué DTOs mapean a tabla Y?" | [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) | 2.x |
| "¿Qué enums existen?" | [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) | 3.x |
| "¿Qué schemas de BD existen?" | [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) | 2.1 |
| "¿Cuántas funciones de BD hay?" | [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) | 2.2 |

### Por Dominio Funcional

| Dominio | Inventario | Mapeo | Trazabilidad | Documentación |
|---------|------------|-------|--------------|---------------|
| **Auth** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#auth) | [Map 1.1](./_MATRIZ-MAPEO-REFERENCIAS.md#11-módulo-auth-15-endpoints) | [Traz 01](../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md) | [Docs](./backend/estructura/Modulos-Core.md#1-auth-module) |
| **Gamification** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#gamification) | [Map 1.2](./_MATRIZ-MAPEO-REFERENCIAS.md#12-módulo-gamification-40-endpoints) | [Traz 04](../02-especificaciones-tecnicas/trazabilidad/04-gamification-progression.md) | [Docs](./backend/estructura/Modulos-Core.md#2-gamification-module) |
| **Educational** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#educational) | [Map 1.3](./_MATRIZ-MAPEO-REFERENCIAS.md#13-módulo-educational-45-endpoints) | [Traz 02](../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md) | [Docs](./backend/estructura/Modulos-Core.md#3-educational-module) |
| **Progress** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#progress) | [Map 1.4](./_MATRIZ-MAPEO-REFERENCIAS.md#14-módulo-progress-25-endpoints) | [Traz 02](../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md) | [Docs](./backend/estructura/Modulos-Core.md#8-progress-module) |
| **Social** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#social) | [Map 1.5](./_MATRIZ-MAPEO-REFERENCIAS.md#15-módulo-social-35-endpoints) | [Traz 06](../02-especificaciones-tecnicas/trazabilidad/06-teacher-classroom-portal.md) | [Docs](./backend/estructura/Modulos-Core.md#5-social-module) |
| **Teacher** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#teacher) | [Map 1.6](./_MATRIZ-MAPEO-REFERENCIAS.md#16-módulo-teacher-30-endpoints) | [Traz 06](../02-especificaciones-tecnicas/trazabilidad/06-teacher-classroom-portal.md) | [Docs](./backend/estructura/Modulos-Core.md#4-teacher-module) |
| **Admin** | [Inv 1.1](./_ INVENTARIO-COMPLETO-SISTEMA.md#admin) | [Map 1.7](./_MATRIZ-MAPEO-REFERENCIAS.md#17-módulo-admin-40-endpoints) | - | [Docs](./backend/estructura/Modulos-Core.md#7-admin-module) |

---

## 🔧 Herramientas de Navegación

### Scripts Útiles (Futuros)

```bash
# Buscar referencias de una tabla
./scripts/find-table-refs.sh gamification_system.user_stats

# Buscar referencias de un endpoint
./scripts/find-endpoint-refs.sh "/api/progress/submissions"

# Buscar referencias de un DTO
./scripts/find-dto-refs.sh SubmitExerciseDto

# Validar integridad de referencias
./scripts/validate-refs.sh
```

---

## 🚨 Gaps Conocidos

### Referencias Faltantes Identificadas

1. **Endpoints sin mapear:** ~119 endpoints (42%)
   - Ver: [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) Sección 7.1

2. **Funciones de BD sin documentar:** 34 funciones (49%)
   - Ver: [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md) Sección 2.2

3. **Schemas sin documentar completo:** 5 schemas
   - admin_dashboard, audit_logging, auth, gamilit, public

4. **Módulos sin documentar:** 4 módulos
   - assignments, audit, mail, tasks

5. **Posibles duplicaciones:**
   - Enums: `user_role` vs `gamilit_role`
   - Rangos Maya: 2 sets de nombres diferentes
   - Ver: [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md) Sección 3.2

---

## 📝 Cómo Contribuir

### Actualizar Referencias

1. **Modificar componente existente:**
   - Actualizar [`_INVENTARIO-COMPLETO-SISTEMA.md`](./_INVENTARIO-COMPLETO-SISTEMA.md)
   - Actualizar [`_MATRIZ-MAPEO-REFERENCIAS.md`](./_MATRIZ-MAPEO-REFERENCIAS.md)
   - Actualizar documentación específica

2. **Agregar nuevo componente:**
   - Agregar a inventario
   - Crear mapeo en matriz
   - Documentar en carpeta correspondiente
   - Actualizar este documento maestro

3. **Reportar gap:**
   - Abrir issue en GitHub con tag `documentation`
   - Especificar qué referencia falta
   - Asignar prioridad (P0/P1/P2)

---

## 📞 Soporte

**Mantenedores de referencias:**
- @tech-lead - Coordinación general
- @backend-team - Referencias de backend
- @database-team - Referencias de base de datos
- @frontend-team - Referencias de frontend

**Reporte de problemas:**
- GitHub Issues: Tag `documentation` + `references`
- Slack: #gamilit-docs

---

## 🎯 Roadmap de Mejoras

### Q4 2025
- [ ] Completar mapeo de endpoints faltantes (119)
- [ ] Documentar funciones de BD faltantes (34)
- [ ] Crear scripts de validación automática
- [ ] Implementar CI/CD check de referencias

### Q1 2026
- [ ] Generar diagramas visuales automáticos
- [ ] Crear herramienta web de navegación
- [ ] Integrar con IDE (VS Code extension)
- [ ] Sistema de alertas de referencias rotas

---

**Última actualización:** 2025-11-07
**Próxima revisión:** Semanal
**Versión:** 1.0
