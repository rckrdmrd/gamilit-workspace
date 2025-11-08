# GAMILIT Frontend Features Inventory

This document provides a complete inventory of all frontend features in the GAMILIT platform, organized by SIMCO module.

## Quick Access

Generated: 2025-11-08
Files included in this inventory:

1. **FRONTEND_FEATURES_INVENTORY.json** - Full detailed inventory with all file paths
2. **FRONTEND_FEATURES_SUMMARY.json** - Summary with aggregated statistics
3. **FRONTEND_FEATURES_STRUCTURED.json** - Clean, well-structured JSON format
4. **FRONTEND_FEATURES_INVENTORY.md** - Human-readable markdown documentation
5. **FRONTEND_FEATURES_README.md** - This file

## Overview

### Statistics

| Metric | Count |
|--------|-------|
| Total Modules | 6 |
| Total Features | 44 |
| Total Components | 154 |
| Total Type Files | 35 |
| Total Schema Files | 24 |
| Total Mock Data Files | 30 |

### By SIMCO Module

| Module | Modules | Features | Components | Types | Schemas | Mock Data |
|--------|---------|----------|------------|-------|---------|-----------|
| **AUTH** | 1 | 3 | 13 | 0 | 1 | 0 |
| **EDU** | 3 | 35 | 68 | 27 | 20 | 22 |
| **GAM** | 1 | 5 | 71 | 8 | 3 | 8 |
| **NOT** | 1 | 1 | 2 | 0 | 0 | 0 |

## Module Descriptions

### AUTH - Authentication & Authorization
- **Location:** `/apps/frontend/src/features/auth/`
- **Components:** 13
- **Key Features:**
  - User login/registration forms
  - Password strength validation
  - Session management
  - Permission matrix
  - Security event logging
  - Two-factor authentication support

### EDU - Education & Learning
- **Location:** `/apps/frontend/src/features/exercises/` and `/apps/frontend/src/features/mechanics/`
- **Components:** 68
- **Submodules:**
  - **Exercises** (8 components) - Generic activity types
  - **Mechanics** (60 components) - Complex learning interactions
    - Module 1: Basic concepts (7 mechanics)
    - Module 2: Comprehension & analysis (5 mechanics)
    - Module 3: Critical thinking (5 mechanics)
    - Module 4: Creation & argumentation (8 mechanics)
    - Module 5: Multimedia production (3 mechanics)
    - Auxiliar: Supporting mechanics (4)

### GAM - Gamification
- **Location:** `/apps/frontend/src/features/gamification/`
- **Components:** 71
- **Submodules:**
  - **Social** (42 components) - Achievements, friends, guilds, leaderboards, power-ups
  - **Ranks** (8 components) - Maya-themed rank system with prestige
  - **Economy** (12 components) - Wallet, shop, inventory, analytics
  - **Missions** (6 components) - Challenge and reward system
  - **Leaderboard** (1 component) - Live leaderboard display
  - **Streak** (1 component) - Activity streak tracking

### NOT - Notifications
- **Location:** `/apps/frontend/src/features/notifications/`
- **Components:** 2
- **Features:**
  - Notification bell with unread count
  - Notification dropdown with history

## File Organization

### Standard Patterns

Files follow these naming conventions:

- **Components:** `*Exercise.tsx` or `*[Name].tsx`
- **Type Definitions:** `*Types.ts`
- **Validation Schemas:** `*Schemas.ts` (using Zod)
- **Mock Data:** `*MockData.ts`

### Directory Structures

Features use two common organization patterns:

**Pattern 1: Feature-scoped structure**
```
feature/
├── [FeatureName]Exercise.tsx
├── [FeatureName]Types.ts
├── [FeatureName]Schemas.ts
├── [FeatureName]MockData.ts
├── SubComponent1.tsx
└── SubComponent2.tsx
```

**Pattern 2: Directory-based structure**
```
feature/
├── components/
│   ├── [FeatureName]Exercise.tsx
│   └── SubComponent.tsx
├── types/
│   └── [FeatureName]Types.ts
├── schemas/
│   └── [FeatureName]Schemas.ts
└── mockData/
    └── [FeatureName]MockData.ts
```

