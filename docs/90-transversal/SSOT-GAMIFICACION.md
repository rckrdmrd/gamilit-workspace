# SSOT: Sistema de Gamificación - GAMILIT

**Single Source of Truth (SSOT)** para toda la documentación relacionada con gamificación.

**Versión:** 1.0

---

## Propósito

Este documento centraliza las referencias a toda la documentación de gamificación, definiendo cuál es la **fuente de verdad** para cada aspecto del sistema.

---

## Fuentes de Verdad por Área

### 1. Arquitectura y Diseño (SSOT)
**Ubicación:** `/docs/sistema-recompensas/`

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| `01-ARQUITECTURA-SISTEMA.md` | Arquitectura v2.3.0 completa | ✅ Vigente |
| `02-FLUJO-END-TO-END.md` | Flujos de recompensas | ✅ Vigente |
| `03-API-ENDPOINTS.md` | Endpoints de gamificación | ✅ Vigente |
| `04-DATABASE-SCHEMA.md` | Schema de BD | ✅ Vigente |
| `README.md` | Índice general | ✅ Vigente |

### 2. Especificaciones Técnicas (SSOT)
**Ubicación:** `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/`

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| `ET-GAM-001-achievements.md` | Sistema de logros | ✅ Vigente |
| `ET-GAM-002-comodines.md` | Sistema de ayudas | ✅ Vigente |
| `ET-GAM-003-rangos-maya.md` | Rangos Maya v2.4.0 | ✅ Vigente |
| `ET-GAM-004-tipos-compartidos.md` | Tipos TypeScript | ✅ Vigente |
| `ET-GAM-005-hook-user-gamification.md` | Hook useUserGamification | ✅ Vigente |

### 3. Requisitos Funcionales
**Ubicación:** `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/`

| Documento | Contenido |
|-----------|-----------|
| `RF-GAM-001-achievements.md` | Requisitos de logros |
| `RF-GAM-002-comodines.md` | Requisitos de ayudas |
| `RF-GAM-003-rangos-maya.md` | Requisitos de rangos |
| `RF-GAM-004-economia-ml-coins.md` | Requisitos de economía |

### 4. Historias de Usuario
**Ubicación:** `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/historias-usuario/`

8 historias de usuario (US-GAM-001 a US-GAM-008)

### 5. Implementación y Pruebas (SSOT)
**Ubicación:** `/docs/sistema-recompensas/`

| Documento | Contenido |
|-----------|-----------|
| `05-TEST-RESULTS.md` | Resultados de pruebas |
| `06-SEEDS-Y-DATOS-INICIALES.md` | Datos de semilla |
| `07-CORRECCION-SISTEMA-MISIONES.md` | Correcciones misiones |
| `00-INVENTARIO-CAMBIOS.md` | Historial de cambios |

---

## Componentes del Sistema

### Rangos Maya
- **SSOT:** `sistema-recompensas/01-ARQUITECTURA-SISTEMA.md`
- **Especificación:** `EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
- **4 niveles:** Ajaw → Halach Uinik → Nacom → Ah K'in

### ML Coins (Monedas Lectoras)
- **SSOT:** `sistema-recompensas/01-ARQUITECTURA-SISTEMA.md`
- **Requisito:** `EAI-003-gamificacion/requerimientos/RF-GAM-004-economia-ml-coins.md`

### Achievements (Logros)
- **SSOT:** `sistema-recompensas/01-ARQUITECTURA-SISTEMA.md`
- **Especificación:** `EAI-003-gamificacion/especificaciones/ET-GAM-001-achievements.md`

### Comodines (Sistema de Ayudas)
- **SSOT:** `sistema-recompensas/01-ARQUITECTURA-SISTEMA.md`
- **Especificación:** `EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md`

### Sistema de Misiones
- **SSOT:** `sistema-recompensas/07-CORRECCION-SISTEMA-MISIONES.md`

---

## Referencias Cruzadas

```
EAI-003-gamificacion/          → Documentación de requisitos originales (Fase 1)
sistema-recompensas/           → Implementación actual v2.3.0 (SSOT técnica)
90-transversal/features/       → Estado global de features
```

---

## Reglas de Actualización

1. **Cambios en arquitectura:** Actualizar en `sistema-recompensas/`
2. **Cambios en especificaciones:** Actualizar en `EAI-003-gamificacion/especificaciones/`
3. **Nuevos features:** Documentar primero en `sistema-recompensas/`, luego actualizar este SSOT

---

## Código Fuente

| Capa | Ubicación |
|------|-----------|
| **Database** | `apps/database/ddl/schemas/gamification_system/` |
| **Backend** | `apps/backend/src/modules/gamification/` |
| **Frontend** | `apps/frontend/src/features/student/gamification/` |

