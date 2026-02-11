# Guía: TypeORM Cross-Datasource en Gamilit

**Versión:** 1.0.0
**Fecha:** 2026-01-28
**Autor:** Claude Opus 4.5

---

## 1. Contexto

Gamilit utiliza **10 datasources TypeORM** independientes, cada uno conectado a un schema PostgreSQL diferente dentro de la misma base de datos `gamilit_platform`.

```
gamilit_platform/
├── auth_management         ← datasource: 'auth'
├── educational_content     ← datasource: 'educational'
├── gamification_system     ← datasource: 'gamification'
├── progress_tracking       ← datasource: 'progress'
├── social_features         ← datasource: 'social'
├── content_management      ← datasource: 'content'
├── audit_logging           ← datasource: 'audit'
├── notifications           ← datasource: 'notifications'
├── communication           ← datasource: 'communication'
└── admin_dashboard         ← datasource: 'admin_dashboard'
```

---

## 2. El Problema: Relaciones Cross-Datasource

### Síntoma

Al ejecutar `npm run dev`, aparece el error:

```
TypeORMError: Entity metadata for EntityA#fieldB was not found.
Check if you specified a correct entity object and if it's connected
in the connection options.
```

### Causa

Cuando una entidad en un datasource tiene una relación (`@ManyToOne`, `@OneToOne`, `@OneToMany`) con una entidad de **otro datasource**, TypeORM necesita conocer ambas entidades en el datasource que las usa.

### Ejemplo

```typescript
// progress/entities/module-progress.entity.ts
@Entity({ schema: 'progress_tracking' })
export class ModuleProgress {
  @ManyToOne(() => Profile)  // Profile está en 'auth' datasource
  @JoinColumn({ name: 'user_id' })
  user!: Profile;

  @ManyToOne(() => Module)   // Module está en 'educational' datasource
  @JoinColumn({ name: 'module_id' })
  module!: Module;
}
```

Si `Module` y `Profile` no están registradas en el datasource `'progress'`, TypeORM falla.

---

## 3. La Solución: Registrar Entidades Cross-Datasource

### En `app.module.ts`

Agregar las entidades referenciadas al datasource que las usa:

```typescript
// Datasource 'progress'
TypeOrmModule.forRootAsync({
  name: 'progress',
  useFactory: (configService: ConfigService) => ({
    // ...config
    entities: [
      // Entidades propias del datasource
      __dirname + '/modules/progress/entities/**/*.entity{.ts,.js}',

      // Cross-datasource: Entidades de 'auth' referenciadas
      __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
      __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',  // Cascada

      // Cross-datasource: Entidades de 'educational' referenciadas
      __dirname + '/modules/educational/entities/module.entity{.ts,.js}',
      __dirname + '/modules/educational/entities/exercise.entity{.ts,.js}',  // Cascada
    ],
  }),
}),
```

### Patrón de Comentarios

Usar el formato estándar para documentar los fixes:

```typescript
// FIX-BE-XXX-YYYY-MM-DD: Required for EntityA @RelationType -> EntityB relation
__dirname + '/modules/xxx/entities/entity-b.entity{.ts,.js}',
```

---

## 4. Cascada de Dependencias

### El Problema de la Cascada

Cuando agregas una entidad cross-datasource, también debes agregar sus dependencias:

```
Profile (auth)
  └─ @ManyToOne → Tenant (auth)     ← También necesita Tenant

Module (educational)
  └─ @OneToMany → Exercise (educational)  ← También necesita Exercise
```

### Diagrama de Cascadas Comunes

```
auth (núcleo compartido)
├── Profile ────┬───────────────────────────────────────────┐
│               │                                           │
└── Tenant ─────┴──► Usado por: gamification, progress,    │
                     social, admin_dashboard                │
                                                            │
educational                                                 │
├── Module ──────► Usado por: progress                     │
└── Exercise ────► Cascada de Module                       │
                                                            │
social                                                      │
├── Classroom ───► Usado por: progress                     │
└── School ──────► Cascada de Classroom                    │
```

