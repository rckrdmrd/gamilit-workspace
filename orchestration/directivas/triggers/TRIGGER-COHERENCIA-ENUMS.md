# TRIGGER: Coherencia de Enums y Tipos

**ID:** TRIGGER-COHERENCIA-ENUMS
**Version:** 1.0.0
**Fecha:** 2026-01-19
**Origen:** Errores TS2322/TS2345 en TASK-2026-01-18-015

---

## Activación

Este trigger se activa cuando:

1. Se crea un nuevo `enum` en backend
2. Se modifica un enum existente
3. Se crea un DTO con campos que podrían ser enums
4. Se añade una columna `enum` o con `CHECK` constraint en DDL

---

## Validaciones Requeridas

### 1. Verificar Centralización

```bash
# Buscar si el enum ya existe en ubicación centralizada
grep -r "export enum" apps/backend/src/shared/constants/
grep -r "export enum" apps/backend/src/shared/types/
```

**SI EXISTE:** Importar desde ubicación centralizada, NO crear nuevo.

**SI NO EXISTE:** Crear en `shared/constants/enums.constants.ts` o `shared/types/`.

### 2. Verificar Coherencia DDL

Si el enum corresponde a una columna de BD:

```sql
-- El CHECK constraint debe tener los MISMOS valores
CHECK (column_name IN ('value1', 'value2', 'value3'))
```

**Valores deben coincidir EXACTAMENTE (case-sensitive).**

### 3. Verificar Uso en DTO

```typescript
// DTO debe usar @IsEnum con el enum centralizado
@IsEnum(MiEnumCentralizado)
campo: MiEnumCentralizado;

// NO usar @IsString() para campos que son enums
```

### 4. Documentar Sincronización Frontend

Si el frontend consume este tipo:

```typescript
/**
 * @synchronized-with backend/src/shared/constants/enums.constants.ts
 * @last-sync YYYY-MM-DD
 */
export type MiTipo = 'value1' | 'value2' | 'value3';
```

---

## Checklist de Validación

```
[ ] Enum definido en shared/constants/ o shared/types/
[ ] Entity importa desde ubicación centralizada
[ ] DTO usa @IsEnum() con enum centralizado
[ ] Service usa el mismo tipo de enum
[ ] DDL CHECK constraint tiene los mismos valores
[ ] Frontend tiene @synchronized-with documentado
[ ] npm run build pasa sin errores TS2322/TS2345
```

---

## Ejemplo de Corrección

### Antes (ERROR):

```typescript
// dto.ts - define su propio enum
enum MyStatus { A = 'a', B = 'b' }

// entity.ts - define otro enum con mismo propósito
enum EntityStatus { A = 'a', B = 'b' }

// service.ts - recibe el tipo del entity
updateStatus(status: EntityStatus) { ... }

// controller.ts - pasa el tipo del DTO
this.service.updateStatus(dto.status); // TS2345 ERROR!
```

### Después (CORRECTO):

```typescript
// shared/constants/enums.constants.ts
export enum StatusEnum { A = 'a', B = 'b' }

// dto.ts
import { StatusEnum } from '@/shared/constants/enums.constants';
@IsEnum(StatusEnum) status: StatusEnum;

// entity.ts
import { StatusEnum } from '@/shared/constants/enums.constants';
@Column({ type: 'enum', enum: StatusEnum }) status: StatusEnum;

// service.ts
import { StatusEnum } from '@/shared/constants/enums.constants';
updateStatus(status: StatusEnum) { ... }

// controller.ts
this.service.updateStatus(dto.status); // OK - mismo tipo
```

---

## Acciones en Caso de Violación

1. **DETENER** implementación
2. **REFACTORIZAR** para usar enum centralizado
3. **ACTUALIZAR** todas las referencias
4. **VALIDAR** con `npm run build`
5. **DOCUMENTAR** cambios en METADATA de tarea

---

## Referencias

- `docs/95-guias-desarrollo/backend/GUIA-PREVENCION-ERRORES-TIPOS.md`
- `apps/backend/src/shared/constants/enums.constants.ts`
- `orchestration/tareas/TASK-2026-01-19-003/05-CONSOLIDACION-TIPOS-DUPLICADOS.md`
