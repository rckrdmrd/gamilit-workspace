---
titulo: Error BE-004 Datasource Entity Path Incorrecto
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-BE-004: Datasource Entity Path Incorrecto

### Descripcion
Las entidades de TypeORM no se encuentran porque su archivo no esta incluido en el array `entities` del datasource correcto en `app.module.ts`. Esto causa errores de inyeccion de repositorio en tiempo de ejecucion.

### Sintomas
- Error: `No repository for "EntityName" was found. Looks like this entity is not registered in current "default" connection`
- Error: `EntityMetadataNotFoundError: No metadata for "EntityName" was found`
- Error: `RepositoryNotFoundError` al inyectar con `@InjectRepository(Entity, 'datasource_name')`
- El entity compila sin errores pero falla al iniciar la aplicacion
- Tests pasan pero la aplicacion crashea al arrancar
- Relaciones `@ManyToOne` o `@OneToMany` a entities de otros modulos fallan silenciosamente

### Causa Raiz
1. **Entity no registrado en ningun datasource:** El archivo `.entity.ts` existe pero su glob path no esta en ninguna configuracion `TypeOrmModule.forRootAsync()` en `app.module.ts`
2. **Entity en datasource incorrecto:** El entity esta registrado pero en un datasource diferente al que se usa con `@InjectRepository(Entity, 'nombre_datasource')`
3. **Relaciones cross-datasource no declaradas:** Un entity A en datasource X tiene relacion `@ManyToOne` con entity B en datasource Y, pero entity B no esta duplicado en datasource X
4. **Glob path no cubre el archivo:** El patron glob (ej: `__dirname + '/modules/auth/entities/**/*.entity{.ts,.js}'`) no alcanza el directorio donde realmente esta el entity
5. **Entidades de modulo nuevo sin datasource:** Se crea un modulo nuevo con entities pero se olvida configurar o extender un datasource

### Solucion

### 1. Identificar a que datasource pertenece el entity
Revisar el schema de la tabla en la DDL y mapear al datasource correspondiente:

| Schema DDL | Datasource name | Glob path |
|------------|-----------------|-----------|
| auth_management | auth | `/modules/auth/entities/**/*.entity{.ts,.js}` |
| educational_content | educational | `/modules/educational/entities/**/*.entity{.ts,.js}` |
| student_progress | progress | `/modules/progress/entities/**/*.entity{.ts,.js}` |
| social_interaction | social | `/modules/social/entities/**/*.entity{.ts,.js}` |
| gamification | gamification | `/modules/gamification/entities/**/*.entity{.ts,.js}` |
| teacher_tools | teacher | `/modules/teacher/entities/**/*.entity{.ts,.js}` |
| content_management | content | `/modules/content/entities/**/*.entity{.ts,.js}` |
| notification_system | notifications | `/modules/notifications/entities/**/*.entity{.ts,.js}` |
| communication | communication | `/modules/communication/entities/**/*.entity{.ts,.js}` |
| admin | admin | `/modules/admin/entities/**/*.entity{.ts,.js}` |

### 2. Agregar entity al datasource correcto
```typescript
// app.module.ts - Dentro de TypeOrmModule.forRootAsync correspondiente
entities: [
  __dirname + '/modules/MODULO/entities/**/*.entity{.ts,.js}',
  // Agregar path del entity faltante:
  __dirname + '/modules/OTRO_MODULO/entities/mi-entity.entity{.ts,.js}',
],
```

### 3. Para relaciones cross-datasource, agregar entity referenciado
```typescript
// Ejemplo real: datasource 'progress' necesita Profile de 'auth'
// FIX-BE-014-2026-01-28: Required for UserStats @OneToOne -> Profile relation
__dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
// FIX-BE-014b-2026-01-28: Required for Profile @ManyToOne -> Tenant cascade
__dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
```

