---
titulo: Error INT-004 Relación Entity Cross-Datasource sin Include
tipo: guia
dominio: integracion
ultima_actualizacion: 2026-02-27
---

# ERR-INT-004: Relacion Entity Cross-Datasource sin Include

## Descripcion
Cuando una entidad en un datasource tiene una relacion TypeORM (`@ManyToOne`, `@OneToMany`, `@OneToOne`) hacia una entidad que solo esta registrada en otro datasource, TypeORM falla porque no puede encontrar la metadata de la entidad relacionada. Este es uno de los errores mas frecuentes en gamilit, con 8+ FIX-BE-* entries documentados directamente en `app.module.ts`.

## Sintomas
- Error: `No metadata for "Profile" was found` al cargar una entidad con relacion eager
- Error: `EntityMetadataNotFoundError: No metadata for "User" was found`
- Queries con `relations: ['user']` fallan aunque la FK existe en la base de datos
- El modulo funciona para queries simples pero falla al incluir relaciones
- Error solo aparece cuando se usa `leftJoinAndSelect`, `relations`, o `eager: true`
- Build compila exitosamente; el error es puramente de runtime

## Causa Raiz
1. TypeORM requiere que TODAS las entidades involucradas en una relacion esten registradas en el MISMO datasource
2. Entidad A esta en `educationalDataSource` y tiene `@ManyToOne(() => User)`, pero User solo esta en `defaultDataSource`
3. Esto es una limitacion de TypeORM con multiples datasources: no puede resolver relaciones cross-datasource
4. La solucion historica en gamilit ha sido duplicar los entity paths en multiples datasources (ver comentarios `FIX-BE-*` en `app.module.ts`)

## Solucion

### 1. Identificar la relacion cross-datasource
```bash
cd apps/backend

# Buscar entidades que importan de otros modulos (posible cross-datasource)
grep -rn "import.*from.*modules/" src/modules/educational/entities/ --include="*.ts" | \
  grep -v "educational"
```

### 2. Verificar en que datasources estan las entidades
```bash
# Ver donde estan registradas las entidades involucradas
grep -n "entities:" src/app.module.ts | head -20

# Buscar si la entidad relacionada ya esta duplicada
grep -n "Profile\|User\|Tenant\|School\|Module" src/app.module.ts | head -30
```

### 3. Agregar la entidad relacionada al datasource que la necesita
```typescript
// En app.module.ts, agregar el path de la entidad relacionada al datasource
// que tiene la entidad con la relacion

// Ejemplo: educational.StudentProgress tiene @ManyToOne(() => User)
// User esta en defaultDataSource, StudentProgress en educationalDataSource
// → Agregar User al educationalDataSource

TypeOrmModule.forRoot({
  name: 'educationalDataSource',
  entities: [
    __dirname + '/modules/educational/entities/*.entity{.ts,.js}',
    // FIX-BE-010: User necesario para relaciones en StudentProgress
    __dirname + '/modules/auth/entities/user.entity{.ts,.js}',
    // FIX-BE-011: Profile necesario para relaciones en StudentEnrollment
    __dirname + '/modules/users/entities/profile.entity{.ts,.js}',
    // FIX-BE-012: Tenant necesario para RLS en todas las entidades
    __dirname + '/modules/tenants/entities/tenant.entity{.ts,.js}',
  ],
}),
```

### 4. Documentar el FIX con comentario estandar
```typescript
// Convencion de comentarios FIX-BE-* en app.module.ts:
// FIX-BE-{NNN}: {EntityDuplicada} requerida por {EntityQueUsaRelacion} en {datasource}

// Ejemplo:
// FIX-BE-010: User entity duplicated in educationalDataSource for StudentProgress relations
__dirname + '/modules/auth/entities/user.entity{.ts,.js}',
```

### 5. Verificar que las relaciones funcionan
```typescript
// Test de verificacion en el servicio:
const student = await this.studentRepo.findOne({
  where: { id: studentId },
  relations: ['user', 'tenant', 'classroom'],  // Todas las relaciones cross-datasource
});
// Si esto no lanza error, la configuracion es correcta
```

