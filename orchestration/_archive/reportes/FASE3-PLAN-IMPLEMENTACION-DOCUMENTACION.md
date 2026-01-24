# FASE 3: PLAN DE IMPLEMENTACIÓN DE DOCUMENTACIÓN

**Fecha:** 2025-12-18
**Analista:** Requirements-Analyst (SIMCO)
**Tipo:** Plan de Implementación

---

## RESUMEN DEL PLAN

| Prioridad | Documentos | Estimado |
|-----------|------------|----------|
| ALTA | 4 documentos | Batch 1 |
| MEDIA | 8 documentos | Batch 2 |
| BAJA | 6 documentos | Batch 3 |
| **TOTAL** | **18 documentos** | 3 batches |

---

## BATCH 1: ALTA PRIORIDAD

### D1. GUIA-SSL-CERTBOT-DEPLOYMENT.md
**Ubicación:** `/docs/95-guias-desarrollo/GUIA-SSL-CERTBOT-DEPLOYMENT.md`
**Tipo:** Nueva guía
**Dependencias:** Ninguna
**Contenido:**
- Introducción y propósito
- Requisitos previos
- Instalación con Let's Encrypt
- Instalación con certificado auto-firmado
- Variables de entorno actualizadas
- Validación post-instalación
- Troubleshooting
- Renovación y mantenimiento

**Referencias cruzadas:**
- Agregar link desde GUIA-DEPLOYMENT-RAPIDO.md
- Agregar link desde DEPLOYMENT-GUIDE.md
- Referenciar GUIA-SSL-NGINX-PRODUCCION.md

---

### D2. MIGRACION-MAYA-RANKS-COINS-MULTIPLIER.md
**Ubicación:** `/docs/90-transversal/migraciones/MIGRACION-MAYA-RANKS-v2.1.md`
**Tipo:** Documento de migración
**Dependencias:** Ninguna
**Contenido:**
- Resumen ejecutivo de la migración
- Cambios de umbrales XP (tabla comparativa v2.0 vs v2.1)
- Funciones modificadas con código
- Seeds actualizados
- Impacto en el sistema
- Cálculo de progresión
- XP Multipliers y ML Coins bonus
- Perks desbloqueables

**Referencias cruzadas:**
- Actualizar ET-GAM-003-rangos-maya.md
- Referenciar desde inventario de funciones

---

