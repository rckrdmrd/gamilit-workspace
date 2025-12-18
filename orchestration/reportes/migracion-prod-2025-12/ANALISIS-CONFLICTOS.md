# ANÁLISIS DE CONFLICTOS - MIGRACIÓN GAMILIT

**Fecha:** 2025-12-18
**Versión:** 1.0.0
**Estado:** FASE 2 - ANÁLISIS COMPLETADO

---

## 1. RESUMEN DE CONFLICTOS

| Categoría | Cantidad | Resolución |
|-----------|----------|------------|
| **Archivos con conflicto potencial** | 43 | Usar versión ORIGEN |
| **Solo en ORIGEN (nuevos)** | 97 | Copiar a DESTINO |
| **Solo en ORIGEN (eliminados)** | 64 | Eliminar en DESTINO |
| **Solo en DESTINO** | ~108 | Evaluar/Descartar |

---

## 2. ARCHIVOS CON CONFLICTO (43)

Estos archivos están modificados en AMBOS repositorios.
**Resolución:** Usar versión del ORIGEN (workspace actual) como fuente de verdad.

### 2.1 Backend (7 archivos)
```
apps/backend/src/modules/gamification/entities/user-purchase.entity.ts
apps/backend/src/modules/gamification/services/shop.service.ts
apps/backend/src/modules/progress/services/exercise-attempt.service.ts
apps/backend/src/modules/teacher/controllers/manual-review.controller.ts
apps/backend/src/modules/teacher/teacher.module.ts
apps/backend/src/shared/constants/database.constants.ts
apps/backend/src/shared/constants/enums.constants.ts
```

### 2.2 Database (4 archivos)
```
apps/database/create-database.sh
apps/database/ddl/00-prerequisites.sql
apps/database/seeds/dev/educational_content/05-exercises-module4.sql
apps/database/seeds/prod/gamification_system/04-achievements.sql
```

### 2.3 Frontend (29 archivos)

#### App y Config
```
apps/frontend/src/App.tsx
apps/frontend/src/config/api.config.ts
```

#### Admin Portal
```
apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx
```

#### Student Portal
```
apps/frontend/src/apps/student/pages/ShopPage.tsx
```

#### Teacher Portal
```
apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx
apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx
apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherAnalyticsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherAssignmentsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherContentPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherGamificationPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherResourcesPage.tsx
```

#### Mechanics
```
apps/frontend/src/features/mechanics/module1/Crucigrama/CrucigramaExercise.tsx
apps/frontend/src/features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise.tsx
apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx
apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx
apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx
apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx
apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx
apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx
apps/frontend/src/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx
apps/frontend/src/features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx
```

#### Shared
```
apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx
apps/frontend/src/shared/hooks/useInvalidateDashboard.ts
```

### 2.4 Docs/Orchestration (3 archivos)
```
docs/README.md
orchestration/inventarios/BACKEND_INVENTORY.yml
orchestration/inventarios/DATABASE_INVENTORY.yml
orchestration/inventarios/FRONTEND_INVENTORY.yml
```

---

## 3. ARCHIVOS SOLO EN DESTINO

Estos archivos existen en el DESTINO pero NO están en la lista de cambios del ORIGEN.
**Acción:** Revisar si deben mantenerse o si son obsoletos.

### Archivos a evaluar en DESTINO:
```
apps/backend/.gitignore
apps/backend/package.json
apps/backend/src/modules/educational/educational.module.ts
apps/backend/src/modules/educational/entities/index.ts
apps/backend/src/modules/educational/services/exercises.service.ts
apps/backend/src/modules/gamification/controllers/index.ts
apps/backend/src/modules/gamification/dto/ml-coins/transaction-response.dto.ts
apps/backend/src/modules/gamification/entities/index.ts
apps/backend/src/modules/gamification/entities/maya-rank.entity.ts
apps/backend/src/modules/gamification/gamification.module.ts
apps/backend/src/modules/gamification/services/index.ts
apps/backend/src/modules/gamification/services/ml-coins.service.ts
apps/backend/src/modules/gamification/services/ranks.service.ts
apps/backend/src/modules/notifications/controllers/notification-devices.controller.ts
apps/backend/src/modules/notifications/notifications.module.ts
apps/backend/src/modules/notifications/services/notification-queue.service.ts
apps/backend/src/modules/notifications/services/notification.service.ts
apps/backend/src/modules/progress/entities/index.ts
apps/backend/src/modules/teacher/services/index.ts
apps/frontend/.env.example
apps/frontend/package.json
apps/frontend/src/apps/student/pages/DeviceManagementSection.tsx
apps/frontend/src/apps/teacher/pages/TeacherCommunicationPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx
apps/frontend/src/features/gamification/economy/types/economyTypes.ts
apps/frontend/src/features/gamification/ranks/store/ranksStore.ts
...
```

