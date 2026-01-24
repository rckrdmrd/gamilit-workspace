# FASE 1: ANÁLISIS DETALLADO DE DIFERENCIAS

**Fecha:** 2025-12-18
**Perfil:** Requirements-Analyst
**Proyecto:** GAMILIT

---

## DEFINICIONES

| Variable | Ruta | Descripción |
|----------|------|-------------|
| **ORIGEN** | `/home/isem/workspace/projects/gamilit` | Proyecto actualizado (fuente de verdad) |
| **DESTINO** | `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit` | Proyecto a sincronizar |

---

## RESUMEN EJECUTIVO

| Categoría | Cantidad |
|-----------|----------|
| Archivos solo en ORIGEN (nuevos) | 22+ |
| Archivos solo en DESTINO (obsoletos) | 47+ |
| Archivos con diferencias | 23+ |
| Áreas principales afectadas | 5 |

---

## 1. ARCHIVOS SOLO EN ORIGEN (A COPIAR AL DESTINO)

### 1.1 Scripts de Deployment (CRÍTICOS)
```
scripts/
├── setup-ssl-certbot.sh       # NUEVO: Configuración SSL
└── validate-deployment.sh     # NUEVO: Validación de deployment
```

### 1.2 Database - Scripts Nuevos
```
apps/database/scripts/
├── validations/                        # NUEVO directorio
│   ├── README.md
│   ├── VALIDACIONES-RAPIDAS-POST-RECREACION.sql
│   └── validate-gap-fixes.sql
│   └── validate-generate-alerts-joins.sql
└── testing/
    └── CREAR-USUARIOS-TESTING.sql      # Actualizado
```

### 1.3 Frontend - Páginas Nuevas (Student Portal)
```
apps/frontend/src/apps/student/pages/
├── GamificationPage.tsx               # NUEVO
├── GamificationTestPage.tsx           # NUEVO
├── LoginPage.tsx                       # NUEVO
├── NewLeaderboardPage.tsx              # NUEVO
├── PasswordRecoveryPage.tsx            # NUEVO
├── ProfilePage.tsx                     # NUEVO
├── RegisterPage.tsx                    # NUEVO
├── TwoFactorAuthPage.tsx               # NUEVO
└── admin/                              # NUEVO directorio
```

### 1.4 Documentación Nueva
```
docs/90-transversal/arquitectura/
└── especificaciones/                   # NUEVO directorio

docs/90-transversal/inventarios-database/inventarios/
└── 04-FUNCTIONS-INVENTORY.md           # NUEVO

docs/90-transversal/migraciones/        # NUEVO directorio

docs/95-guias-desarrollo/
├── GUIA-DEPLOYMENT-RAPIDO.md           # NUEVO
└── GUIA-SSL-CERTBOT-DEPLOYMENT.md      # NUEVO

docs/database/functions/                # NUEVO directorio

docs/frontend/
├── admin/                              # NUEVO directorio
├── guides/                             # NUEVO directorio
└── teacher/                            # NUEVO directorio
```

### 1.5 Orchestration - Análisis y Reportes
```
orchestration/
├── analisis-backend-2025-12-18/        # NUEVO directorio
├── analisis-frontend-validacion/       # NUEVO directorio
├── analisis-homologacion-database-2025-12-18/  # NUEVO
└── reportes/
    ├── FASE1-ANALISIS-CAMBIOS-CODIGO-VS-DOCS.md
    ├── FASE1-ANALISIS-DIFERENCIAS-DOCS.md
    ├── FASE2-ANALISIS-COMPLETO-CONSOLIDADO.md
    ├── FASE3-PLAN-IMPLEMENTACION-DOCUMENTACION.md
    ├── FASE4-VALIDACION-PLAN-IMPLEMENTACION.md
    ├── FASE5-REPORTE-FINAL-DOCUMENTACION.md
    ├── REPORTE-ANALISIS-PRODUCCION-COMPLETO-2025-12-18.md
    ├── REPORTE-HOMOLOGACION-DATABASE-2025-12-18.md
    └── REPORTE-HOMOLOGACION-DOCS-DESARROLLO-2025-12-18.md
```

---

## 2. ARCHIVOS SOLO EN DESTINO (A ELIMINAR/DEPRECAR)

### 2.1 Raíz del Proyecto
```
./CODEOWNERS                           # Movido a .github/CODEOWNERS
```

### 2.2 Backend - Configuración Obsoleta
```
apps/backend/.eslintrc.js              # Reemplazado por eslint.config.js
```

