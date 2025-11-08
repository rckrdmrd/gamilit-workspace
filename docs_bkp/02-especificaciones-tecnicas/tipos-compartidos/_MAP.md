# _MAP: docs/02-especificaciones-tecnicas/tipos-compartidos/

**Última actualización:** 2025-11-07
**Propósito:** Definición de tipos, ENUMs e interfaces compartidos entre capas
**Audiencia:** Desarrolladores Backend/Frontend, Arquitectos
**Estado:** 🟢 Completo

---

## 📁 Contenido de esta Carpeta

### Documentos de Tipos Compartidos

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [TYPES-GAMIFICATION.md](./TYPES-GAMIFICATION.md) | Tipos de gamificación (achievements, ranks, coins) | ✅ Completo |
| [TYPES-NOTIFICATIONS.md](./TYPES-NOTIFICATIONS.md) | Tipos de notificaciones | ✅ Completo |

**Total documentos:** 2

---

## 🔗 Interdependencias

### Usado por

**Database:**
- ENUMs en `apps/database/ddl/00-prerequisites.sql`
- ENUMs en `apps/database/ddl/schemas/*/enums/`

**Backend:**
- ENUMs en `apps/backend/src/shared/enums/`
- Constants en `apps/backend/src/shared/constants/enums.constants.ts`

**Frontend:**
- Types en `apps/frontend/src/types/`
- Constants en `apps/frontend/src/shared/constants/enums.constants.ts`

---

## 📊 Métricas

- **Total documentos:** 2
- **ENUMs documentados:** 15+
- **Sincronización:** ✅ Script `sync-enums.ts` mantiene sincronía

---

## 🎯 Tipos Documentados

### TYPES-GAMIFICATION.md ⭐⭐⭐⭐⭐

**ENUMs cubiertos:**
- `maya_rank` (5 valores)
- `achievement_type` (4 valores)
- `achievement_category` (7 valores)
- `transaction_type` (14 valores)
- `comodin_type` (3 valores)

**Calidad:** Excelente - Incluye líneas exactas en DDL

### TYPES-NOTIFICATIONS.md ⭐⭐⭐⭐⭐

**ENUMs cubiertos:**
- `notification_priority` (3 valores: low, normal, urgent)

---

## 🚀 Próximos Pasos

### Planeado (Nuevos Tipos)
1. [ ] TYPES-EDUCATIONAL.md - Tipos de contenido educativo (mechanic_type, difficulty_level)
2. [ ] TYPES-AUTH.md - Tipos de autenticación (user_status, gamilit_role)
3. [ ] TYPES-PROGRESS.md - Tipos de progreso (exercise_status, module_status)
4. [ ] TYPES-SOCIAL.md - Tipos de características sociales (friendship_status, comment_type)

---

## 🔄 Sincronización de ENUMs

**Script de sincronización:**
```bash
npm run sync:enums
```

**Ubicación:** `apps/devops/scripts/sync-enums.ts`

**Proceso:**
1. Lee ENUMs de DDL (source of truth)
2. Genera constants para backend
3. Genera constants para frontend
4. Valida sincronización

**Validación:**
```bash
npm run validate:constants
```

---

## 📚 Guía de Navegación

**Si buscas...**
- **Tipos de gamificación:** Ver [TYPES-GAMIFICATION.md](./TYPES-GAMIFICATION.md)
- **Tipos de notificaciones:** Ver [TYPES-NOTIFICATIONS.md](./TYPES-NOTIFICATIONS.md)
- **DDL de ENUMs:** Ver `apps/database/ddl/00-prerequisites.sql`
- **Backend constants:** Ver `apps/backend/src/shared/constants/enums.constants.ts`
- **Frontend constants:** Ver `apps/frontend/src/shared/constants/enums.constants.ts`
