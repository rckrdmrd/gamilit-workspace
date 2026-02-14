# ERR-FE-006: React Query Cache Key Collision

## Descripcion
Cuando dos queries diferentes de React Query usan la misma cache key (o keys que se solapan), los datos de una query sobrescriben los de la otra, causando que componentes muestren datos incorrectos o stale. Con 662 llamadas API distribuidas en 91 archivos, las colisiones de cache keys son un riesgo real sin una convencion estricta.

## Sintomas
- Un componente muestra datos que pertenecen a otra seccion de la aplicacion
- Despues de una mutacion con `invalidateQueries`, datos no relacionados desaparecen o se refrescan innecesariamente
- Datos stale que no se actualizan aunque el servidor tenga datos nuevos
- Cambiar de pagina y volver muestra datos de la pagina anterior (cache key compartida)
- Estado inconsistente entre componentes que deberian mostrar datos independientes

## Causa Raiz
1. Cache keys construidas manualmente como strings simples sin namespacing (ej: `['users']` usado en dos contextos diferentes)
2. Falta de convencion para incluir parametros discriminadores en las keys (tenant_id, classroom_id, etc.)
3. Keys demasiado genericas que matchean queries no relacionadas durante invalidacion
4. Copy-paste de hooks sin actualizar las cache keys

## Solucion

### 1. Identificar keys con potencial colision
```bash
cd apps/frontend

# Buscar todos los queryKey patterns
grep -rn "queryKey\|useQuery\[" src/ --include="*.ts" --include="*.tsx" | \
  grep -oE "\[['\"]\w+['\"]" | sort | uniq -c | sort -rn | head -20
```

### 2. Implementar patron de Key Factory
```typescript
// src/config/query-keys.ts
// Patron recomendado: key factory centralizado por dominio

export const queryKeys = {
  // Cada dominio tiene su namespace
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (classroomId: string) => [...queryKeys.students.lists(), { classroomId }] as const,
    detail: (id: string) => [...queryKeys.students.all, 'detail', id] as const,
    progress: (id: string) => [...queryKeys.students.all, 'progress', id] as const,
  },

  modules: {
    all: ['modules'] as const,
    list: (tenantId: string) => [...queryKeys.modules.all, 'list', { tenantId }] as const,
    detail: (id: string) => [...queryKeys.modules.all, 'detail', id] as const,
    exercises: (moduleId: string) => [...queryKeys.modules.all, 'exercises', moduleId] as const,
  },

  gamification: {
    all: ['gamification'] as const,
    xp: (userId: string) => [...queryKeys.gamification.all, 'xp', userId] as const,
    achievements: (userId: string) => [...queryKeys.gamification.all, 'achievements', userId] as const,
    leaderboard: (classroomId: string) => [...queryKeys.gamification.all, 'leaderboard', classroomId] as const,
  },
};
```

### 3. Corregir queries con keys problematicas
```typescript
// INCORRECTO: key generica que puede colisionar
const { data } = useQuery({
  queryKey: ['students'],
  queryFn: () => fetchStudentsByClassroom(classroomId),
});

// CORRECTO: key especifica con parametros
const { data } = useQuery({
  queryKey: queryKeys.students.list(classroomId),
  queryFn: () => fetchStudentsByClassroom(classroomId),
});
```

### 4. Corregir invalidaciones demasiado amplias
```typescript
// INCORRECTO: invalida TODAS las queries de students
queryClient.invalidateQueries({ queryKey: ['students'] });

// CORRECTO: invalida solo la lista de un aula especifica
queryClient.invalidateQueries({
  queryKey: queryKeys.students.list(classroomId),
});

// CORRECTO: invalida todas las listas (pero no detalles)
queryClient.invalidateQueries({
  queryKey: queryKeys.students.lists(),
});
```

### 5. Incluir tenant_id en keys multi-tenant
```typescript
// En una aplicacion multi-tenant, el tenant_id DEBE ser parte de la key
// para evitar mostrar datos de un tenant cuando se cambia a otro

const { data } = useQuery({
  queryKey: ['modules', 'list', { tenantId: currentTenantId }],
  queryFn: () => fetchModules(currentTenantId),
});
```

## Prevencion

1. **Key Factory centralizado**: Usar archivo `query-keys.ts` como unico punto de definicion de cache keys
2. **Naming convention**: Keys siguen estructura `[dominio, accion, ...params]`
3. **Incluir parametros discriminadores**: tenant_id, classroom_id, user_id segun contexto
4. **Code review**: Verificar que nuevas queries usen keys del factory, no strings ad-hoc
5. **TypeScript const assertions**: Usar `as const` en key factory para type safety

### Checklist al crear nuevo hook con useQuery:
- [ ] Cache key definida en `query-keys.ts` (key factory)
- [ ] Key incluye todos los parametros que afectan los datos retornados
- [ ] Key incluye tenant_id si los datos son tenant-specific
- [ ] Invalidaciones usan keys del factory (no strings manuales)
- [ ] No hay otra query con key identica o que solape
- [ ] Verificar con React Query DevTools que la key es unica

### Verificacion automatica
```bash
# Buscar queries con keys hardcodeadas (no usando key factory)
cd apps/frontend
grep -rn "queryKey:" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "queryKeys\." | \
  grep "\['" | \
  head -20

# Buscar keys duplicadas en key factory
grep -c "as const" src/config/query-keys.ts
```

## Ocurrencias

| Fecha | Key Colisionada | Componentes Afectados | Efecto | Estado |
|-------|-----------------|----------------------|--------|--------|
| 2026-01-25 | ['students'] | StudentList, ClassroomStudents | Datos de aula incorrecta | Resuelto |
| 2026-01-15 | ['modules'] | ModuleList, TeacherModules | Cache compartida entre portales | Resuelto |
| 2026-01-08 | ['achievements'] | StudentAchievements, AdminAchievements | Logros de otro usuario | Resuelto |

## Referencias

- **React Query Docs:** https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
- **Key Factory Pattern:** https://tkdodo.eu/blog/effective-react-query-keys
- **API Services:** `apps/frontend/src/services/api/`
- **Hooks:** `apps/frontend/src/hooks/`
- **Inventario Frontend:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`

---

**Severidad:** Media
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 15-30 min
**Ultimo update:** 2026-02-13