### 2.3 Database - Archivos Obsoletos (LIMPIEZA)
```
apps/database/
├── .env.database                      # Credenciales obsoletas
├── .env.dev                           # Credenciales obsoletas
├── CHANGELOG-PERFECT-SCORES.md        # Histórico no necesario
├── DATABASE-RECREATION-SUCCESS-2025-11-24.txt  # Log temporal
├── INDEX-RECREACION-BD-2025-11-24.md  # Histórico
├── README-RECREACION-2025-11-24.md    # Histórico
├── RESUMEN-EJECUTIVO-RECREACION-BD.md # Histórico
├── TEACHER-REPORTS-VISUAL-SCHEMA.txt  # Temporal
├── VISUAL-DIFF-INITIALIZE-MISSIONS-2025-11-24.md  # Temporal
├── analyze-image-complete.py          # Script temporal Python
├── complete-crossword-design.py       # Script temporal Python
├── create-database-*.log              # Logs (6 archivos)
├── crossword-final-correct.py         # Script temporal Python
├── crossword-from-image-final.py      # Script temporal Python
├── database-credentials-dev.txt       # SEGURIDAD: Credenciales en texto
├── exact-coordinates-layout.py        # Script temporal Python
├── final-correct-layout.py            # Script temporal Python
├── map-exact-from-image.py            # Script temporal Python
├── map-image-exact-v2.py              # Script temporal Python
├── migrations/                         # Directorio obsoleto
│   └── add-ml-coins-multiplier-to-maya-ranks.sql
├── sync-prod-dev.py                   # Script temporal Python
├── validate-final-from-db.py          # Script temporal Python
└── verify-unification.py              # Script temporal Python
```

### 2.4 Database Scripts - Obsoletos
```
apps/database/scripts/
├── README-SETUP.md                    # Reemplazado por QUICK-START.md
├── README-VALIDATION-SCRIPTS.md       # Movido a validations/README.md
├── VALIDACION-RAPIDA-RECREACION-2025-11-24.sql  # Temporal
├── VALIDACIONES-RAPIDAS-POST-RECREACION.sql    # Movido a validations/
├── apply-maya-ranks-v2.1.sql          # Temporal
├── validate-gap-fixes.sql             # Movido a validations/
├── validate-generate-alerts-joins.sql # Movido a validations/
├── validate-missions-objectives-structure.sql  # Temporal
├── validate-seeds-integrity.sql       # Temporal
├── validate-update-user-rank-fix.sql  # Temporal
├── validate-user-initialization.sql   # Temporal
├── validate_integrity.py              # Script temporal Python
├── backup/                             # Directorio vacío
├── deprecated/                         # Scripts antiguos
│   ├── init-database-v1.sh
│   ├── init-database-v2.sh
│   └── init-database.sh.backup-20251102-235826
├── restore/                            # Directorio vacío
└── utilities/                          # Directorio vacío
```

### 2.5 Frontend - Archivos Obsoletos
```
apps/frontend/.eslintrc.cjs            # Config antigua

apps/frontend/src/features/mechanics/auxiliar/CallToAction/
├── callToActionMockData.ts            # Mock data no necesaria
├── callToActionSchemas.ts             # Schema obsoleto
└── callToActionTypes.ts               # Types obsoletos
```

---

## 3. ARCHIVOS CON DIFERENCIAS (A ACTUALIZAR)

