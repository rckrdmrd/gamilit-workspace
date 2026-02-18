Analiza 3 errores de runtime en la plataforma gamilit.

ERROR 2 - Mission Claim CHECK constraint:
POST /api/v1/gamification/missions/{id}/claim retorna 500
QueryFailedError: new row for relation ml_coins_transactions violates check constraint ml_coins_transactions_reference_type_check
ARCHIVOS: apps/backend/src/modules/gamification/services/missions.service.ts (metodo claimReward), DDL de ml_coins_transactions en apps/database/ddl/schemas/gamification_system/tables/

ERROR 3 - User Preferences 401:
GET /api/v1/users/preferences retorna 401 Unauthorized
ARCHIVOS: apps/backend/src/modules/ (buscar endpoint users/preferences), apps/frontend/src/services/api/profileAPI.ts linea 225, apps/frontend/src/shared/hooks/useUserPreferences.ts

ERROR 4 - Email Verification 404:
GET /api/v1/auth/verify-email/status retorna 404 Not Found
ARCHIVOS: apps/backend/src/modules/auth/controllers/ (buscar endpoint verify-email/status), apps/frontend/src/apps/student/pages/SettingsPage.tsx lineas 390-410, apps/frontend/src/services/api/profileAPI.ts linea 348

Para cada error: Causa raiz con lineas exactas, solucion propuesta, impacto en otros portales.
