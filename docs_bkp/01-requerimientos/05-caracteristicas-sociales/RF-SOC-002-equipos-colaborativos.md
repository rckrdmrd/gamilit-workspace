# RF-SOC-002: Sistema de Equipos Colaborativos

**ID:** RF-SOC-002
**Título:** Equipos Colaborativos para Proyectos Grupales
**Módulo:** 05-caracteristicas-sociales
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Media ⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el sistema de **equipos colaborativos** que permite a los estudiantes formar grupos para trabajar juntos en proyectos, ejercicios colaborativos y actividades grupales. Complementa el sistema de aulas virtuales (RF-SOC-001) añadiendo una capa de colaboración entre pares.

Los equipos permiten:
- Trabajo colaborativo en proyectos de mayor escala
- Evaluación individual y grupal
- Gamificación de equipo (achievements, rankings)
- Desarrollo de habilidades sociales y de trabajo en equipo
- Distribución equitativa de tareas

---

## 🎯 Objetivos

1. **Fomentar el aprendizaje colaborativo** entre estudiantes
2. **Permitir proyectos de escala mayor** que requieren múltiples participantes
3. **Evaluar contribuciones individuales** dentro del equipo
4. **Gamificar la experiencia de equipo** con achievements y rankings
5. **Desarrollar habilidades sociales** de colaboración y comunicación

---

## 👥 Actores

- **Estudiante (Líder de Equipo):** Crea y gestiona el equipo
- **Estudiante (Miembro):** Participa en el equipo
- **Maestro:** Crea proyectos colaborativos y evalúa equipos
- **Sistema:** Gestiona automáticamente invitaciones, contribuciones y rankings

---

## ✅ Requerimientos Funcionales

### RF-SOC-002-01: Creación de Equipos

**Descripción:** Los estudiantes pueden crear equipos para proyectos colaborativos.

**Criterios de Aceptación:**
- Un estudiante puede crear un equipo proporcionando:
  - Nombre del equipo (3-50 caracteres, único dentro del aula)
  - Descripción opcional (max 500 caracteres)
  - Tamaño máximo (2-10 miembros)
  - Visibilidad: `public` (cualquiera puede unirse), `private` (solo por invitación)
- El creador automáticamente se convierte en **líder del equipo**
- El equipo inicia en estado `forming` (en formación)
- El líder puede editar nombre, descripción y configuración mientras esté en `forming`

**Estados del Equipo:**
```
forming      → Equipo en formación (aceptando miembros)
active       → Equipo completo, trabajando en proyecto
completed    → Proyecto terminado
disbanded    → Equipo disuelto
```

**Flujo:**
```
┌──────────────────┐
│  Estudiante crea │
│      equipo      │
└────────┬─────────┘
         ▼
    Estado: forming
         │
         ├─ Invita miembros
         ├─ Acepta solicitudes
         │
         ▼
    Estado: active
    (Proyecto asignado)
         │
         ▼
  Entregan proyecto
         │
         ▼
    Estado: completed
```

**Ejemplo:**
```json
{
  "team_id": "team-uuid",
  "name": "Guerreros Maya",
  "description": "Equipo para proyecto de traducción de leyendas",
  "max_members": 5,
  "visibility": "public",
  "status": "forming",
  "leader_id": "user-uuid",
  "created_at": "2025-11-07T10:00:00Z"
}
```

---

### RF-SOC-002-02: Membresía de Equipo

**Descripción:** Sistema de invitaciones y solicitudes para unirse a equipos.

**Criterios de Aceptación:**

**Equipos Públicos (`public`):**
- Cualquier estudiante del aula puede **solicitar unirse**
- El líder revisa y acepta/rechaza solicitudes
- Los miembros actuales pueden ver solicitudes pendientes

**Equipos Privados (`private`):**
- Solo el líder puede **invitar** estudiantes
- El estudiante invitado acepta/rechaza la invitación
- No se permiten solicitudes espontáneas