### 4. Verificar que el @InjectRepository usa el datasource correcto
```typescript
// INCORRECTO: usa default datasource (no existe en gamilit)
constructor(
  @InjectRepository(MyEntity)
  private myRepo: Repository<MyEntity>,
) {}

// CORRECTO: especifica el datasource donde el entity esta registrado
constructor(
  @InjectRepository(MyEntity, 'educational')
  private myRepo: Repository<MyEntity>,
) {}
```

### 5. Documentar el fix con comentario FIX-BE
```typescript
// FIX-BE-XXX-YYYY-MM-DD: Descripcion de por que se agrego este path
__dirname + '/modules/otro/entities/entity-necesario.entity{.ts,.js}',
```

### Prevencion

1. **Siempre verificar datasource** antes de crear un entity nuevo: revisar `app.module.ts` para confirmar que el glob path cubre el directorio del entity
2. **Documentar relaciones cross-datasource** con comentario `// FIX-BE-XXX` cada vez que se agrega un entity a un datasource que no es su "hogar"
3. **Probar arranque local** (`npm run start:dev`) despues de crear cualquier entity nuevo; no confiar solo en `npm run build`
4. **Revisar cascadas:** Si entity A referencia entity B con `@ManyToOne`, y B referencia entity C, los tres deben estar en el mismo datasource

### Checklist para nuevo entity:
- [ ] Entity tiene `@Entity('nombre_tabla')` con nombre correcto
- [ ] Entity esta en directorio cubierto por glob de su datasource
- [ ] `@InjectRepository(Entity, 'datasource_name')` usa nombre correcto
- [ ] Service declara el repositorio en constructor
- [ ] Module tiene `TypeOrmModule.forFeature([Entity], 'datasource_name')`
- [ ] Relaciones cross-datasource: entities referenciados estan duplicados en el datasource
- [ ] Aplicacion arranca sin errores (`npm run start:dev`)

### Comando de verificacion
```bash
# Buscar entities no cubiertos por ningun glob en app.module.ts
# Listar todos los entity files
find apps/backend/src/modules -name "*.entity.ts" | sort

# Comparar con los globs en app.module.ts
grep -n "entities:" apps/backend/src/app.module.ts -A 5

# Buscar comentarios FIX-BE que indican parches de datasource
grep -n "FIX-BE-" apps/backend/src/app.module.ts
```

### Ocurrencias

| Fecha | Controlador/Entity | Ruta Incorrecta | Estado |
|-------|---------------------|-----------------|--------|
| 2026-01-18 | StudentInterventionAlert | FIX-BE-007: Entity de teacher no estaba en datasource progress | Resuelto |
| 2026-01-18 | Profile, Classroom | FIX-BE-010: Cross-datasource relations en progress datasource | Resuelto |
| 2026-01-18 | Tenant | FIX-BE-011: Cascade Profile->Tenant en datasource progress | Resuelto |
| 2026-01-19 | Profile, Tenant | FIX-BE-012: Cross-datasource en content datasource | Resuelto |
| 2026-01-20 | School | FIX-BE-013: Cascade Classroom->School en progress datasource | Resuelto |
| 2026-01-28 | Profile, Tenant | FIX-BE-014: UserStats->Profile en auth datasource | Resuelto |
| 2026-01-28 | Module, Exercise | FIX-BE-015: ModuleProgress->Module en progress datasource | Resuelto |
| 2026-02-13 | Conversation entities | communication datasource creado para entities de comunicacion | Resuelto |

### Referencias

- **app.module.ts:** `apps/backend/src/app.module.ts` (10 datasources, lineas 62-330)
- **TypeORM Multiple Connections:** https://typeorm.io/multiple-connections
- **NestJS Database:** https://docs.nestjs.com/techniques/database
- **Schema Reference:** `docs/20-architecture/schema-reference/`
- **ERR-BE-005:** Modulo sin registrar (error relacionado)

---

**Severidad:** Critica (bloqueador de arranque)
**Frecuencia:** 5+ ocurrencias (la mas comun en el proyecto, evidenciada por 10+ comentarios FIX-BE en app.module.ts)
**Tiempo de resolucion:** 10-30 min (identificar datasource correcto + agregar path + validar cascadas)
**Ultimo update:** 2026-02-13
