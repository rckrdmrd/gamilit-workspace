# FASE 3: PLAN DE IMPLEMENTACIÓN DETALLADO

**Fecha:** 2025-12-18
**Perfil:** Requirements-Analyst
**Proyecto:** GAMILIT

---

## VARIABLES DE ENTORNO

```bash
ORIGEN="/home/isem/workspace/projects/gamilit"
DESTINO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
```

---

## SPRINT 0: MITIGACIÓN DE SEGURIDAD (INMEDIATO)

### S0-T1: Eliminar Credenciales Expuestas

**Prioridad:** CRÍTICA
**Duración Estimada:** 5 minutos

```bash
# Eliminar archivo con credenciales expuestas
rm -f "${DESTINO}/apps/database/scripts/README-VALIDATION-SCRIPTS.md"

# Verificar eliminación
ls -la "${DESTINO}/apps/database/scripts/README-VALIDATION-SCRIPTS.md" 2>/dev/null && echo "ERROR: Archivo no eliminado" || echo "OK: Archivo eliminado"
```

**Validación:**
- [ ] Archivo README-VALIDATION-SCRIPTS.md eliminado
- [ ] No aparece en `git status`

### S0-T2: Cambiar Contraseña Comprometida

**Prioridad:** CRÍTICA
**Duración Estimada:** 15 minutos

**Contraseña comprometida:** `C5hq7253pdVyVKUC`

**Acciones:**
1. Acceder a Supabase Dashboard / PostgreSQL Admin
2. Cambiar contraseña del usuario `gamilit_user`
3. Actualizar en secrets/environment variables
4. Verificar conexión con nueva contraseña

**Validación:**
- [ ] Contraseña antigua NO funciona
- [ ] Nueva contraseña funciona
- [ ] Aplicaciones reconectan correctamente

---

## SPRINT 1: SINCRONIZACIÓN BACKEND (P0 - CRÍTICO)

### S1-T1: Sincronizar PasswordRecoveryService

**Prioridad:** CRÍTICA (Seguridad de sesiones)
**Duración Estimada:** 10 minutos

```bash
# Copiar servicio actualizado
cp "${ORIGEN}/apps/backend/src/modules/auth/services/password-recovery.service.ts" \
   "${DESTINO}/apps/backend/src/modules/auth/services/password-recovery.service.ts"
```

**Dependencias a verificar:**
```bash
# Verificar que SessionManagementService existe en DESTINO
grep -r "SessionManagementService" "${DESTINO}/apps/backend/src/modules/auth/"
```

**Validación:**
- [ ] Archivo copiado correctamente
- [ ] SessionManagementService importado
- [ ] revokeAllSessions implementado
- [ ] TypeScript compila sin errores

### S1-T2: Sincronizar EmailVerificationService

**Prioridad:** CRÍTICA (Funcionalidad de email)
**Duración Estimada:** 10 minutos

```bash
# Copiar servicio actualizado
cp "${ORIGEN}/apps/backend/src/modules/auth/services/email-verification.service.ts" \
   "${DESTINO}/apps/backend/src/modules/auth/services/email-verification.service.ts"
```

**Dependencias a verificar:**
```bash
# Verificar que MailService existe en DESTINO
grep -r "MailService" "${DESTINO}/apps/backend/src/modules/"
```

**Validación:**
- [ ] Archivo copiado correctamente
- [ ] MailService inyectado (no comentado)
- [ ] Logger implementado
- [ ] TypeScript compila sin errores

### S1-T3: Sincronizar ExerciseSubmissionService

**Prioridad:** MEDIA (Logging estructurado)
**Duración Estimada:** 10 minutos

```bash
# Copiar servicio actualizado
cp "${ORIGEN}/apps/backend/src/modules/progress/services/exercise-submission.service.ts" \
   "${DESTINO}/apps/backend/src/modules/progress/services/exercise-submission.service.ts"
```

**Validación:**
- [ ] Archivo copiado correctamente
- [ ] Logger declarado en clase
- [ ] Todos los console.* reemplazados por logger.*
- [ ] TypeScript compila sin errores

### S1-T4: Verificar Compilación Backend

**Prioridad:** ALTA
**Duración Estimada:** 5 minutos

```bash
cd "${DESTINO}/apps/backend"
npm run build
```

**Validación:**
- [ ] Build completa sin errores
- [ ] Sin warnings de TypeScript

---

## SPRINT 2: CORRECCIONES FRONTEND (P0 - CRÍTICO)

### S2-T1: Agregar Caso Emparejamiento a ExerciseContentRenderer

**Prioridad:** CRÍTICA (Regresión funcional)
**Duración Estimada:** 15 minutos