**Roles en el Equipo:**
- `leader`: Líder del equipo (1 solo)
  - Gestiona membresía (invitaciones, aceptar/rechazar solicitudes)
  - Asigna tareas a miembros
  - Puede transferir liderazgo a otro miembro
  - Puede disolver el equipo
- `member`: Miembro regular
  - Contribuye al proyecto
  - Puede salir del equipo voluntariamente
  - Puede ver tareas y contribuciones

**Estados de Membresía:**
```
invited       → Invitación enviada (solo private teams)
requested     → Solicitud de unión (solo public teams)
accepted      → Miembro activo del equipo
rejected      → Invitación/solicitud rechazada
left          → Miembro salió voluntariamente
removed       → Miembro removido por líder
```

**Restricciones:**
- Un estudiante puede pertenecer a máximo **3 equipos activos** simultáneamente
- El líder no puede abandonar el equipo sin transferir liderazgo o disolver
- Si el líder es removido del aula, el sistema transfiere liderazgo automáticamente

**Ejemplo de Invitación:**
```json
{
  "invitation_id": "inv-uuid",
  "team_id": "team-uuid",
  "inviter_id": "leader-uuid",
  "invitee_id": "student-uuid",
  "status": "invited",
  "message": "Te invitamos a unirte a nuestro equipo para el proyecto de leyendas",
  "expires_at": "2025-11-14T10:00:00Z",
  "created_at": "2025-11-07T10:00:00Z"
}
```

---

### RF-SOC-002-03: Proyectos Colaborativos

**Descripción:** Los maestros crean proyectos colaborativos que los equipos deben completar.

**Criterios de Aceptación:**
- El maestro crea un proyecto colaborativo con:
  - Título y descripción
  - Fecha límite
  - Entregables esperados (ej: texto traducido, presentación, video)
  - Criterios de evaluación
  - Puntos/XP por completar
- El proyecto se asigna a un equipo específico o todos los equipos del aula
- Los equipos ven el proyecto en su dashboard
- Los miembros pueden subir entregables (archivos, textos)
- El equipo marca el proyecto como "listo para evaluar" cuando termina

**Tipos de Entregables:**
- `text`: Texto escrito (ej: ensayo, traducción)
- `document`: Documento (PDF, DOCX)
- `presentation`: Presentación (PPT, Google Slides link)
- `video`: Video grabado
- `audio`: Audio grabado (pronunciación, podcast)
- `code`: Código (ej: ejercicio de programación)

**Estados del Proyecto:**
```
assigned      → Proyecto asignado al equipo
in_progress   → Equipo trabajando en proyecto
submitted     → Equipo entregó para evaluación
evaluated     → Maestro evaluó el proyecto
```

**Ejemplo:**
```json
{
  "project_id": "proj-uuid",
  "title": "Traducción de Leyendas Mayas",
  "description": "Traducir 3 leyendas del español al maya yucateco",
  "team_id": "team-uuid",
  "due_date": "2025-11-20T23:59:59Z",
  "deliverables": [
    {"type": "text", "title": "Leyenda 1: El colibrí"},
    {"type": "text", "title": "Leyenda 2: La xtabay"},
    {"type": "text", "title": "Leyenda 3: Los aluxes"}
  ],
  "status": "assigned",
  "points": 500,
  "xp_reward": 1000
}
```

---

### RF-SOC-002-04: Tracking de Contribuciones

**Descripción:** El sistema registra las contribuciones individuales de cada miembro del equipo.

**Criterios de Aceptación:**
- Cada acción realizada por un miembro se registra:
  - Entregables subidos
  - Comentarios en discusiones
  - Revisiones de trabajo de compañeros
  - Tiempo dedicado (estimado)
- El sistema calcula un **porcentaje de contribución** por miembro:
  - Basado en cantidad y calidad de aportes
  - Visible para el líder y el maestro
  - NO visible para otros miembros (evitar conflictos)
- El maestro puede ajustar manualmente las contribuciones si lo considera necesario