### 3.1 CRÍTICOS - Backend Services
| Archivo | Impacto | Descripción |
|---------|---------|-------------|
| `apps/backend/src/modules/auth/services/email-verification.service.ts` | ALTO | Servicio verificación email |
| `apps/backend/src/modules/auth/services/password-recovery.service.ts` | ALTO | Servicio recuperación contraseña |
| `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | ALTO | Servicio envío ejercicios |

### 3.2 CRÍTICOS - Frontend
| Archivo | Impacto | Descripción |
|---------|---------|-------------|
| `apps/frontend/package.json` | ALTO | Dependencias frontend |
| `apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx` | ALTO | Evaluador de rúbricas |
| `apps/frontend/src/apps/teacher/components/grading/index.ts` | MEDIO | Exports grading |
| `apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx` | ALTO | Modal respuestas |
| `apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts` | ALTO | Hook tiempo real |
| `apps/frontend/src/apps/teacher/hooks/useMasteryTracking.ts` | ALTO | Hook tracking dominio |
| `apps/frontend/src/apps/teacher/hooks/useMissionStats.ts` | MEDIO | Hook estadísticas |
| `apps/frontend/src/features/mechanics/module1/Emparejamiento/EmparejamientoExerciseDragDrop.tsx` | ALTO | Mecánica emparejamiento |
| `apps/frontend/src/services/api/missionsAPI.ts` | ALTO | API misiones |
| `apps/frontend/src/services/api/passwordAPI.ts` | ALTO | API contraseñas |
| `apps/frontend/src/services/api/profileAPI.ts` | ALTO | API perfiles |
| `apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx` | ALTO | Renderizador ejercicios |

### 3.3 Configuración y Scripts
| Archivo | Impacto | Descripción |
|---------|---------|-------------|
| `scripts/README.md` | BAJO | Documentación scripts |
| `apps/database/scripts/QUICK-START.md` | BAJO | Guía rápida |
| `package-lock.json` | MEDIO | Lock de dependencias |

### 3.4 Datos y Backups (NO SINCRONIZAR)
```
# Estos archivos difieren pero NO deben sincronizarse (datos de producción)
apps/database/backup-prod/RESTORE_USUARIOS_PRODUCCION_2025-12-18.sql
apps/database/backup-prod/auth_users_2025-12-18.csv
apps/database/backup-prod/profiles_2025-12-18.csv
apps/database/backup-prod/usuarios_produccion_2025-12-18.sql
```

---

## 4. DEPENDENCIAS IDENTIFICADAS

### 4.1 Cadenas de Dependencia Backend
```
email-verification.service.ts
  └── Depende de: auth.module.ts (ya sincronizado)
  └── Usado por: auth.controller.ts

password-recovery.service.ts
  └── Depende de: auth.module.ts
  └── Usado por: auth.controller.ts

exercise-submission.service.ts
  └── Depende de: progress.module.ts
  └── Usado por: progress.controller.ts
```

### 4.2 Cadenas de Dependencia Frontend
```
Teacher Portal Components
├── RubricEvaluator.tsx
│   └── Importado en: index.ts (grading)
│   └── Usado en: ResponseDetailModal.tsx
├── ResponseDetailModal.tsx
│   └── Depende de: RubricEvaluator
│   └── Usado en: páginas de teacher
└── Hooks
    ├── useClassroomRealtime.ts
    ├── useMasteryTracking.ts
    └── useMissionStats.ts
    └── Usados en: páginas de teacher

Services API
├── missionsAPI.ts
├── passwordAPI.ts
└── profileAPI.ts
└── Usados en: múltiples páginas student/teacher
```

### 4.3 Nuevas Páginas Student (Verificar Router)
```
Las nuevas páginas requieren verificar:
- src/apps/student/routes/index.tsx o App.tsx
- Configuración de rutas existentes
```

---

## 5. CATEGORIZACIÓN POR PRIORIDAD

### P0 - CRÍTICO (Seguridad/Funcionalidad Core)
1. `email-verification.service.ts`
2. `password-recovery.service.ts`
3. `exercise-submission.service.ts`
4. Frontend API services (password, profile, missions)
5. Eliminar `database-credentials-dev.txt` del DESTINO

### P1 - ALTO (Funcionalidad)
1. Teacher portal components (grading, responses)
2. Teacher hooks (realtime, mastery, missions)
3. EmparejamientoExerciseDragDrop.tsx
4. ExerciseContentRenderer.tsx
5. Scripts de deployment nuevos

### P2 - MEDIO (Mejoras)
1. Nuevas páginas student portal
2. Documentación nueva
3. Orchestration reportes

### P3 - BAJO (Limpieza)
1. Eliminar archivos obsoletos de DESTINO
2. Eliminar scripts temporales Python
3. Eliminar logs de creación de base de datos
4. Eliminar directorios vacíos

---

## 6. RIESGOS IDENTIFICADOS

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Credenciales en texto plano en DESTINO | CRÍTICO | Eliminar `database-credentials-dev.txt` inmediatamente |
| Archivos .env expuestos | ALTO | Verificar .gitignore incluye estos archivos |
| Pérdida de scripts de validación | MEDIO | Scripts movidos a `validations/`, no perdidos |
| Dependencias frontend desactualizadas | MEDIO | Sincronizar package.json y package-lock.json |
| Rutas de nuevas páginas no configuradas | MEDIO | Verificar router antes de copiar páginas |

---

## 7. SIGUIENTE FASE

### Fase 2: Ejecución del Análisis
- Analizar contenido exacto de archivos que difieren
- Verificar dependencias de nuevas páginas student
- Mapear imports/exports afectados

### Fase 3: Plan de Implementación
- Definir orden de sincronización
- Scripts de migración automatizada
- Validaciones post-migración

---

**Estado:** FASE 1 COMPLETADA
**Siguiente Acción:** Proceder a FASE 2 - Análisis Detallado de Contenido