**Opción A: Copiar archivo completo de DESTINO**
```bash
# El DESTINO tiene la versión más completa
cp "${DESTINO}/apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx" \
   "${ORIGEN}/apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx"
```

**Opción B: Merge manual (si hay otros cambios en ORIGEN)**

Agregar en ORIGEN el siguiente caso (aproximadamente línea 67):
```typescript
case 'emparejamiento':
  return (
    <EmparejamientoRenderer
      data={answerData}
      correct={correctAnswer}
      showComparison={showComparison}
    />
  );
```

**Dependencia a verificar:**
```bash
# Verificar que EmparejamientoRenderer existe y se exporta
grep -r "EmparejamientoRenderer" "${ORIGEN}/apps/frontend/src/"
```

**Validación:**
- [ ] Caso 'emparejamiento' existe en switch
- [ ] EmparejamientoRenderer se importa correctamente
- [ ] TypeScript compila sin errores

### S2-T2: Agregar Error Handling a passwordAPI.ts

**Prioridad:** ALTA
**Duración Estimada:** 10 minutos

**Copiar versión con error handling:**
```bash
cp "${DESTINO}/apps/frontend/src/services/api/passwordAPI.ts" \
   "${ORIGEN}/apps/frontend/src/services/api/passwordAPI.ts"
```

**O agregar manualmente handleAPIError a cada método:**
```typescript
import { handleAPIError } from '@/shared/utils/errors';

requestPasswordReset: async (email: string): Promise<PasswordResetRequestResponse> => {
  try {
    const response = await apiClient.post('/auth/reset-password/request', { email });
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}
```

**Validación:**
- [ ] Todos los métodos tienen try-catch
- [ ] handleAPIError se importa correctamente
- [ ] TypeScript compila sin errores

### S2-T3: Agregar Error Handling a profileAPI.ts

**Prioridad:** ALTA
**Duración Estimada:** 10 minutos

```bash
cp "${DESTINO}/apps/frontend/src/services/api/profileAPI.ts" \
   "${ORIGEN}/apps/frontend/src/services/api/profileAPI.ts"
```

**Validación:**
- [ ] Todos los métodos (5) tienen try-catch
- [ ] handleAPIError se importa correctamente

### S2-T4: Agregar Error Handling a missionsAPI.ts

**Prioridad:** ALTA
**Duración Estimada:** 10 minutos

```bash
cp "${DESTINO}/apps/frontend/src/services/api/missionsAPI.ts" \
   "${ORIGEN}/apps/frontend/src/services/api/missionsAPI.ts"
```

**Validación:**
- [ ] Todos los métodos (5) tienen try-catch
- [ ] handleAPIError se importa correctamente

### S2-T5: Verificar Compilación Frontend

**Prioridad:** ALTA
**Duración Estimada:** 5 minutos

```bash
cd "${ORIGEN}/apps/frontend"
npm run build
```

**Validación:**
- [ ] Build completa sin errores
- [ ] Sin warnings de TypeScript

---

## SPRINT 3: SINCRONIZACIÓN COMPONENTES TEACHER PORTAL (P1)

### S3-T1: Sincronizar Componentes de Grading

```bash
# Copiar RubricEvaluator.tsx de ORIGEN a DESTINO
cp "${ORIGEN}/apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx" \
   "${DESTINO}/apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx"

# Copiar index.ts de ORIGEN a DESTINO
cp "${ORIGEN}/apps/frontend/src/apps/teacher/components/grading/index.ts" \
   "${DESTINO}/apps/frontend/src/apps/teacher/components/grading/index.ts"
```

### S3-T2: Sincronizar Hooks de Teacher

```bash
# Hooks con mejor formato en DESTINO - copiar de DESTINO a ORIGEN
cp "${DESTINO}/apps/frontend/src/apps/teacher/hooks/useMasteryTracking.ts" \
   "${ORIGEN}/apps/frontend/src/apps/teacher/hooks/useMasteryTracking.ts"

cp "${DESTINO}/apps/frontend/src/apps/teacher/hooks/useMissionStats.ts" \
   "${ORIGEN}/apps/frontend/src/apps/teacher/hooks/useMissionStats.ts"

# Hook con formato compacto en ORIGEN - copiar de ORIGEN a DESTINO
cp "${ORIGEN}/apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts" \
   "${DESTINO}/apps/frontend/src/apps/teacher/hooks/useClassroomRealtime.ts"
```

### S3-T3: Sincronizar ResponseDetailModal

```bash
# Copiar de ORIGEN a DESTINO (versión principal)
cp "${ORIGEN}/apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx" \
   "${DESTINO}/apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx"
```

