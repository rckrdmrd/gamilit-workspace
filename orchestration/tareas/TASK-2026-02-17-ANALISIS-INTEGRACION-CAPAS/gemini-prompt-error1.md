Analiza el ERROR de FK constraint violation en user_ranks que ocurre al hacer submit de un ejercicio.

ERROR: GET /api/v1/gamification/ranks/users/{userId}/rank-progress retorna 500 Internal Server Error
QueryFailedError: insert or update on table user_ranks violates foreign key constraint user_ranks_user_id_fkey

FLUJO: ExercisePage submit exitoso -> useInvalidateDashboard syncAndInvalidate -> ranksStore fetchUserProgress -> backend calculateRankProgress -> INSERT user_ranks -> FK violation

ARCHIVOS A LEER Y ANALIZAR:
1. apps/backend/src/modules/gamification/services/ranks.service.ts - metodo calculateRankProgress
2. apps/database/ddl/schemas/gamification_system/tables/ - archivo que define user_ranks (buscar FK constraint)
3. apps/backend/src/modules/gamification/entities/ - entidad UserRank y su @ManyToOne
4. apps/frontend/src/shared/stores/ranksStore.ts - lineas ~580-600
5. apps/frontend/src/shared/hooks/useInvalidateDashboard.ts - flujo post-submit
6. apps/frontend/src/apps/student/pages/ExercisePage.tsx - lineas ~500-520 handleSubmit

PREGUNTA CLAVE: user_ranks.user_id referencia auth.users(id) o auth_management.profiles(id)?
El userId que llega del frontend es el profile.id o el auth.users.id?

SALIDA: Causa raiz con lineas exactas, flujo completo, solucion propuesta, impacto en otros modulos.