---

## 4. ESTRATEGIA DE RESOLUCIÓN

### 4.1 Principio General
- **ORIGEN = Fuente de Verdad**
- Todos los cambios del ORIGEN sobrescriben el DESTINO
- Los archivos eliminados en ORIGEN se eliminan en DESTINO
- Los archivos nuevos en ORIGEN se copian a DESTINO

### 4.2 Para archivos solo en DESTINO
**Opción recomendada:** Descartar cambios del DESTINO (hacer `git checkout .`)
**Razón:** El ORIGEN representa el estado final deseado

### 4.3 Orden de operaciones
1. **Backup del DESTINO** (git stash o copia)
2. **Sincronizar archivos modificados** (copiar de ORIGEN a DESTINO)
3. **Copiar archivos nuevos** (de ORIGEN a DESTINO)
4. **Eliminar archivos obsoletos** (los marcados como D en ORIGEN)
5. **Descartar cambios locales del DESTINO** (git checkout para archivos no sincronizados)
6. **Verificar integridad** (build, lint, tests)
7. **Commit y push**

---

## 5. COMANDOS DE SINCRONIZACIÓN

### 5.1 Backup del destino
```bash
cd /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit
git stash push -m "Backup antes de sincronización $(date +%Y-%m-%d)"
```

### 5.2 Sincronizar con rsync
```bash
# Copiar archivos modificados y nuevos
rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  /home/isem/workspace/projects/gamilit/ \
  /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/
```

### 5.3 Eliminar archivos obsoletos manualmente
```bash
# Archivos frontend module4 eliminados
rm -rf apps/frontend/src/features/mechanics/module4/ChatLiterario/
rm -rf apps/frontend/src/features/mechanics/module4/EmailFormal/
rm -rf apps/frontend/src/features/mechanics/module4/EnsayoArgumentativo/
rm -rf apps/frontend/src/features/mechanics/module4/ResenaCritica/

# DTOs backend eliminados
rm -f apps/backend/src/modules/educational/dto/module5/diario-reflexivo-answer.dto.ts
rm -f apps/backend/src/modules/educational/dto/module5/podcast-answer.dto.ts

# Seeds eliminados
rm -f apps/database/seeds/prod/auth_management/05-profiles-demo.sql
```

---

## 6. VALIDACIÓN POST-SINCRONIZACIÓN

### 6.1 Verificar estructura
```bash
ls -la apps/backend/src/modules/
ls -la apps/frontend/src/features/mechanics/module4/
ls -la apps/frontend/src/features/mechanics/module5/
ls -la apps/database/seeds/prod/
```

### 6.2 Verificar builds
```bash
cd apps/backend && npm run build
cd apps/frontend && npm run build
```

### 6.3 Verificar imports (TypeScript)
```bash
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

---

## 7. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de cambios en destino | Alta | Medio | Backup con git stash |
| Imports rotos | Media | Alto | Verificar TypeScript |
| Seeds desincronizados | Media | Alto | Verificar orden de seeds |
| Dependencias faltantes | Baja | Alto | Revisar package.json |

---

## 8. SIGUIENTE PASO

Proceder con la **FASE 3: Planeación de Implementación** que incluirá:
1. Script automatizado de sincronización
2. Checklist de validación
3. Plan de rollback

---

**Generado por:** Requirements-Analyst Agent
**Fecha:** 2025-12-18