**Métricas de Contribución:**
```json
{
  "user_id": "member-uuid",
  "team_id": "team-uuid",
  "project_id": "proj-uuid",
  "deliverables_submitted": 2,
  "comments_count": 15,
  "reviews_count": 3,
  "estimated_hours": 8,
  "contribution_percentage": 28.5,
  "last_activity_at": "2025-11-15T14:30:00Z"
}
```

**Cálculo de Contribución:**
```
Contribución = (Entregables * 40%) + (Comentarios * 20%) + (Revisiones * 20%) + (Horas * 20%)
Normalizado al 100% entre todos los miembros
```

---

### RF-SOC-002-05: Evaluación de Proyectos

**Descripción:** El maestro evalúa proyectos colaborativos con opción de evaluación diferenciada.

**Criterios de Aceptación:**

**Evaluación Grupal:**
- El maestro asigna una **calificación grupal** (0-100)
- Todos los miembros reciben la misma calificación base
- El maestro proporciona feedback general al equipo

**Evaluación Individual (Opcional):**
- El maestro puede ajustar la calificación de cada miembro basándose en:
  - Porcentaje de contribución
  - Calidad de aportes individuales
  - Comportamiento en el equipo
- Fórmula sugerida: `Calificación Individual = Calificación Grupal * (Contribución% / Promedio de Contribución del Equipo)`

**Ejemplo:**
```
Calificación Grupal: 85/100

Contribuciones:
- María: 35% → 85 * (35/25) = 119 → Cap a 100
- Juan: 25% → 85 * (25/25) = 85
- Ana: 20% → 85 * (20/25) = 68
- Pedro: 20% → 85 * (20/25) = 68

Promedio de contribución: 25%
```

**Distribución de Recompensas:**
- **XP:** Cada miembro recibe XP proporcional a su contribución
- **ML Coins:** Distribuidos según contribución
- **Achievements:** Se otorgan achievements de equipo si todo el equipo colaboró

**Feedback:**
```json
{
  "evaluation_id": "eval-uuid",
  "project_id": "proj-uuid",
  "team_id": "team-uuid",
  "group_score": 85,
  "feedback": "Excelente trabajo en las traducciones. Las leyendas están muy bien adaptadas al contexto maya.",
  "individual_scores": [
    {"user_id": "maria-uuid", "score": 100, "contribution": 35},
    {"user_id": "juan-uuid", "score": 85, "contribution": 25},
    {"user_id": "ana-uuid", "score": 68, "contribution": 20},
    {"user_id": "pedro-uuid", "score": 68, "contribution": 20}
  ],
  "evaluated_at": "2025-11-21T10:00:00Z"
}
```

---

### RF-SOC-002-06: Gamificación de Equipos

**Descripción:** Sistema de achievements y rankings específicos para equipos.

**Criterios de Aceptación:**

**Achievements de Equipo:**
- `team_first_project`: Primer proyecto completado como equipo
- `team_perfect_score`: Calificación perfecta (100/100) en proyecto
- `team_speed_demons`: Entregar proyecto 3+ días antes de la fecha límite
- `team_all_star`: Todos los miembros contribuyeron ≥20%
- `team_veteran`: 5 proyectos completados como equipo
- `team_champions`: Equipo con mayor puntaje del aula en un proyecto

**Ranking de Equipos:**
- Ranking por aula basado en:
  - Proyectos completados
  - Promedio de calificaciones
  - Achievements desbloqueados
- Visible en dashboard del aula
- Actualizado en tiempo real

**Recompensas de Equipo:**
- Los achievements de equipo otorgan **bonus de XP** a todos los miembros
- Los equipos en top 3 del ranking reciben **badges especiales**
- El equipo #1 del mes recibe **bonus de ML Coins** para todo el equipo

