# ET-GAM-006: Narrative System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-006 |
| **Modulo** | Gamificacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 45% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-GAM-006: Narrative Progression System

### User Stories
- US-GAM-006: Story-Driven Learning Experience

---

## Descripcion Funcional

El sistema narrativo integra elementos de historia en la experiencia de aprendizaje:
- Narrativa Maya como tema central
- Personajes que guian al estudiante
- Arcos narrativos por modulo
- Dialogos contextuales
- Cutscenes en momentos clave
- Lore desbloqueables como recompensa

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - NarrativeProvider                                      |
|  - DialogueBox                                            |
|  - CharacterAvatar                                        |
|  - CutscenePlayer                                         |
|  - LoreViewer                                             |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (PARCIAL) ModulesService                              |
|  - (FALTANTE) NarrativeService                           |
|  - (FALTANTE) LoreService                                |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - educational_content.modules (narrative_data)          |
|  - (FALTANTE) gamification_system.unlocked_lore          |
|  - (FALTANTE) gamification_system.story_progress         |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Contenido Narrativo en Modulos

**Ubicacion:** `apps/backend/src/modules/educational/entities/module.entity.ts`

**Estado:** PARCIAL (50%)

```typescript
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'modules' })
export class Module {
  // ... campos base

  /**
   * Datos narrativos del modulo (JSON)
   * Incluye: titulo_narrativo, personaje_guia, descripcion_lore
   */
  @Column({ type: 'jsonb', nullable: true })
  narrative_data?: {
    title: string;           // Titulo narrativo (ej: "El Templo del Conocimiento")
    guide_character: string; // Personaje guia (ej: "Ixchel")
    lore_description: string; // Descripcion de lore
    intro_dialogue: string[];  // Dialogos de introduccion
    completion_dialogue: string[]; // Dialogos al completar
  };
}
```

### Seeds Narrativos

**Ubicacion:** `apps/database/seeds/dev/educational_content/01-modules.sql`

**Estado:** PARCIAL (50%)

```sql
INSERT INTO educational_content.modules (id, title, narrative_data, ...)
VALUES (
  'M1',
  'Modulo 1: Descubriendo los Tesoros Ocultos',
  '{
    "title": "El Templo del Conocimiento Primordial",
    "guide_character": "ixchel",
    "lore_description": "En las profundidades del templo ancestral, Ixchel guarda los secretos de la lectura...",
    "intro_dialogue": [
      "Bienvenido, joven explorador.",
      "Soy Ixchel, guardiana de este templo sagrado.",
      "Aqui aprenderas a descifrar los antiguos textos..."
    ],
    "completion_dialogue": [
      "Has demostrado gran sabiduria.",
      "Los secretos del primer nivel son ahora tuyos.",
      "Pero el camino continua hacia templos mas profundos..."
    ]
  }',
  ...
);
```

### Frontend - Personajes Maya

**Ubicacion:** `apps/frontend/src/features/gamification/ranks/components/ProgressTimeline.tsx`

**Estado:** PARCIAL (40%)

Los rangos Maya (Ajaw, Nacom, etc.) tienen iconografia y narrativa asociada.

---

## Lo que Falta para Completar (55%)

### 1. NarrativeService Backend (15%)

```typescript
// services/narrative.service.ts (NUEVO)
@Injectable()
export class NarrativeService {
  /**
   * Obtiene contexto narrativo del modulo actual
   */
  async getModuleNarrative(moduleId: string): Promise<NarrativeContext>;

  /**
   * Obtiene dialogo segun evento
   */
  async getDialogue(
    event: NarrativeEvent,
    context: NarrativeContext
  ): Promise<Dialogue[]>;

  /**
   * Registra progreso narrativo
   */
  async trackNarrativeProgress(
    userId: string,
    event: NarrativeEvent
  ): Promise<void>;

  /**
   * Obtiene cutscene si aplica
   */
  async getCutscene(
    trigger: CutsceneTrigger
  ): Promise<Cutscene | null>;
}

interface NarrativeContext {
  moduleId: string;
  moduleTitle: string;
  guideCharacter: Character;
  loreDescription: string;
  currentArc: string;
}

interface Dialogue {
  characterId: string;
  text: string;
  emotion: 'neutral' | 'happy' | 'thinking' | 'surprised';
  animation?: string;
}

type NarrativeEvent =
  | 'module_start'
  | 'module_complete'
  | 'achievement_unlocked'
  | 'rank_promotion'
  | 'first_perfect_score'
  | 'streak_milestone';
```

