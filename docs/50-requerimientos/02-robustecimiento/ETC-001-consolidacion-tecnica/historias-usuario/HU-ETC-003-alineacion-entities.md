# HU-ETC-003: Alineacion Entities-Tablas

**Historia de Usuario ID:** HU-ETC-003
**EPIC:** ETC-001 - Consolidacion Tecnica
**Sprint:** 2
**Story Points:** 5
**Estado:** Planificada

---

## Historia

**Como** arquitecto de datos
**Quiero** tener coherencia completa entre tablas DDL y entities TypeORM
**Para** garantizar la integridad del modelo de datos y facilitar el mantenimiento

---

## Contexto

La auditoria identifico gaps de coherencia entre la base de datos y el backend:

| Metrica | Valor Actual | Meta |
|---------|--------------|------|
| Tablas | 137 | - |
| Entities | 123 | 130+ |
| Cobertura | 89.8% | 95%+ |
| Gaps | 18 | <5 |

### Gaps Identificados

**Tablas sin Entity (requieren accion):**
1. `gamification_system.achievement_categories`
2. `social_features.user_activities`
3. `social_features.user_follows`

**Entities Huerfanas (sin tabla DDL):**
1. `ContentVersion`
2. `MediaAttachment`
3. `TeacherReport`

**Schema con baja cobertura:**
- `gamilit` - 0% (2 tablas de sistema)
- `social_features` - 53%

---

## Tareas

### TASK-001: Crear entity AchievementCategory
**Estimacion:** 1h

1. Revisar tabla `gamification_system.achievement_categories`
2. Crear entity en `modules/gamification/entities/achievement-category.entity.ts`
3. Definir relaciones con Achievement
4. Agregar al modulo
5. Verificar build

**Archivo a crear:**
```
apps/backend/src/modules/gamification/entities/achievement-category.entity.ts
```

### TASK-002: Crear entity UserActivity
**Estimacion:** 1h

1. Revisar tabla `social_features.user_activities`
2. Crear entity en `modules/social/entities/user-activity.entity.ts`
3. Definir relaciones
4. Agregar al modulo

### TASK-003: Crear entity UserFollow
**Estimacion:** 1h

1. Revisar tabla `social_features.user_follows`
2. Crear entity en `modules/social/entities/user-follow.entity.ts`
3. Definir relaciones (follower, following)
4. Agregar al modulo

### TASK-004: Resolver entities huerfanas
**Estimacion:** 2h

Para cada entity huerfana:
1. Verificar si existe tabla con nombre diferente
2. Si existe tabla: actualizar decorador @Entity()
3. Si no existe tabla: evaluar si crear tabla o eliminar entity
4. Documentar decision

**Entities a evaluar:**
- `ContentVersion` - Verificar en content_management schema
- `MediaAttachment` - Verificar en storage o educational_content
- `TeacherReport` - Verificar en progress_tracking o admin_dashboard

---

## Criterios de Aceptacion

- [ ] >= 95% entities alineadas con tablas
- [ ] 0 entities huerfanas sin justificacion
- [ ] Todas las entities nuevas con decoradores correctos
- [ ] Build exitoso
- [ ] DATABASE_INVENTORY.yml actualizado

---

## Definition of Done

- [ ] Entities creadas/actualizadas
- [ ] Decoradores @Entity() con schema y nombre de tabla
- [ ] Relaciones definidas correctamente
- [ ] `npm run build` exitoso
- [ ] DATABASE_INVENTORY.yml actualizado
- [ ] BACKEND_INVENTORY.yml actualizado
- [ ] ADR documentando decisiones sobre entities huerfanas

---

## Notas Tecnicas

### Patron de Entity

```typescript
@Entity({ schema: 'gamification_system', name: 'achievement_categories' })
export class AchievementCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relaciones
  @OneToMany(() => Achievement, (achievement) => achievement.category)
  achievements: Achievement[];

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

**Creado:** 2026-01-16
**Asignado:** NEXUS-DATABASE + NEXUS-BACKEND