---

## 5. Checklist: Agregar Nueva Relación Cross-Datasource

Cuando crees una nueva entidad con relación a otro datasource:

1. **Identifica el datasource destino** de la entidad referenciada
2. **Verifica si ya está registrada** en tu datasource origen
3. **Si NO está registrada:**
   - Agrega el path de la entidad en `app.module.ts`
   - Agrega un comentario con el formato `FIX-BE-XXX`
4. **Verifica cascadas:**
   - ¿La entidad agregada tiene `@ManyToOne` a otra entidad?
   - Si sí, agrega también esa entidad
5. **Ejecuta `npm run dev`** para validar

---

## 6. Alternativa: Relaciones Comentadas

En algunos casos, la relación se comenta y se maneja manualmente:

```typescript
@Entity({ schema: 'educational_content' })
export class Assignment {
  @Column({ type: 'uuid' })
  creator_id!: string;

  // COMENTADA: Cross-datasource - Profile está en 'auth'
  // La integridad se valida manualmente en AssignmentService
  // @ManyToOne(() => Profile)
  // @JoinColumn({ name: 'creator_id' })
  // creator!: Profile;
}
```

### Cuándo Usar Esta Alternativa

- Cuando la cascada de dependencias sería muy grande
- Cuando no necesitas eager loading de la relación
- Cuando prefieres queries manuales para control fino

### Implicaciones

- ❌ No hay cascade automático (ON DELETE, ON UPDATE)
- ❌ No puedes usar `relations: ['creator']` en find()
- ✅ Menor complejidad en configuración de datasources
- ✅ Queries más explícitas y predecibles

---

## 7. Fixes Aplicados (Historial)

| Fix ID | Fecha | Datasource | Entidad Agregada | Razón |
|--------|-------|------------|------------------|-------|
| FIX-BE-010 | 2026-01-18 | progress | Profile | StudentInterventionAlert |
| FIX-BE-011 | 2026-01-18 | progress | Tenant | Cascada Profile |
| FIX-BE-012 | 2026-01-19 | social | Profile, Tenant | Classroom relations |
| FIX-BE-013 | 2026-01-20 | progress | School | Cascada Classroom |
| FIX-BE-014 | 2026-01-28 | gamification | Profile | UserStats @OneToOne |
| FIX-BE-014b | 2026-01-28 | gamification | Tenant | Cascada Profile |
| FIX-BE-015 | 2026-01-28 | progress | Module | ModuleProgress @ManyToOne |
| FIX-BE-015b | 2026-01-28 | progress | Exercise | Cascada Module |

---

## 8. Referencia Rápida

### Datasources y Sus Dependencias Cross-Schema

```yaml
gamification:
  propias: gamification/entities/*, notifications/entities/notification
  cross: auth/profile, auth/tenant

progress:
  propias: progress/entities/*, teacher/student-intervention-alert
  cross: auth/profile, auth/tenant, social/classroom, social/school,
         educational/module, educational/exercise

social:
  propias: social/entities/*, assignments/entities/*, teacher/teacher-report
  cross: auth/profile, auth/tenant

admin_dashboard:
  propias: admin/admin-report
  cross: auth/user, auth/role
```

---

## 9. Troubleshooting

### Error: "Entity metadata for X#Y was not found"

1. Identifica X (entidad) e Y (campo con relación)
2. Busca la entidad referenciada en Y
3. Verifica en qué datasource está
4. Agrégala al datasource de X en `app.module.ts`
5. Verifica cascadas

### Error persiste después de agregar

- Verifica el path exacto del archivo `.entity.ts`
- Asegúrate de que la extensión es `{.ts,.js}`
- Revisa si la entidad tiene más `@ManyToOne` que necesiten cascada
- Ejecuta `npm run build` para verificar compilación

---

*Documento generado como parte de TASK-008-ANALISIS-ERRORES-BACKEND-GAMILIT*
*Sistema SIMCO v4.3.0 - GAMILIT*