### 2. LoreService Backend (10%)

```typescript
// services/lore.service.ts (NUEVO)
@Injectable()
export class LoreService {
  /**
   * Lista lore desbloqueado por usuario
   */
  async getUnlockedLore(userId: string): Promise<LoreEntry[]>;

  /**
   * Desbloquea nuevo lore
   */
  async unlockLore(
    userId: string,
    loreId: string
  ): Promise<LoreEntry>;

  /**
   * Obtiene todo el lore del juego
   */
  async getAllLore(): Promise<LoreEntry[]>;

  /**
   * Progreso de coleccion de lore
   */
  async getLoreProgress(userId: string): Promise<LoreProgress>;
}

interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'maya_history' | 'character' | 'location' | 'artifact';
  unlockCondition: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  iconUrl: string;
}
```

### 3. Frontend Components (20%)

```typescript
// components/DialogueBox.tsx (NUEVO)
interface DialogueBoxProps {
  dialogues: Dialogue[];
  character: Character;
  onComplete?: () => void;
  autoAdvance?: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps>;

// components/CharacterAvatar.tsx (NUEVO)
interface CharacterAvatarProps {
  character: Character;
  emotion: string;
  size: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps>;

// components/LoreViewer.tsx (NUEVO)
interface LoreViewerProps {
  lore: LoreEntry[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const LoreViewer: React.FC<LoreViewerProps>;
```

### 4. Database Schema (10%)

```sql
-- tables/story_progress.sql (NUEVO)
CREATE TABLE gamification_system.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  current_arc TEXT NOT NULL DEFAULT 'intro',
  events_triggered JSONB NOT NULL DEFAULT '[]',
  cutscenes_viewed JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tables/unlocked_lore.sql (NUEVO)
CREATE TABLE gamification_system.unlocked_lore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  lore_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lore_id)
);
```

---

## Personajes del Sistema

| Personaje | Rol | Modulos | Descripcion |
|-----------|-----|---------|-------------|
| Ixchel | Guia M1-M2 | 1, 2 | Diosa de la medicina y la luna |
| Kukulkan | Guia M3 | 3 | Serpiente emplumada, dios del viento |
| Chaac | Guia M4 | 4 | Dios de la lluvia |
| Itzamna | Guia M5 | 5 | Dios supremo, creador |

---

## Criterios de Aceptacion

### Funcionales
- [x] Modulos tienen datos narrativos
- [x] Rangos Maya tienen iconografia tematica
- [ ] Dialogos se muestran al iniciar modulo
- [ ] Cutscenes en momentos clave
- [ ] Lore desbloqueable como recompensa
- [ ] Galeria de lore coleccionado

### No Funcionales
- [ ] Dialogos skippeables
- [ ] Audio para dialogos (futuro)
- [ ] Animaciones de personajes

---

## Dependencias

### Bloqueado Por
- Module Entity (COMPLETO)
- Achievement System (COMPLETO)
- Rank System (COMPLETO)

### Bloquea
- Story Mode
- Character Customization
- Narrative Branches

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| NarrativeService | 8h |
| LoreService | 5h |
| Database Schema | 3h |
| Frontend Components | 12h |
| Content Creation | 10h |
| Tests | 4h |
| **Total** | **42h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-006-narrative.md*
*Generado: 2026-01-27*