**Ejemplo de Achievement:**
```json
{
  "achievement_id": "team_all_star",
  "team_id": "team-uuid",
  "unlocked_at": "2025-11-21T10:00:00Z",
  "xp_bonus": 200,
  "coins_bonus": 50,
  "members_rewarded": [
    {"user_id": "maria-uuid", "xp_received": 200, "coins_received": 50},
    {"user_id": "juan-uuid", "xp_received": 200, "coins_received": 50},
    {"user_id": "ana-uuid", "xp_received": 200, "coins_received": 50},
    {"user_id": "pedro-uuid", "xp_received": 200, "coins_received": 50}
  ]
}
```

---

### RF-SOC-002-07: Chat de Equipo (Opcional)

**Descripción:** Sistema de mensajería interna para comunicación del equipo.

**Criterios de Aceptación:**
- Cada equipo tiene un **chat privado** solo visible para miembros
- Los miembros pueden:
  - Enviar mensajes de texto
  - Mencionar a otros miembros (@username)
  - Compartir archivos relevantes al proyecto
- El maestro puede acceder al chat para supervisión (solo lectura)
- Los mensajes se guardan por 90 días después de completar el proyecto

**Moderación:**
- Filtro automático de palabras inapropiadas
- Reportar mensajes inapropiados al maestro
- El maestro puede desactivar el chat si hay comportamiento inadecuado

---

## 🎨 Wireframes y Flujos

### Dashboard de Equipo

