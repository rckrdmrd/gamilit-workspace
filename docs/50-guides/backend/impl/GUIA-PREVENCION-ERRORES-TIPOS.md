---
titulo: Guía de Prevención de Errores de Tipos TypeScript
tipo: guia
dominio: backend
ultima_actualizacion: 2026-02-27
---

# Guía de Prevención de Errores de Tipos TypeScript

**Fecha:** 2026-01-19
**Origen:** Análisis de errores de build en TASK-2026-01-18-015, TASK-2026-01-19-003
**Sistema:** SIMCO v4.0.0

---

## 1. Problema Identificado

Durante el desarrollo se detectaron errores de compilación TypeScript del tipo:

```
error TS2322: Type 'ReportType' is not assignable to type 'TeacherReportTypeEnum'.
error TS2345: Argument of type 'string' is not assignable to parameter of type 'ClassroomMemberStatusEnum'.
```

**Causa raíz:** Enums y tipos definidos en múltiples lugares con nombres similares pero no idénticos.

---

## 2. Patrones Anti-Pattern (EVITAR)

### 2.1 Duplicación de Enums

**MAL - Definir enums en múltiples archivos:**

```typescript
// ❌ archivo-a.dto.ts
export enum ReportType {
  USERS = 'users',
  PROGRESS = 'progress',
}

// ❌ archivo-b.entity.ts
export enum TeacherReportTypeEnum {
  USERS = 'users',
  PROGRESS = 'progress',
}
```

Aunque los valores son iguales, TypeScript los considera tipos diferentes.

### 2.2 String Literals vs Enums

**MAL - Mezclar string literals con enums:**

```typescript
// ❌ DTO acepta string
class UpdateStatusDto {
  @IsString()
  status: string;  // 'active' | 'inactive'
}

// ❌ Service espera enum
updateStatus(id: string, status: MemberStatusEnum) { ... }

// ❌ Controller pasa string a método que espera enum
return this.service.updateStatus(id, dto.status);  // ERROR TS2345
```

---

## 3. Patrones Correctos (USAR)

### 3.1 Centralizar Enums en `shared/constants/enums.constants.ts`

```typescript
// ✅ apps/backend/src/shared/constants/enums.constants.ts

/**
 * Enum centralizado para tipos de reporte
 * @used-by teacher-report.entity.ts, reports.dto.ts, reports.service.ts
 */
export enum TeacherReportTypeEnum {
  INDIVIDUAL = 'individual',
  CLASSROOM = 'classroom',
  PROGRESS = 'progress',
  ANALYTICS = 'analytics',
}

/**
 * Enum centralizado para estados de miembro de classroom
 * @used-by classroom-member.entity.ts, classroom-members.dto.ts
 */
export enum ClassroomMemberStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
}
```

### 3.2 Importar en Todos los Lugares

```typescript
// ✅ entity.ts
import { TeacherReportTypeEnum } from '@/shared/constants/enums.constants';

@Column({ type: 'enum', enum: TeacherReportTypeEnum })
reportType: TeacherReportTypeEnum;

// ✅ dto.ts
import { TeacherReportTypeEnum } from '@/shared/constants/enums.constants';

@IsEnum(TeacherReportTypeEnum)
type: TeacherReportTypeEnum;

// ✅ service.ts
import { TeacherReportTypeEnum } from '@/shared/constants/enums.constants';

async createReport(type: TeacherReportTypeEnum) { ... }
```

### 3.3 Usar Enums en DTOs (no strings)

```typescript
// ✅ DTO con enum
class UpdateStatusDto {
  @IsEnum(ClassroomMemberStatusEnum)
  status: ClassroomMemberStatusEnum;
}

// ✅ Service recibe el mismo tipo
updateStatus(id: string, status: ClassroomMemberStatusEnum) { ... }

// ✅ Controller - tipos coinciden
return this.service.updateStatus(id, dto.status);  // OK
```

### 3.4 Cast Explícito para Raw SQL

Cuando se usa QueryBuilder con raw SQL, los resultados vienen como strings:

```typescript
// ✅ Cast explícito para raw SQL results
const rawResult = await queryBuilder.getRawOne();

const entity: Partial<ClassroomMember> = {
  status: rawResult.status as ClassroomMemberStatusEnum,  // Cast explícito
};
```

---

## 4. Sincronización Frontend-Backend

### 4.1 Documentar Dependencias con JSDoc

```typescript
// ✅ Frontend: apps/frontend/src/apps/teacher/types/index.ts

/**
 * Alert type values for intervention alerts
 * @synchronized-with backend/src/shared/types/intervention-alerts.types.ts
 * @synchronized-with database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql
 * @last-sync 2026-01-19
 */
export type AlertType =
  | 'no_activity'
  | 'low_score'
  | 'declining_trend'
  | 'repeated_failures'
  | 'excessive_time'
  | 'low_engagement';
```

### 4.2 Mantener Paridad DDL-Entity-DTO

```
DDL CHECK constraint → Entity enum → DTO validation → Frontend type
         ↓                  ↓              ↓                ↓
   ('value1','value2')   VALUE1='value1'  @IsEnum()    'value1'|'value2'
```

---

## 5. Checklist de Validación

Antes de crear un nuevo tipo/enum, verificar:

- [ ] ¿Existe ya un enum similar en `shared/constants/enums.constants.ts`?
- [ ] ¿El DDL tiene un CHECK constraint con los mismos valores?
- [ ] ¿El DTO usa `@IsEnum()` con el enum centralizado?
- [ ] ¿El frontend tiene documentación `@synchronized-with`?
- [ ] ¿Los valores string coinciden exactamente (case-sensitive)?

---

## 6. Comandos de Verificación

```bash
# Buscar enums duplicados
grep -r "export enum" apps/backend/src --include="*.ts" | grep -v node_modules

# Buscar definiciones de tipos similares
grep -rn "ReportType\|TeacherReportType" apps/backend/src

# Verificar build después de cambios
cd apps/backend && npm run build
```

---

## 7. Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `TS2322: Type 'A' not assignable to 'B'` | Enums duplicados | Usar enum centralizado |
| `TS2345: Argument of type 'string'...` | DTO usa string, service usa enum | DTO debe usar @IsEnum |
| `undefined` en columna enum | Valor no existe en enum | Agregar valor al enum |
| Runtime error en enum | DDL y entity desincronizados | Sincronizar DDL CHECK con enum |

---

## 8. Referencias

- `apps/backend/src/shared/constants/enums.constants.ts` - Enums centralizados
- `apps/backend/src/shared/types/` - Tipos compartidos
- `orchestration/tareas/TASK-2026-01-19-003/05-CONSOLIDACION-TIPOS-DUPLICADOS.md` - Caso de estudio

---

**Última actualización:** 2026-01-19
**Autor:** Claude Opus 4.5 (SIMCO)