## Mechanics Breakdown

### Module 1 - Basic Concepts (7 mechanics)
Learning foundational concepts through:
- VerdaderoFalso (True/False statements)
- Crucigrama (Crossword puzzles)
- Emparejamiento (Matching pairs)
- MapaConceptual (Concept maps)
- SopaLetras (Word search)
- Timeline (Chronological ordering)
- CompletarEspacios (Fill in blanks)

### Module 2 - Comprehension & Analysis (5 mechanics)
Reading comprehension and analytical thinking:
- DetectiveTextual (Text investigation)
- RuedaInferencias (Inference wheel)
- ConstruccionHipotesis (Hypothesis construction)
- PrediccionNarrativa (Narrative prediction)
- PuzzleContexto (Contextual puzzle)

### Module 3 - Critical Thinking (5 mechanics)
Developing critical analysis skills:
- AnalisisFuentes (Source analysis)
- DebateDigital (Digital debate)
- MatrizPerspectivas (Perspective matrix)
- PodcastArgumentativo (Argumentative podcast)
- TribunalOpiniones (Opinion tribunal)

### Module 4 - Creation & Argumentation (8 mechanics)
Constructing arguments and creating content:
- VerificadorFakeNews (Fake news verification)
- InfografiaInteractiva (Interactive infographics)
- NavegacionHipertextual (Hypertext navigation)
- QuizTikTok (TikTok-style quiz)
- AnalisisMemes (Meme analysis)
- ChatLiterario (Literary chat)
- EmailFormal (Formal email writing)
- EnsayoArgumentativo (Argumentative essay)
- ResenaCritica (Critical review)

### Module 5 - Multimedia Production (3 mechanics)
Creating multimedia content:
- ComicDigital (Digital comics)
- DiarioMultimedia (Multimedia diary)
- VideoCarta (Video letters)

## Feature Completeness

### Complete Features (with Types + Schemas + Mock Data)
- VerdaderoFalso, Crucigrama, Emparejamiento, MapaConceptual
- SopaLetras, Timeline
- ConstruccionHipotesis, DetectiveTextual
- VerificadorFakeNews, InfografiaInteractiva
- NavegacionHipertextual, QuizTikTok, AnalisisMemes

### Partial Features (missing some files)
- CompletarEspacios (no schema)
- Module 4 features: ChatLiterario, EmailFormal, EnsayoArgumentativo, ResenaCritica (minimal)
- MatrizPerspectivas (no component file)

### Minimal Features (component only)
- 4 Auxiliar mechanics
- Module 5: ComicDigital, DiarioMultimedia, VideoCarta
- Notifications: NotificationBell, NotificationDropdown

## Using the Inventory

### For Development
Use `FRONTEND_FEATURES_STRUCTURED.json` as a reference when:
- Adding new features or mechanics
- Understanding the feature tree structure
- Planning dependencies between features

### For Documentation
Use `FRONTEND_FEATURES_INVENTORY.md` for:
- Human-readable feature overview
- Architecture insights
- Understanding feature relationships

### For Analysis
Use `FRONTEND_FEATURES_INVENTORY.json` for:
- Complete file-level details
- Exact file paths
- Component discovery
- Bulk analysis

## Integration with Backend

The frontend features align with the SIMCO module taxonomy used in the backend:
- **AUTH:** User authentication and authorization
- **EDU:** Educational content and exercises
- **GAM:** Gamification and rewards
- **NOT:** User notifications
- **SOC:** Social features (integrated in GAM)
- **ADM:** Admin features (minimal frontend)
- **CNT:** Content management (minimal frontend)

## Notes

- Total of 130+ mechanics files (components + types + schemas + mock data)
- Consistent naming conventions across all features
- Well-structured with clear separation of concerns
- Mock data available for testing and development
- TypeScript-first approach with strong typing
- Zod schemas for runtime validation

---

For detailed information about individual features, refer to `FRONTEND_FEATURES_INVENTORY.md` or examine the structured JSON files.