---

## SPRINT 4: LIMPIEZA DATABASE SCRIPTS (P2)

### S4-T1: Eliminar Directorio Deprecated

```bash
rm -rf "${DESTINO}/apps/database/scripts/deprecated/"
```

**Validación:**
- [ ] Directorio deprecated/ no existe
- [ ] Scripts v1, v2 eliminados

### S4-T2: Eliminar Directorios Vacíos

```bash
rm -rf "${DESTINO}/apps/database/scripts/backup/"
rm -rf "${DESTINO}/apps/database/scripts/restore/"
rm -rf "${DESTINO}/apps/database/scripts/utilities/"
```

### S4-T3: Crear Estructura validations/ en DESTINO

```bash
# Crear directorio si no existe
mkdir -p "${DESTINO}/apps/database/scripts/validations/"

# Copiar contenido de validations/ de ORIGEN
cp -r "${ORIGEN}/apps/database/scripts/validations/"* \
      "${DESTINO}/apps/database/scripts/validations/"
```

### S4-T4: Eliminar Scripts SQL Dispersos de Raíz

```bash
# Eliminar archivos que ahora están en validations/
cd "${DESTINO}/apps/database/scripts/"
rm -f validate-gap-fixes.sql
rm -f validate-generate-alerts-joins.sql
rm -f validate-missions-objectives-structure.sql
rm -f validate-seeds-integrity.sql
rm -f validate-update-user-rank-fix.sql
rm -f validate-user-initialization.sql
rm -f VALIDACIONES-RAPIDAS-POST-RECREACION.sql
rm -f validate_integrity.py
rm -f VALIDACION-RAPIDA-RECREACION-2025-11-24.sql
rm -f apply-maya-ranks-v2.1.sql
rm -f README-SETUP.md
```

### S4-T5: Copiar Scripts y Docs Nuevos

```bash
# Copiar scripts de deployment nuevos
cp "${ORIGEN}/scripts/setup-ssl-certbot.sh" "${DESTINO}/scripts/"
cp "${ORIGEN}/scripts/validate-deployment.sh" "${DESTINO}/scripts/"

# Actualizar README.md de scripts
cp "${ORIGEN}/scripts/README.md" "${DESTINO}/scripts/"
```

---

## SPRINT 5: SINCRONIZACIÓN FINAL Y DOCUMENTACIÓN (P3)

### S5-T1: Sincronizar Archivos de Raíz

```bash
# Mover CODEOWNERS a .github
mkdir -p "${DESTINO}/.github/"
mv "${DESTINO}/CODEOWNERS" "${DESTINO}/.github/CODEOWNERS" 2>/dev/null || true

# Copiar archivos actualizados de raíz
cp "${ORIGEN}/ecosystem.config.js" "${DESTINO}/"
cp "${ORIGEN}/package.json" "${DESTINO}/"
cp "${ORIGEN}/package-lock.json" "${DESTINO}/"
```

### S5-T2: Sincronizar Nueva Documentación

```bash
# Crear directorios de documentación nuevos
mkdir -p "${DESTINO}/docs/90-transversal/arquitectura/especificaciones/"
mkdir -p "${DESTINO}/docs/90-transversal/migraciones/"
mkdir -p "${DESTINO}/docs/database/functions/"
mkdir -p "${DESTINO}/docs/frontend/admin/"
mkdir -p "${DESTINO}/docs/frontend/guides/"
mkdir -p "${DESTINO}/docs/frontend/teacher/"

# Copiar guías de deployment
cp "${ORIGEN}/docs/95-guias-desarrollo/GUIA-DEPLOYMENT-RAPIDO.md" "${DESTINO}/docs/95-guias-desarrollo/" 2>/dev/null || true
cp "${ORIGEN}/docs/95-guias-desarrollo/GUIA-SSL-CERTBOT-DEPLOYMENT.md" "${DESTINO}/docs/95-guias-desarrollo/" 2>/dev/null || true
```

### S5-T3: Limpiar Archivos Obsoletos de Database

