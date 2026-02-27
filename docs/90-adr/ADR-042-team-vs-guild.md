---
titulo: "ADR-042: Team vs Guild Terminology"
tipo: adr
fecha_creacion: "2025-11-07"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-042: Team vs Guild Terminology

**Estado:** Aceptada
**Fecha**: 2025-11-07
**Contexto**: Discrepancia P0-4 identificada durante validación Fase 1

---

## Contexto

Durante la validación exhaustiva del código contra la documentación, se identificó una inconsistencia semántica:

- **Documentación** (`/docs`): Usa consistentemente los términos "Guild" y "GuildMember"
- **Implementación** (`/src/modules/social`): Usa los términos "Team" y "TeamMember"

Esta discrepancia afecta:
- Entidades de base de datos (`teams`, `team_members`)
- DTOs y tipos de TypeScript
- Comentarios y documentación inline
- Nomenclatura de APIs

---

## Decisión

**Se adopta el término "Team" como estándar oficial** en lugar de "Guild".

---

## Justificación

### 1. **Claridad y Simplicidad**

- **"Team"** es un término más universal y claro:
  - Familiar para usuarios no-gamers
  - Usado comúnmente en contextos educativos
  - Menos ambiguo que "Guild" (que tiene connotaciones de juegos MMORPG)

- **"Guild"** tiene connotaciones específicas:
  - Asociado principalmente con videojuegos (WoW, RPGs)
  - Puede confundir a educadores y administradores
  - Menos apropiado en contexto educativo formal

### 2. **Alineación con Contexto Educativo**

Gamilit es una plataforma educativa con gamificación, no un juego puro:
- Los educadores hablan de "equipos de estudio"
- Los administradores gestionan "grupos de trabajo"
- "Team" se integra mejor con terminología académica

### 3. **Código Ya Implementado**

La implementación actual usa "Team" en:
- 3 entidades TypeORM (`Team`, `TeamMember`, `TeamInvite`)
- Múltiples servicios y controllers
- Endpoints de API (`/api/teams/*`)
- Tablas de base de datos (`social_features.teams`)

Cambiar a "Guild" requeriría:
- Refactoring masivo de código
- Migración de base de datos
- Actualización de APIs (breaking changes)
- Re-testing completo

**Costo estimado**: 20+ horas de desarrollo
**Riesgo**: Alto (posibles bugs en migración)

### 4. **Compatibilidad Frontend**

El frontend ya puede estar usando "teams" en:
- Componentes React
- Store/State management
- Llamadas a API
- Mensajes de UI

Cambiar el backend a "Guild" crearía mayor inconsistencia.

### 5. **Internacionalización (i18n)**

"Team" se traduce fácilmente a múltiples idiomas:
- Español: "Equipo"
- Inglés: "Team"
- Francés: "Équipe"

"Guild" es más difícil de traducir apropiadamente en contexto educativo.

---

## Consecuencias

### Positivas ✅

1. **Terminología consistente** en código implementado
2. **Menor deuda técnica** (no requiere refactoring)
3. **Mejor UX** para audiencia educativa
4. **Facilita i18n** con términos estándar
5. **Reduce confusión** entre developers

### Negativas ❌

1. **Requiere actualizar documentación** (`/docs`) para usar "Team"
2. **Posible confusión temporal** si docs no se actualizan
3. **Divergencia inicial** con especificaciones originales

---

## Plan de Acción

### Inmediato (P0)

- [x] Crear este ADR documentando la decisión
- [x] Actualizar comentarios en entities para clarificar
- [ ] Crear issue para actualizar docs (`/docs`)

### Corto Plazo (P1)

- [ ] Actualizar `/docs/20-architecture/TYPES-SOCIAL.md`
  - Reemplazar "Guild" → "Team"
  - Reemplazar "GuildMember" → "TeamMember"
- [ ] Actualizar `/docs/20-architecture/SOCIAL-SCHEMAS.md`
  - Actualizar esquemas de base de datos
  - Actualizar ejemplos de API
- [ ] Actualizar `/docs/01-requerimientos/casos-uso/`
  - Reemplazar referencias a "Guild" en user stories

### Mediano Plazo (P2)

- [ ] Crear glosario de términos oficiales
- [ ] Agregar a style guide del proyecto
- [ ] Training para developers sobre terminología estándar

---

## Mapping de Términos

| Documentación (Old) | Código (Current) | Uso |
|---------------------|------------------|-----|
| Guild | Team | Entidad principal de equipo |
| GuildMember | TeamMember | Miembro de un equipo |
| GuildInvite | TeamInvite | Invitación a equipo |
| guild_id | team_id | ID de equipo |
| guildName | teamName | Nombre del equipo |
| guildRole | teamRole | Rol dentro del equipo |

---

## Ejemplos de Código

### Entidad (Correcto)

```typescript
/**
 * Team Entity
 *
 * Representa un equipo de colaboración/competencia entre estudiantes.
 * Los equipos pueden estar asociados a un classroom o ser independientes.
 *
 * @table social_features.teams
 * @note Anteriormente referenciado como "Guild" en documentación legacy
 */
@Entity({ schema: 'social_features', name: 'teams' })
export class Team {
  @Column('text')
  name: string;

  @Column('integer', { name: 'max_members', default: 5 })
  maxMembers: number;
}
```

### API Endpoint (Correcto)

```typescript
@Controller('api/teams')
export class TeamsController {
  @Post()
  async createTeam(@Body() dto: CreateTeamDto) {
    // ...
  }

  @Get(':teamId/members')
  async getTeamMembers(@Param('teamId') teamId: string) {
    // ...
  }
}
```

---

## Referencias

- **Issue**: Discrepancia P0-4 - Reporte Final Fase 1
- **Archivos Afectados**:
  - `/src/modules/social/entities/team.entity.ts`
  - `/src/modules/social/entities/team-member.entity.ts`
  - `/src/modules/social/services/teams.service.ts`
  - `/src/modules/social/controllers/teams.controller.ts`
- **Docs a Actualizar**:
  - `/docs/20-architecture/TYPES-SOCIAL.md`
  - `/docs/20-architecture/SOCIAL-SCHEMAS.md`
  - `/docs/01-requerimientos/casos-uso/student/`

---

## Revisiones

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-11-07 | Decisión inicial - Team sobre Guild | Claude Code (Sonnet 4.5) |

---

## Notas

- Este ADR debe ser revisado con el equipo de producto
- Si hay fuerte preferencia por "Guild" en UX research, se puede reconsiderar
- La decisión es reversible pero costosa (requiere migración completa)

---

**Aprobado por**: Backend Lead (pendiente)
**Revisión siguiente**: Q1 2026 (post-launch user feedback)