### D3. Actualizar ET-GAM-003-rangos-maya.md
**Ubicación:** `/docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
**Tipo:** Actualización
**Dependencias:** D2
**Cambios:**
- Actualizar versión a v2.1.0
- Modificar tabla de umbrales
- Actualizar sección "Implementación en Base de Datos"
- Agregar referencia a documento de migración D2

---

### D4. Actualizar GUIA-DEPLOYMENT-RAPIDO.md
**Ubicación:** `/docs/95-guias-desarrollo/GUIA-DEPLOYMENT-RAPIDO.md`
**Tipo:** Actualización
**Dependencias:** D1
**Cambios:**
- Agregar sección "Configuración SSL" con link a D1
- Expandir opciones de validate-deployment.sh
- Agregar nueva sección "Validación post-deployment"

---

## BATCH 2: MEDIA PRIORIDAD (Frontend Hooks y Componentes)

### D5. ADMIN-GAMIFICATION-CONFIG-HOOK.md
**Ubicación:** `/docs/frontend/admin/hooks/ADMIN-GAMIFICATION-CONFIG-HOOK.md`
**Tipo:** Nueva documentación técnica
**Dependencias:** Ninguna
**Contenido:**
- Propósito del hook
- API expuesta (queries y mutations)
- Parámetros y retornos
- Configuración de React Query
- Validación defensiva
- Ejemplos de uso
- Dependencias

---

### D6. ADMIN-CLASSROOMS-HOOK.md
**Ubicación:** `/docs/frontend/admin/hooks/ADMIN-CLASSROOMS-HOOK.md`
**Tipo:** Nueva documentación técnica
**Dependencias:** Ninguna
**Contenido:**
- Propósito
- Parámetros de entrada
- Retorno
- Configuración de React Query
- Ejemplos de uso

---

### D7. ALERT-COMPONENTS-ARCHITECTURE.md
**Ubicación:** `/docs/frontend/admin/components/ALERT-COMPONENTS-ARCHITECTURE.md`
**Tipo:** Nueva documentación de arquitectura
**Dependencias:** Ninguna
**Contenido:**
- Estructura general del sistema
- Hook useAlerts (API completa)
- Utility module alertUtils.ts
- 7 componentes documentados:
  - AlertsStats
  - AlertFilters
  - AlertsList
  - AlertCard
  - AlertDetailsModal
  - AcknowledgeAlertModal
  - ResolveAlertModal
- Tipos principales
- Diagrama de flujo

---

### D8. TEACHER-MONITORING-COMPONENTS.md
**Ubicación:** `/docs/frontend/teacher/components/TEACHER-MONITORING-COMPONENTS.md`
**Tipo:** Nueva documentación técnica
**Dependencias:** Ninguna
**Contenido:**
- StudentStatusCard
  - Props
  - Estados visuales
  - Lógica de estado
- StudentDetailModal
  - Props
  - Secciones (5)
  - Datos mostrados
- StudentPagination
  - Props
  - Funcionalidades
- StudentMonitoringPanel
  - Props
  - Características (5)
  - Vistas duales
  - Controles

---

### D9. TEACHER-RESPONSE-MANAGEMENT.md
**Ubicación:** `/docs/frontend/teacher/components/TEACHER-RESPONSE-MANAGEMENT.md`
**Tipo:** Nueva documentación técnica
**Dependencias:** Ninguna
**Contenido:**
- ResponseDetailModal
  - Props
  - Secciones (8)
  - Lógica especial (ejercicios con revisión manual)
- ResponsesTable
  - Props
  - Columnas
  - Estados
  - Paginación
- ResponseFilters
  - Props
  - Filtros (4)
  - Funcionalidades

---

### D10. Actualizar Inventario de Funciones Database
**Ubicación:** `/docs/90-transversal/inventarios-database/04-FUNCTIONS-INVENTORY.md`
**Tipo:** Actualización
**Dependencias:** D2
**Cambios:**
- Agregar/actualizar funciones de gamification
- Documentar correcciones CORR-P0-001, CORR-001
- Agregar validate_rueda_inferencias

---

### D11. Actualizar scripts/README.md
**Ubicación:** `/scripts/README.md`
**Tipo:** Actualización
**Dependencias:** D1
**Cambios:**
- Agregar entrada para setup-ssl-certbot.sh
- Actualizar descripción de validate-deployment.sh

---

### D12. TEACHER-TYPES-REFERENCE.md
**Ubicación:** `/docs/frontend/teacher/types/TEACHER-TYPES-REFERENCE.md`
**Tipo:** Nueva documentación
**Dependencias:** D8, D9
**Contenido:**
- StudentMonitoring type
- AttemptResponse type
- Tipos relacionados

---

## BATCH 3: BAJA PRIORIDAD (Especificaciones de Páginas)

### D13. AdminGamificationPage-Specification.md
**Ubicación:** `/docs/frontend/admin/pages/AdminGamificationPage-Specification.md`
**Tipo:** Nueva especificación
**Dependencias:** D5
**Contenido:**
- Estructura de página
- Tabs y modales
- Componentes usados
- Estados y transiciones

---

### D14. AdminUsersPage-Specification.md
**Ubicación:** `/docs/frontend/admin/pages/AdminUsersPage-Specification.md`
**Tipo:** Nueva especificación
**Dependencias:** Ninguna
**Contenido:**
- Layout de página
- Tabla y filtros
- CRUD operations
- Modales

---

### D15. AdminAlertsPage-Specification.md
**Ubicación:** `/docs/frontend/admin/pages/AdminAlertsPage-Specification.md`
**Tipo:** Nueva especificación
**Dependencias:** D7
**Contenido:**
- Layout
- Componentes integrados
- Flujo de alertas
- Estados

---

### D16. TEACHER-PAGES-SPECIFICATIONS.md
**Ubicación:** `/docs/frontend/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md`
**Tipo:** Nueva especificación consolidada
**Dependencias:** D8, D9
**Contenido:**
- TeacherMonitoringPage specs
- TeacherExerciseResponsesPage specs
- TeacherDashboard changes
- TeacherProgressPage specs

---

### D17. Frontend-Alert-System-Guide.md
**Ubicación:** `/docs/frontend/guides/Frontend-Alert-System-Guide.md`
**Tipo:** Guía de uso
**Dependencias:** D7, D15
**Contenido:**
- Guía de uso del sistema
- Ejemplos de integración
- Patrones comunes
- Troubleshooting

---

### D18. Documentación validate_rueda_inferencias
**Ubicación:** `/docs/database/functions/VALIDATE-RUEDA-INFERENCIAS.md`
**Tipo:** Nueva documentación
**Dependencias:** Ninguna
**Contenido:**
- Propósito de la función
- Parámetros
- Estructuras soportadas
- Lógica de validación
- Ejemplos de uso

---

## ORDEN DE EJECUCIÓN

```
BATCH 1 (ALTA PRIORIDAD):
├── D1: GUIA-SSL-CERTBOT-DEPLOYMENT.md
├── D2: MIGRACION-MAYA-RANKS-v2.1.md
├── D3: Actualizar ET-GAM-003-rangos-maya.md (depende D2)
└── D4: Actualizar GUIA-DEPLOYMENT-RAPIDO.md (depende D1)