```bash
cd "${DESTINO}/apps/database/"

# Eliminar scripts Python temporales
rm -f analyze-image-complete.py
rm -f complete-crossword-design.py
rm -f crossword-final-correct.py
rm -f crossword-from-image-final.py
rm -f exact-coordinates-layout.py
rm -f final-correct-layout.py
rm -f map-exact-from-image.py
rm -f map-image-exact-v2.py
rm -f sync-prod-dev.py
rm -f validate-final-from-db.py
rm -f verify-unification.py

# Eliminar logs de creación
rm -f create-database-*.log

# Eliminar archivos .env de credenciales (SEGURIDAD)
rm -f .env.database
rm -f .env.dev
rm -f database-credentials-dev.txt

# Eliminar documentos históricos
rm -f CHANGELOG-PERFECT-SCORES.md
rm -f DATABASE-RECREATION-SUCCESS-2025-11-24.txt
rm -f INDEX-RECREACION-BD-2025-11-24.md
rm -f README-RECREACION-2025-11-24.md
rm -f RESUMEN-EJECUTIVO-RECREACION-BD.md
rm -f TEACHER-REPORTS-VISUAL-SCHEMA.txt
rm -f VISUAL-DIFF-INITIALIZE-MISSIONS-2025-11-24.md

# Eliminar directorio migrations obsoleto
rm -rf migrations/
```

### S5-T4: Reinstalar Dependencias

```bash
cd "${DESTINO}"
npm install

cd "${DESTINO}/apps/backend"
npm install

cd "${DESTINO}/apps/frontend"
npm install
```

---

## VALIDACIONES FINALES

### V1: Verificar Compilación Completa

```bash
cd "${DESTINO}"

# Backend
cd apps/backend && npm run build && cd ../..

# Frontend
cd apps/frontend && npm run build && cd ../..

echo "✅ Compilación completa exitosa"
```

### V2: Ejecutar Tests

```bash
cd "${DESTINO}"

# Backend tests
cd apps/backend && npm run test && cd ../..

# Frontend tests
cd apps/frontend && npm run test && cd ../..

echo "✅ Tests pasaron exitosamente"
```

### V3: Verificar Archivos Eliminados

```bash
# Verificar que credenciales fueron eliminadas
test ! -f "${DESTINO}/apps/database/scripts/README-VALIDATION-SCRIPTS.md" && echo "✅ README-VALIDATION-SCRIPTS.md eliminado"
test ! -f "${DESTINO}/apps/database/database-credentials-dev.txt" && echo "✅ database-credentials-dev.txt eliminado"
test ! -f "${DESTINO}/apps/database/.env.database" && echo "✅ .env.database eliminado"
test ! -f "${DESTINO}/apps/database/.env.dev" && echo "✅ .env.dev eliminado"

# Verificar deprecated eliminado
test ! -d "${DESTINO}/apps/database/scripts/deprecated" && echo "✅ deprecated/ eliminado"
```

### V4: Verificar Estructura Nueva

```bash
# Verificar validations/ existe y tiene contenido
test -d "${DESTINO}/apps/database/scripts/validations" && echo "✅ validations/ existe"
ls "${DESTINO}/apps/database/scripts/validations/" | wc -l
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Sprint 0 - Seguridad
- [ ] README-VALIDATION-SCRIPTS.md eliminado
- [ ] Contraseña comprometida cambiada
- [ ] Nuevas credenciales funcionando

### Sprint 1 - Backend
- [ ] PasswordRecoveryService sincronizado
- [ ] EmailVerificationService sincronizado
- [ ] ExerciseSubmissionService sincronizado
- [ ] Backend compila sin errores

### Sprint 2 - Frontend Crítico
- [ ] Caso emparejamiento agregado a ExerciseContentRenderer
- [ ] Error handling en passwordAPI
- [ ] Error handling en profileAPI
- [ ] Error handling en missionsAPI
- [ ] Frontend compila sin errores

### Sprint 3 - Teacher Portal
- [ ] RubricEvaluator sincronizado
- [ ] Hooks teacher sincronizados
- [ ] ResponseDetailModal sincronizado

### Sprint 4 - Database Scripts
- [ ] deprecated/ eliminado
- [ ] Directorios vacíos eliminados
- [ ] validations/ creado y poblado
- [ ] Scripts dispersos eliminados

### Sprint 5 - Limpieza Final
- [ ] CODEOWNERS movido a .github/
- [ ] Scripts Python temporales eliminados
- [ ] Logs y archivos históricos eliminados
- [ ] Archivos .env eliminados
- [ ] Dependencias reinstaladas

### Validaciones
- [ ] Compilación backend OK
- [ ] Compilación frontend OK
- [ ] Tests backend OK
- [ ] Tests frontend OK
- [ ] Sin archivos de credenciales

---

## ROLLBACK PLAN

En caso de problemas, revertir usando git:

```bash
cd "${DESTINO}"
git checkout .
git clean -fd
```

O restaurar desde backup si existe:
```bash
# Si hay backup previo
cp -r "${BACKUP_DIR}/gamilit/"* "${DESTINO}/"
```

---

**Estado:** FASE 3 COMPLETADA
**Siguiente Acción:** Proceder a FASE 4 - Validación de Dependencias
