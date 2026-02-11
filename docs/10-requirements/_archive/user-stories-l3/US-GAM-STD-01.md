# US-GAM-STD-01: Portal Estudiante con Avatar

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-FRONTEND
**Modulo(s):** students, gamification, modules, exercises
**Story Points:** 13
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** estudiante de K-12
**Quiero** un portal dedicado con mi avatar personalizado, dashboard de progreso y acceso a todas las funcionalidades
**Para** tener una experiencia de aprendizaje inmersiva y personalizada con tematica maya

## Criterios de Aceptacion

### CA-1: Dashboard Principal del Estudiante
**Given** un estudiante autenticado
**When** accede a su portal
**Then** ve un dashboard con: avatar personalizado y rango maya actual, barra de XP con progreso al siguiente rango, racha de dias consecutivos, modulos disponibles con porcentaje de progreso, misiones activas (diarias/semanales), ultimas notificaciones, posicion en leaderboard del aula

### CA-2: Sistema de Avatar Personalizable
**Given** un estudiante que accede a su perfil
**When** edita su avatar
**Then** puede seleccionar entre avatares base con tematica maya, aplicar items cosmeticos comprados en la tienda (fondos, efectos, accesorios), ver preview en tiempo real, y guardar cambios que se reflejan en todo el sistema

### CA-3: Navegacion por Modulos
**Given** un estudiante en su portal
**When** navega a la seccion de modulos
**Then** ve los 5 modulos con iconografia maya, estado de desbloqueo visual (candado/desbloqueado), progreso individual por modulo, y acceso directo al siguiente ejercicio sugerido

### CA-4: Perfil con Showcase de Logros
**Given** un estudiante que consulta su perfil completo
**When** accede a la seccion de logros
**Then** ve todos los logros desbloqueados organizados por categoria, logros pendientes con barra de progreso, puede seleccionar logros para showcase publico (visible a companeros), e insignias especiales por rango maya

### CA-5: Historial de Actividad
**Given** un estudiante que consulta su historial
**When** accede a la seccion de actividad
**Then** ve timeline cronologico de: ejercicios completados con puntaje, XP ganados, logros desbloqueados, compras en tienda, promociones de rango, con filtros por fecha y tipo de actividad

### CA-6: Responsive y Adaptado a K-12
**Given** un estudiante accediendo desde cualquier dispositivo
**When** la interfaz se renderiza
**Then** es responsive (mobile, tablet, desktop), usa tipografia legible para ninos, colores vibrantes con tematica maya, iconografia intuitiva, y animaciones suaves para feedback de acciones

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | React 19, Zustand 5.x, TailwindCSS 4.x, Vite 7.x |
| Componentes FE | StudentDashboard, AvatarEditor, AvatarPreview, ModuleGrid, ProgressRing, StreakFlame, LeaderboardMini, AchievementShowcase, ActivityTimeline, MissionList, NotificationBell |
| Stores Zustand | useStudentStore, useGamificationStore, useModuleStore, useAvatarStore |
| Paginas | ~30 (dashboard, modulos, ejercicios, perfil, tienda, leaderboard, misiones, logros, historial, ajustes) |
| Dependencias | US-GAM-GAM-01 (XP/Rangos), US-GAM-GAM-02 (ML Coins/Tienda), US-GAM-EDU-01 (Modulos) |

## Definition of Done
- [ ] Dashboard estudiante con todas las metricas visibles
- [ ] Sistema de avatar con personalizacion
- [ ] Navegacion completa por modulos y ejercicios
- [ ] Perfil con showcase de logros
- [ ] Historial de actividad con filtros
- [ ] Design responsive (mobile, tablet, desktop)
- [ ] Tests frontend (cobertura >= 70%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-023 |
| Epica padre | EPIC-GAM-FRONTEND |