### 6. Build y test
```bash
cd apps/backend && npm run build && npm run test
```

## Prevencion

1. **Entidades comunes pre-incluidas**: User, Profile, Tenant, School, Module, Exercise deben estar en TODOS los datasources que los referencien
2. **Comentarios FIX-BE-***: Documentar cada duplicacion con numero secuencial y razon
3. **Checklist de relacion nueva**: Al agregar `@ManyToOne`/`@OneToMany`, verificar que la entidad target esta en el mismo datasource
4. **Mapa de dependencias**: Mantener documentado que entidades necesitan estar en que datasources

### Entidades frecuentemente duplicadas (referencia):
```
User        → Requerida en: educational, gamification, progress, social, analytics
Profile     → Requerida en: educational, social
Tenant      → Requerida en: TODOS los datasources (multi-tenancy)
School      → Requerida en: educational, analytics
Module      → Requerida en: educational, progress, gamification
Exercise    → Requerida en: educational, progress
```

### Checklist al agregar relacion TypeORM:
- [ ] Entidad target esta registrada en el MISMO datasource que la entidad source
- [ ] Si no esta, agregar path de entidad target al datasource con comentario `FIX-BE-*`
- [ ] Verificar relaciones inversas (si Entity B ahora esta en datasource de A, verificar que A esta en datasource de B si hay relacion inversa)
- [ ] Probar con `findOne({ relations: ['relacion'] })` en runtime
- [ ] `npm run build` + `npm run test` exitosos
- [ ] Documentar en `app.module.ts` con comentario FIX-BE-*

### Verificacion automatica
```bash
cd apps/backend

# Buscar relaciones en entidades y verificar que los targets estan en el mismo datasource
grep -rn "@ManyToOne\|@OneToMany\|@OneToOne\|@ManyToMany" src/modules/*/entities/*.ts | \
  grep -oP "(?<=\(\) => )\w+" | sort | uniq -c | sort -rn
# Las entidades con mas referencias son las que mas probablemente necesiten duplicacion
```

## Ocurrencias

| Fecha | FIX ID | Entity Duplicada | Datasource Destino | Relacion Rota | Estado |
|-------|--------|------------------|--------------------|----|--------|
| 2026-01-28 | FIX-BE-010 | User | educationalDataSource | StudentProgress.user | Resuelto |
| 2026-01-28 | FIX-BE-011 | Profile | educationalDataSource | StudentEnrollment.profile | Resuelto |
| 2026-01-25 | FIX-BE-012 | Tenant | gamificationDataSource | XpTransaction.tenant | Resuelto |
| 2026-01-25 | FIX-BE-013 | School | educationalDataSource | Classroom.school | Resuelto |
| 2026-01-20 | FIX-BE-014 | Module | progressDataSource | ModuleProgress.module | Resuelto |
| 2026-01-20 | FIX-BE-015 | Exercise | progressDataSource | ExerciseAttempt.exercise | Resuelto |
| 2026-01-15 | FIX-BE-016 | User | gamificationDataSource | Achievement.user | Resuelto |
| 2026-01-10 | FIX-BE-017 | User | socialDataSource | TeamMember.user | Resuelto |

## Referencias

- **app.module.ts:** `apps/backend/src/app.module.ts` (ver comentarios FIX-BE-*)
- **TypeORM Multiple Datasources:** https://typeorm.io/multiple-data-sources
- **Inventario Backend:** `orchestration/inventarios/BACKEND_INVENTORY.yml`
- **ERR-INT-003:** Modulo sin datasource (error relacionado)
- **ERR-INT-001:** DB-Backend desalineado (error complementario)

---

**Severidad:** Critica
**Frecuencia:** 8+ ocurrencias
**Tiempo de resolucion:** 10-20 min
**Ultimo update:** 2026-02-13
