# PLAN DE MIGRACIÓN DETALLADO - GAMILIT

**Fecha:** 2025-12-18
**Versión:** 1.0.0
**Estado:** FASE 1 - ANÁLISIS EN PROGRESO
**Analista:** Requirements-Analyst Agent

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo
Sincronizar todos los cambios realizados en el proyecto gamilit desde el repositorio de desarrollo (`/home/isem/workspace/projects/gamilit`) hacia el repositorio de producción (`/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit`).

### 1.2 Alcance
- **Total archivos a procesar:** 393 cambios
- **Archivos modificados (M):** 213
- **Archivos nuevos (??):** 97
- **Archivos eliminados (D):** 83

### 1.3 Repositorios

| Repositorio | Ruta | Cambios Pendientes | Rol |
|-------------|------|-------------------|-----|
| **ORIGEN (Desarrollo)** | `/home/isem/workspace/projects/gamilit` | 393 | Fuente de verdad |
| **DESTINO (Producción)** | `/home/isem/workspace-old/.../gamilit/projects/gamilit` | 151 | Receptor |

---

## 2. CLASIFICACIÓN DE CAMBIOS POR ÁREA

### 2.1 Desglose por Aplicación

| Área | Archivos | Porcentaje | Prioridad |
|------|----------|------------|-----------|
| **Docs** | 117 | 29.8% | P3 |
| **Frontend** | 105 | 26.7% | P1 |
| **Database** | 70 | 17.8% | P0 (Crítico) |
| **Orchestration** | 59 | 15.0% | P3 |
| **Backend** | 40 | 10.2% | P1 |
| **Otros** | 2 | 0.5% | P2 |

### 2.2 Desglose por Tipo de Cambio

| Estado | Cantidad | Acción Requerida |
|--------|----------|------------------|
| Modificados (M) | 213 | Copiar/Sobrescribir |
| Nuevos (??) | 97 | Copiar |
| Eliminados (D) | 83 | Eliminar en destino |

---

## 3. ANÁLISIS DETALLADO POR ÁREA

### 3.1 DATABASE (70 archivos) - PRIORIDAD CRÍTICA

#### 3.1.1 DDL (Schemas, Tables, Functions, Triggers)
- Esquemas modificados: auth, educational_content, gamification_system, progress_tracking, public, storage
- Nuevas políticas RLS
- Nuevos triggers

#### 3.1.2 Seeds
- Seeds de desarrollo (dev/) - Nuevos y modificados
- Seeds de producción (prod/) - Críticos para el deploy
- Seeds de staging - Modificados

#### 3.1.3 Archivos Críticos a Revisar
```
M apps/database/ddl/schemas/auth/tables/01-users.sql
M apps/database/ddl/schemas/gamification_system/functions/*.sql
M apps/database/seeds/prod/*.sql
```

### 3.2 BACKEND (40 archivos) - PRIORIDAD ALTA

#### 3.2.1 Módulos Afectados
- assignments
- auth
- educational
- gamification
- health
- progress
- teacher

#### 3.2.2 Tipos de Cambios
- Entities modificadas
- Services actualizados
- Controllers con nuevos endpoints
- DTOs nuevos y eliminados

#### 3.2.3 DTOs Eliminados (Requieren limpieza)
```
D apps/backend/src/modules/educational/dto/module5/diario-reflexivo-answer.dto.ts
D apps/backend/src/modules/educational/dto/module5/podcast-answer.dto.ts
```

#### 3.2.4 DTOs Nuevos
```
?? apps/backend/src/modules/educational/dto/module5/comic-digital-answer.dto.ts
?? apps/backend/src/modules/educational/dto/module5/diario-multimedia-answer.dto.ts
```

### 3.3 FRONTEND (105 archivos) - PRIORIDAD ALTA

#### 3.3.1 Áreas Afectadas
- Admin portal (apps/admin/)
- Student portal (apps/student/)
- Teacher portal (apps/teacher/)
- Features de gamificación
- Features de mecánicas educativas
- Servicios API

#### 3.3.2 Componentes Eliminados (Module4)
```
D apps/frontend/src/features/mechanics/module4/ChatLiterario/
D apps/frontend/src/features/mechanics/module4/EmailFormal/
D apps/frontend/src/features/mechanics/module4/EnsayoArgumentativo/
D apps/frontend/src/features/mechanics/module4/ResenaCritica/
```

#### 3.3.3 Componentes Nuevos (Module5)
```
?? apps/frontend/src/features/mechanics/module5/ComicDigital/
?? apps/frontend/src/features/mechanics/module5/DiarioMultimedia/
?? apps/frontend/src/features/mechanics/module5/VideoCarta/
```

### 3.4 DOCS (117 archivos) - PRIORIDAD BAJA

