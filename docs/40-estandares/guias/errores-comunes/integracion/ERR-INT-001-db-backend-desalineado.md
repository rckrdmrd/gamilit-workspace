# ERR-INT-001: Database-Backend Desalineado

## Descripcion
Las entities de TypeORM no coinciden con las tablas DDL, causando errores en runtime, queries fallidos, o datos corruptos.

## Sintomas
- Error: `column "xxx" does not exist`
- Error: `relation "xxx" does not exist`
- Queries retornan `null` en campos que deberian tener datos
- Tipos de datos no coinciden (ej: `string` vs `number`)
- Relaciones (OneToMany, ManyToOne) no funcionan

## Causa Raiz
1. Cambios en DDL sin actualizar entities
2. Cambios en entities sin actualizar DDL
3. Tipos de datos mal mapeados
4. Nombres de columnas con case mismatch (snake_case vs camelCase)
5. Falta de sincronizacion despues de migraciones

## Solucion

### 1. Verificar alineacion
```bash
# Comparar tabla DDL con entity
# DDL: apps/database/ddl/schemas/{schema}/tables/{table}.sql
# Entity: apps/backend/src/modules/{module}/entities/{entity}.entity.ts
```

### 2. Mapeo correcto de tipos

| PostgreSQL | TypeORM | TypeScript |
|------------|---------|------------|
| uuid | uuid | string |
| varchar(n) | varchar | string |
| text | text | string |
| integer | int | number |
| bigint | bigint | string |
| boolean | boolean | boolean |
| timestamp | timestamp | Date |
| timestamptz | timestamptz | Date |
| jsonb | jsonb | Record<string, any> |
| enum | enum | string (con @Column({ type: 'enum', enum: MyEnum })) |

### 3. Configurar decoradores correctamente
```typescript
@Entity('table_name') // Nombre exacto de la tabla
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'column_name' }) // Mapear si difiere de propiedad
  columnName: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => OtherEntity)
  @JoinColumn({ name: 'other_entity_id' }) // FK exacta
  otherEntity: OtherEntity;
}
```

### 4. Verificar relaciones
```typescript
// DDL tiene: other_entity_id UUID REFERENCES other_schema.other_table(id)
// Entity debe tener:
@ManyToOne(() => OtherEntity)
@JoinColumn({ name: 'other_entity_id' })
otherEntity: OtherEntity;

@Column({ name: 'other_entity_id' })
otherEntityId: string;
```

## Prevencion

1. **DDL-First**: Siempre crear DDL antes que entity
2. **Checklist de cambios**:
   - [ ] DDL actualizado
   - [ ] Entity actualizada
   - [ ] Tipos coinciden
   - [ ] Relaciones definidas
   - [ ] Build exitoso
3. **Auditorias periodicas**: Comparar inventarios DB vs BE
4. **Tests de integracion**: Queries reales contra BD de prueba

### Herramientas de validacion
```bash
# Contar tablas vs entities
ls apps/database/ddl/schemas/*/tables/*.sql | wc -l
ls apps/backend/src/modules/*/entities/*.entity.ts | wc -l
```

## Ocurrencias

| Fecha | Tabla/Entity | Issue | Estado |
|-------|--------------|-------|--------|
| 2025-12-28 | teacher_pending_reviews | Columna faltante | Resuelto |
| 2025-12-27 | manual_reviews | Entity no existia | Resuelto |
| 2025-12-26 | user_sessions | Tipos incorrectos | Resuelto |
| 2025-11-28 | achievements | Relaciones incorrectas | Resuelto |

## Referencias

- **Inventario DB:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **Inventario BE:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
- **Patron mapeo:** `docs/98-standards/MAPEO-TIPOS-DDL-TYPESCRIPT.md`
- **Informe validacion:** `INFORME-FINAL-VALIDACION-INTEGRACION-2025-12-28.md`

---

**Severidad:** Alta
**Frecuencia:** 4+ ocurrencias
**Tiempo de resolucion:** 30-60 min
**Ultimo update:** 2025-12-28