```
┌────────────────────────────────────────────────────┐
│  GUERREROS MAYA                          [⚙️ Config]│
│  5/5 miembros │ Proyecto: En progreso             │
├────────────────────────────────────────────────────┤
│                                                    │
│  📊 Proyecto Actual                                │
│  ┌────────────────────────────────────────────┐  │
│  │ Traducción de Leyendas Mayas               │  │
│  │ Fecha límite: 20 Nov 2025                  │  │
│  │                                            │  │
│  │ Progreso: ████████░░ 75%                   │  │
│  │                                            │  │
│  │ Entregables:                               │  │
│  │ ✅ Leyenda 1: El colibrí (María)           │  │
│  │ ✅ Leyenda 2: La xtabay (Juan)             │  │
│  │ ⏳ Leyenda 3: Los aluxes (Ana)             │  │
│  │                                            │  │
│  │ [Ver Detalles] [Subir Entregable]         │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  👥 Miembros                                       │
│  ┌────────────────────────────────────────────┐  │
│  │ 👑 María (Líder)      Contribución: 35%    │  │
│  │ 👤 Juan               Contribución: 25%    │  │
│  │ 👤 Ana                Contribución: 20%    │  │
│  │ 👤 Pedro              Contribución: 20%    │  │
│  │                                            │  │
│  │ [Invitar Miembro]                          │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  🏆 Achievements de Equipo                         │
│  🎖️ Team First Project                            │
│  ⚡ Team Speed Demons                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔒 Consideraciones de Seguridad

### Privacidad
- Los chats de equipo son privados (solo miembros + maestro)
- Las contribuciones individuales solo son visibles para:
  - El propio miembro
  - El líder del equipo
  - El maestro
- Los equipos de un aula NO son visibles para estudiantes de otras aulas

### Moderación
- Filtro automático de lenguaje inapropiado en chats
- Los maestros pueden revisar chats de equipo
- Sistema de reportes para comportamiento inadecuado

### Límites
- Máximo 3 equipos activos por estudiante
- Máximo 10 miembros por equipo
- Tamaño mínimo de equipo: 2 miembros
- Los equipos sin actividad por 30 días se marcan como "inactivos"

---

## 🎯 Casos de Uso

### CU-001: Crear Equipo y Invitar Miembros

**Actor:** María (Estudiante)

**Flujo Principal:**
1. María accede a la sección "Equipos" en su aula
2. Hace clic en "Crear Equipo"
3. Completa el formulario:
   - Nombre: "Guerreros Maya"
   - Descripción: "Equipo para proyecto de traducción"
   - Tamaño máximo: 5
   - Visibilidad: Privado
4. Sistema crea el equipo con estado `forming`
5. María ve la pantalla de su equipo con opción "Invitar Miembros"
6. Busca a Juan por nombre y envía invitación
7. Sistema notifica a Juan de la invitación
8. Juan acepta la invitación
9. Sistema añade a Juan al equipo con rol `member`
10. María ve a Juan en la lista de miembros

**Flujo Alternativo (Equipo Público):**
5a. María crea equipo público
5b. Juan ve el equipo en "Equipos Disponibles"
5c. Juan solicita unirse
5d. María ve la solicitud y la acepta
5e. Sistema añade a Juan al equipo

---

### CU-002: Maestro Asigna Proyecto Colaborativo

**Actor:** Profesor García (Maestro)

**Flujo Principal:**
1. Profesor accede a su aula
2. Va a "Proyectos Colaborativos" → "Crear Proyecto"
3. Completa el formulario:
   - Título: "Traducción de Leyendas Mayas"
   - Descripción: "Traducir 3 leyendas del español al maya"
   - Fecha límite: 20 Nov 2025
   - Entregables: 3 textos traducidos
   - Puntos: 500 XP
4. Selecciona equipos destinatarios: "Guerreros Maya"
5. Sistema asigna proyecto al equipo
6. Notifica a todos los miembros del equipo
7. Equipo ve proyecto en su dashboard con estado `assigned`

---

### CU-003: Equipo Entrega Proyecto

**Actor:** María (Líder de Equipo)

**Flujo Principal:**
1. María accede al proyecto "Traducción de Leyendas"
2. Ve que todos los entregables han sido subidos:
   - ✅ Leyenda 1 (por María)
   - ✅ Leyenda 2 (por Juan)
   - ✅ Leyenda 3 (por Ana)
3. Hace clic en "Marcar como Listo para Evaluar"
4. Sistema confirma: "¿Seguro? No podrás editar después"
5. María confirma
6. Sistema cambia estado a `submitted`
7. Sistema notifica al maestro
8. Sistema registra contribuciones finales de cada miembro

---

### CU-004: Maestro Evalúa Proyecto con Evaluación Diferenciada

**Actor:** Profesor García

**Flujo Principal:**
1. Profesor recibe notificación de proyecto entregado
2. Accede al proyecto y revisa entregables
3. Ve el reporte de contribuciones:
   - María: 35% (subió 1 entregable + 10 comentarios + liderazgo)
   - Juan: 25% (subió 1 entregable + 5 comentarios)
   - Ana: 25% (subió 1 entregable + 5 comentarios)
   - Pedro: 15% (solo 3 comentarios, no entregables)
4. Asigna calificación grupal: 85/100
5. Activa "Evaluación Diferenciada"
6. Sistema sugiere calificaciones individuales:
   - María: 99 (35% contribución)
   - Juan: 85 (25%)
   - Ana: 85 (25%)
   - Pedro: 51 (15%)
7. Profesor ajusta manualmente:
   - Pedro: 60 (reconoce que estuvo enfermo)
8. Escribe feedback: "Excelente trabajo. Las traducciones son precisas."
9. Sistema distribuye XP y ML Coins proporcionalmente
10. Sistema desbloquea achievement "Team All-Star" (todos contribuyeron ≥15%)

---

## 📊 Métricas y Analytics

### Métricas de Equipo
- Número total de equipos activos por aula
- Promedio de miembros por equipo
- Tasa de disolución de equipos (equipos disbanded / equipos creados)
- Distribución de visibilidad (public vs private)

### Métricas de Proyectos
- Proyectos asignados vs completados
- Tiempo promedio de entrega
- Tasa de entregas a tiempo vs tardías
- Promedio de calificaciones por equipo

### Métricas de Contribución
- Distribución de contribuciones (equitativo vs desbalanceado)
- Identificación de "free riders" (contribución <10%)
- Identificación de "super contributors" (contribución >40%)

---

## 🧪 Casos de Prueba

### Test 1: Crear Equipo Exitosamente

```typescript
test('Student can create a team successfully', async () => {
  const student = await createTestStudent();
  const classroom = await createTestClassroom();

  const team = await teamService.createTeam(student.id, {
    name: 'Guerreros Maya',
    description: 'Equipo de traducción',
    classroom_id: classroom.id,
    max_members: 5,
    visibility: 'private'
  });

  expect(team.name).toBe('Guerreros Maya');
  expect(team.status).toBe('forming');
  expect(team.leader_id).toBe(student.id);

  // Verify leader is automatically added as member
  const members = await teamService.getTeamMembers(team.id);
  expect(members).toHaveLength(1);
  expect(members[0].user_id).toBe(student.id);
  expect(members[0].role).toBe('leader');
});
```

### Test 2: Límite de Equipos Activos

```typescript
test('Student cannot join more than 3 active teams', async () => {
  const student = await createTestStudent();

  // Create and join 3 teams
  for (let i = 0; i < 3; i++) {
    const team = await createTestTeam();
    await teamService.joinTeam(student.id, team.id);
  }

  // Try to join 4th team
  const fourthTeam = await createTestTeam();

  await expect(
    teamService.joinTeam(student.id, fourthTeam.id)
  ).rejects.toThrow('Maximum active teams limit reached (3)');
});
```

### Test 3: Cálculo de Contribuciones

```typescript
test('System calculates contributions correctly', async () => {
  const team = await createTestTeam();
  const project = await createTestProject(team.id);

  // María: 2 entregables, 10 comentarios
  await contributionService.recordDeliverable(project.id, 'maria-id');
  await contributionService.recordDeliverable(project.id, 'maria-id');
  await contributionService.recordComments(project.id, 'maria-id', 10);

  // Juan: 1 entregable, 5 comentarios
  await contributionService.recordDeliverable(project.id, 'juan-id');
  await contributionService.recordComments(project.id, 'juan-id', 5);

  const contributions = await contributionService.calculateContributions(project.id);

  expect(contributions['maria-id']).toBeCloseTo(66.67, 1); // ~66.67%
  expect(contributions['juan-id']).toBeCloseTo(33.33, 1);  // ~33.33%
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `social_features.teams` - Definición de equipos
- `social_features.team_members` - Membresía de equipos
- `social_features.team_invitations` - Invitaciones/solicitudes
- `social_features.collaborative_projects` - Proyectos colaborativos
- `social_features.project_deliverables` - Entregables de proyectos
- `social_features.member_contributions` - Contribuciones individuales
- `social_features.team_achievements` - Achievements de equipo

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-SOC-002: Equipos Colaborativos](../../02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-002-equipos-colaborativos.md)

### Documentos Relacionados

- [RF-SOC-001: Aulas Virtuales](./RF-SOC-001-aulas-virtuales.md) - Sistema de aulas base
- [RF-SOC-003: Sistema de Amigos](./RF-SOC-003-sistema-amigos.md) - Red social entre estudiantes
- [RF-GAM-001: Achievements](../02-gamificacion/RF-GAM-001-achievements.md) - Sistema de achievements

---

## 📝 Notas de Implementación

### Consideraciones Pedagógicas

1. **Tamaño Óptimo de Equipo:** 3-5 miembros (investigación muestra mejor colaboración)
2. **Evaluación Diferenciada:** Importante para evitar "free riders"
3. **Tracking de Contribuciones:** Debe ser objetivo y transparente
4. **Formación de Equipos:** Balancear entre auto-selección y asignación del maestro

### Escalabilidad

- Los chats de equipo usan WebSocket para mensajería en tiempo real
- Las contribuciones se calculan de forma incremental (no batch al final)
- Los rankings se actualizan usando vistas materializadas (refresh diario)

### Accesibilidad

- Los equipos deben tener nombres descriptivos para lectores de pantalla
- Las notificaciones de equipo deben ser accesibles vía email para estudiantes sin acceso constante

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Pedagógico, Product Owner
**Próxima revisión:** 2026-01-07
