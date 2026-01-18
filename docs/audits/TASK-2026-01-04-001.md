# BE-AUDIT-001: Corrección de Referencias Hardcoded en Constantes

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | BE-AUDIT-001 |
| **Tipo** | Backend |
| **Épica** | Deuda Técnica - Audit 2026-01-04 |
| **Prioridad** | P1 |
| **Estimación** | 2 horas |
| **Estado** | Done |
| **Asignado a** | Orchestrator Agent (Architecture Analyst) |

---

## Descripción

Corrección de inconsistencias detectadas durante la auditoría de integración BD-Backend-Frontend del proyecto Gamilit.

## Objetivo

Garantizar que todas las referencias a schemas y tablas de base de datos utilicen las constantes centralizadas en `database.constants.ts` en lugar de strings hardcodeados.

---

## Especificación Técnica

### Archivos Modificados

#### 1. database.constants.ts

**Ubicación:** `/apps/backend/src/shared/constants/database.constants.ts`

**Cambios:**

```typescript
// DB_SCHEMAS - Agregado:
COMMUNICATION: 'communication',  // línea 34

// DB_TABLES.GAMIFICATION - Agregado:
CLASSROOM_MISSIONS: 'classroom_missions',  // línea 92

// DB_TABLES.EDUCATIONAL - Agregado:
TEACHER_CONTENT: 'teacher_content',  // línea 117

// DB_TABLES.SOCIAL - Agregado:
TEACHER_REPORTS: 'teacher_reports',  // línea 167

// DB_TABLES.COMMUNICATION - Nueva sección:
COMMUNICATION: {
  MESSAGES: 'messages',
  MESSAGE_PARTICIPANTS: 'message_participants',
},  // líneas 258-261

// Type helper agregado:
export type CommunicationTable = ...  // líneas 303-304
```

#### 2. message.entity.ts

**Ubicación:** `/apps/backend/src/modules/teacher/entities/message.entity.ts`

**Antes:**
```typescript
@Entity('messages', { schema: 'communication' })
@Entity('message_participants', { schema: 'communication' })
```

**Después:**
```typescript
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity(DB_TABLES.COMMUNICATION.MESSAGES, { schema: DB_SCHEMAS.COMMUNICATION })
@Entity(DB_TABLES.COMMUNICATION.MESSAGE_PARTICIPANTS, { schema: DB_SCHEMAS.COMMUNICATION })
```

#### 3. teacher-content.entity.ts

**Ubicación:** `/apps/backend/src/modules/teacher/entities/teacher-content.entity.ts`

**Antes:**
```typescript
@Entity({ schema: 'educational_content', name: 'teacher_content' })
```

**Después:**
```typescript
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.TEACHER_CONTENT })
```

#### 4. teacher-report.entity.ts

**Ubicación:** `/apps/backend/src/modules/teacher/entities/teacher-report.entity.ts`

**Antes:**
```typescript
@Entity({ name: 'teacher_reports', schema: 'social_features' })
```

**Después:**
```typescript
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({ name: DB_TABLES.SOCIAL.TEACHER_REPORTS, schema: DB_SCHEMAS.SOCIAL })
```

#### 5. classroom-mission.entity.ts

**Ubicación:** `/apps/backend/src/modules/gamification/entities/classroom-mission.entity.ts`

**Antes:**
```typescript
import { DB_SCHEMAS } from '@/shared/constants/database.constants';

@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: 'classroom_missions' })
```

**Después:**
```typescript
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.CLASSROOM_MISSIONS })
```

---

## Criterios de Aceptación Técnicos

- [x] Schema `COMMUNICATION` agregado a `DB_SCHEMAS`
- [x] Tablas faltantes agregadas a `DB_TABLES`
- [x] Entidades actualizadas para usar constantes
- [x] TypeScript compila sin errores
- [x] Type helper `CommunicationTable` agregado
- [x] Documentación actualizada

---

## Validación

**Comando de validación:**
```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/backend
npx tsc --noEmit --skipLibCheck
```

**Resultado:** ✅ Sin errores

---

## Dependencias

**Requiere completadas:**
- [x] Análisis de auditoría completado

**Bloquea:**
- Ninguna

---

## Definition of Done

- [x] Código implementado
- [x] Compilación sin errores
- [x] Comentarios/documentación agregados
- [x] Inventario actualizado (database.constants.ts)
- [x] Traza registrada (CHANGELOG-AUDIT-2026-01-04.md)

---

## Log de Ejecución

| Fecha/Hora | Acción | Resultado |
|------------|--------|-----------|
| 2026-01-04 14:30 | Inicio auditoría | - |
| 2026-01-04 14:35 | Análisis BD completado | ✅ 132 tablas, 96 funciones |
| 2026-01-04 14:40 | Análisis Backend completado | ✅ 98 entidades |
| 2026-01-04 14:45 | Análisis Frontend completado | ✅ 45+ tipos |
| 2026-01-04 14:50 | Matriz de validación generada | ✅ |
| 2026-01-04 15:00 | Correcciones aplicadas | ✅ 5 archivos |
| 2026-01-04 15:05 | Validación TypeScript | ✅ Sin errores |
| 2026-01-04 15:10 | Documentación completada | PASS |

---

**Asignada por:** Orchestrator Agent
**Fecha asignación:** 2026-01-04
**Fecha completada:** 2026-01-04
**Duración real:** 1.5 horas