BATCH 2 (MEDIA PRIORIDAD):
├── D5: ADMIN-GAMIFICATION-CONFIG-HOOK.md
├── D6: ADMIN-CLASSROOMS-HOOK.md
├── D7: ALERT-COMPONENTS-ARCHITECTURE.md
├── D8: TEACHER-MONITORING-COMPONENTS.md
├── D9: TEACHER-RESPONSE-MANAGEMENT.md
├── D10: Actualizar inventario funciones (depende D2)
├── D11: Actualizar scripts/README.md (depende D1)
└── D12: TEACHER-TYPES-REFERENCE.md (depende D8, D9)

BATCH 3 (BAJA PRIORIDAD):
├── D13: AdminGamificationPage-Specification.md (depende D5)
├── D14: AdminUsersPage-Specification.md
├── D15: AdminAlertsPage-Specification.md (depende D7)
├── D16: TEACHER-PAGES-SPECIFICATIONS.md (depende D8, D9)
├── D17: Frontend-Alert-System-Guide.md (depende D7, D15)
└── D18: Documentación validate_rueda_inferencias
```

---

## ESTRUCTURA DE CARPETAS A CREAR

```
/docs/
├── 90-transversal/
│   └── migraciones/
│       └── MIGRACION-MAYA-RANKS-v2.1.md (D2)
├── 95-guias-desarrollo/
│   └── GUIA-SSL-CERTBOT-DEPLOYMENT.md (D1)
├── database/
│   └── functions/
│       └── VALIDATE-RUEDA-INFERENCIAS.md (D18)
└── frontend/
    ├── admin/
    │   ├── hooks/
    │   │   ├── ADMIN-GAMIFICATION-CONFIG-HOOK.md (D5)
    │   │   └── ADMIN-CLASSROOMS-HOOK.md (D6)
    │   ├── components/
    │   │   └── ALERT-COMPONENTS-ARCHITECTURE.md (D7)
    │   └── pages/
    │       ├── AdminGamificationPage-Specification.md (D13)
    │       ├── AdminUsersPage-Specification.md (D14)
    │       └── AdminAlertsPage-Specification.md (D15)
    ├── teacher/
    │   ├── components/
    │   │   ├── TEACHER-MONITORING-COMPONENTS.md (D8)
    │   │   └── TEACHER-RESPONSE-MANAGEMENT.md (D9)
    │   ├── pages/
    │   │   └── TEACHER-PAGES-SPECIFICATIONS.md (D16)
    │   └── types/
    │       └── TEACHER-TYPES-REFERENCE.md (D12)
    └── guides/
        └── Frontend-Alert-System-Guide.md (D17)
```

---

## VALIDACIONES PENDIENTES (FASE 4)

1. Verificar que todas las carpetas destino existan o crearlas
2. Verificar referencias cruzadas entre documentos
3. Verificar que no falten objetos dependientes
4. Validar consistencia de nomenclatura
5. Verificar que los docs existentes a actualizar estén sincronizados

---

**Status:** FASE 3 COMPLETADA
**Próximo:** FASE 4 - Validación de plan vs análisis