#### 3.4.1 Documentación a Purgar
- 83 archivos históricos (2025-11)
- Reportes de implementación obsoletos
- Gaps cerrados

#### 3.4.2 Documentación a Mantener
- Guías de desarrollo
- Especificaciones técnicas actualizadas
- Quick reference

### 3.5 ORCHESTRATION (59 archivos) - PRIORIDAD BAJA

#### 3.5.1 Inventarios
- MASTER_INVENTORY.yml
- DATABASE_INVENTORY.yml
- BACKEND_INVENTORY.yml
- FRONTEND_INVENTORY.yml
- SEEDS_INVENTORY.yml

#### 3.5.2 Reportes
- Nuevos reportes de corrección
- Análisis de coherencia
- Planes de implementación

---

## 4. FASES DE EJECUCIÓN

### FASE 1: ANÁLISIS (ACTUAL)
**Estado:** EN PROGRESO
**Objetivo:** Documentar todos los cambios con detalle

#### Subtareas:
- [x] Clasificar cambios por tipo (M, D, ??)
- [x] Clasificar por área (backend, frontend, database, docs, orchestration)
- [x] Identificar archivos críticos
- [ ] Generar inventario detallado por archivo
- [ ] Documentar dependencias

### FASE 2: EJECUCIÓN DEL ANÁLISIS
**Estado:** PENDIENTE
**Objetivo:** Análisis profundo de cada archivo

#### Subtareas:
- [ ] Analizar cada archivo modificado en backend
- [ ] Analizar cada archivo modificado en frontend
- [ ] Analizar cada archivo modificado en database
- [ ] Verificar integridad de relaciones
- [ ] Documentar impactos

### FASE 3: PLANEACIÓN DE IMPLEMENTACIÓN
**Estado:** PENDIENTE
**Objetivo:** Plan detallado de sincronización

#### Subtareas:
- [ ] Ordenar por dependencias
- [ ] Definir orden de ejecución
- [ ] Crear scripts de sincronización
- [ ] Definir rollback plan

### FASE 4: VALIDACIÓN
**Estado:** PENDIENTE
**Objetivo:** Verificar completitud y dependencias

#### Subtareas:
- [ ] Validar que todas las dependencias están incluidas
- [ ] Verificar que no hay imports rotos
- [ ] Validar coherencia de tipos
- [ ] Validar que seeds están completos

### FASE 5: EJECUCIÓN
**Estado:** PENDIENTE
**Objetivo:** Ejecutar la sincronización

#### Subtareas:
- [ ] Backup del destino
- [ ] Sincronizar Database
- [ ] Sincronizar Backend
- [ ] Sincronizar Frontend
- [ ] Sincronizar Docs/Orchestration
- [ ] Validar post-migración

---

## 5. ORDEN DE SINCRONIZACIÓN PROPUESTO

```
1. DATABASE (P0 - Crítico)
   └── DDL primero (schemas, tables, functions, triggers)
   └── Seeds después

2. BACKEND (P1 - Alto)
   └── Entities primero
   └── DTOs
   └── Services
   └── Controllers
   └── Módulos

3. FRONTEND (P1 - Alto)
   └── Types primero
   └── Services/API
   └── Stores
   └── Hooks
   └── Components
   └── Pages

4. DOCS (P3 - Bajo)
   └── Purgar archivos obsoletos
   └── Actualizar documentación vigente

5. ORCHESTRATION (P3 - Bajo)
   └── Inventarios
   └── Reportes
```

---

## 6. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos en archivos | Media | Alto | Análisis diff previo |
| Dependencias rotas | Media | Alto | Validación de imports |
| Seeds inconsistentes | Alta | Crítico | Verificación manual |
| Cambios en destino perdidos | Media | Alto | Backup previo |
| Tipos incompatibles | Baja | Medio | TypeScript check |

---

## 7. PRÓXIMOS PASOS

1. **Completar inventario detallado** de los 393 archivos
2. **Analizar el estado del destino** (151 cambios pendientes)
3. **Identificar conflictos potenciales** entre origen y destino
4. **Generar scripts de sincronización** automatizada
5. **Crear plan de validación** post-migración

---

## 8. ANEXOS

### 8.1 Archivos Temporales Generados
- `/tmp/gamilit_changes.txt` - Lista completa de cambios
- `/tmp/gamilit_backend.txt` - Cambios en backend
- `/tmp/gamilit_frontend.txt` - Cambios en frontend
- `/tmp/gamilit_database.txt` - Cambios en database
- `/tmp/gamilit_docs.txt` - Cambios en documentación
- `/tmp/gamilit_orchestration.txt` - Cambios en orchestration
- `/tmp/gamilit_deleted.txt` - Archivos a eliminar
- `/tmp/gamilit_new.txt` - Archivos nuevos

---

**Última actualización:** 2025-12-18
**Autor:** Requirements-Analyst Agent
