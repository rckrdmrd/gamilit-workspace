# RF-GAM-003: Sistema de Rangos Maya

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-GAM-003 |
| **Módulo** | 02 - Gamificación |
| **Título** | Sistema de Rangos Maya |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team |
| **Stakeholders** | Product Owner, UX Team, Backend Team, Frontend Team, Cultural Advisor |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- **Tipo:** `gamification_system.maya_rank`
- **Valores:** `Ajaw`, `Nacom`, `Ah K'in`, `Halach Uinic`, `K'uk'ulkan`

**Nota cultural:** Los nombres de rangos se escriben con ortografía moderna maya yucateca. Cada rango representa un nivel jerárquico histórico de la civilización maya.

🗄️ **Tablas Relacionadas:**
1. **`gamification_system.user_stats`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/user_stats.sql`
   - **Columnas clave:**
     - `current_rank` (ENUM maya_rank, DEFAULT 'Ajaw')
     - `total_xp` (INTEGER, para calcular promociones)
     - `rank_achieved_at` (TIMESTAMPTZ)
     - `previous_rank` (ENUM maya_rank, nullable)

2. **`gamification_system.rank_history`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/tables/rank_history.sql`
   - **Propósito:** Historial completo de promociones de rango
   - **Columnas clave:**
     - `user_id` (UUID)
     - `old_rank` (ENUM maya_rank)
     - `new_rank` (ENUM maya_rank)
     - `xp_at_promotion` (INTEGER)
     - `promoted_at` (TIMESTAMPTZ)

🗄️ **Funciones SQL:**
1. **`check_rank_promotion(user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql`
   - **Propósito:** Verificar si usuario califica para promoción
   - **Retorno:** BOOLEAN (true si promovido)

2. **`promote_to_next_rank(user_id UUID)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
   - **Propósito:** Promover usuario al siguiente rango
   - **Side effects:**
     - Actualizar `current_rank` en `user_stats`
     - Crear achievement `rank_promotion`
     - Registrar en `rank_history`
     - Enviar notificación `rank_up`

3. **`get_rank_benefits(rank maya_rank)`**
   - **Ubicación:** `apps/database/ddl/schemas/gamification_system/functions/get_rank_benefits.sql`
   - **Propósito:** Obtener beneficios del rango
   - **Retorno:** JSONB con permisos y bonuses

🗄️ **Trigger:**
- **`trg_check_rank_promotion_on_xp_gain`**
  - **Ubicación:** `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion.sql`
  - **Tabla:** `gamification_system.user_stats`
  - **Evento:** AFTER UPDATE OF `total_xp`
  - **Acción:** Llamar a `check_rank_promotion(user_id)`

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-GAM-003: Implementación del Sistema de Rangos Maya](../../02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md)

### Documentos Relacionados

- [RF-GAM-001: Sistema de Achievements](./RF-GAM-001-achievements.md) - Achievement `rank_promotion`
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Acumulación de XP
- [RF-NOT-001: Tipos de Notificaciones](../06-notificaciones/RF-NOT-001-tipos-notificaciones.md) - Notificación `rank_up`
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-2-gamificación)

### ADRs

- [ADR-007: Elección de Rangos Maya vs Niveles Numéricos](../../02-especificaciones-tecnicas/adr/ADR-007-rangos-maya.md)
  - **Decisión:** Usar jerarquía maya auténtica en lugar de "Nivel 1, 2, 3..."
  - **Razón:** Conexión cultural, identidad, prestigio

---

## 📖 Descripción General

### Propósito

El **Sistema de Rangos Maya** es un sistema de progresión jerárquico que reconoce el avance de los estudiantes mediante títulos inspirados en la civilización maya. A medida que los usuarios acumulan **XP (Experiencia)**, desbloquean rangos más prestigiosos que:

- Dan identidad cultural y sentido de pertenencia
- Reconocen visualmente el nivel de maestría
- Desbloquean beneficios progresivos
- Crean motivación a largo plazo

### Contexto Cultural

Los rangos se basan en la jerarquía histórica de la civilización maya clásica (250-900 d.C.):

| Rango Maya | Rol Histórico | Nivel en Gamilit |
|------------|---------------|------------------|
| **Ajaw** | Señor local, noble menor | Iniciante |
| **Nacom** | Capitán guerrero, líder militar | Intermedio bajo |
| **Ah K'in** | Sacerdote, guardián del conocimiento | Intermedio alto |
| **Halach Uinic** | Hombre verdadero, gobernante de ciudad | Avanzado |
| **K'uk'ulkan** | Serpiente emplumada, deidad del conocimiento | Maestro |

**Consultoría Cultural:** Nombres y significados validados con asesor cultural maya para asegurar respeto y precisión.

### Alcance

**Incluye:**
- ✅ 5 rangos progresivos basados en XP
- ✅ Umbrales definidos de XP para cada rango
- ✅ Promoción automática al alcanzar umbral
- ✅ Badges visuales únicos por rango
- ✅ Beneficios progresivos (permisos, bonuses)
- ✅ Historial completo de promociones
- ✅ Achievement especial al promover
- ✅ Notificación celebrando promoción

**Excluye:**
- ❌ Degradación de rango (solo ascenso)
- ❌ Compra de rangos con ML Coins
- ❌ Rangos especiales para eventos
- ❌ Subniveles dentro de cada rango

---

## ⚙️ Requerimientos Funcionales

### 1. Jerarquía de Rangos

#### Rango 1: Ajaw (Señor) 🌱

**Umbral:** 0 - 499 XP
**Estado:** Rango inicial (todos empiezan aquí)

**Significado histórico:**
> "Ajaw" era un título nobiliario para señores locales. Representa el inicio del camino del conocimiento.

**Características:**
- Rango predeterminado al crear cuenta
- Sin requisitos previos
- Acceso a funcionalidades básicas

**Badge visual:**
```
┌─────────┐
│   🌱    │  Semilla del conocimiento
│  AJAW   │
└─────────┘
```

**Beneficios:**
- Acceso completo a ejercicios básicos
- Puede unirse a aulas
- Puede usar comodines básicos

---

#### Rango 2: Nacom (Capitán Guerrero) ⚔️

**Umbral:** 500 - 999 XP
**Requisito:** Ganar 500 XP

**Significado histórico:**
> "Nacom" era el capitán de guerra elegido por 3 años. Representa disciplina y consistencia en el aprendizaje.

**Características:**
- Primer gran hito de progresión
- Demuestra compromiso con la plataforma

**Badge visual:**
```
┌─────────┐
│   ⚔️    │  Guerrero del aprendizaje
│  NACOM  │
└─────────┘
```

**Beneficios:**
- Desbloquea ejercicios de dificultad media-alta
- +10% bonus en XP ganado por ejercicio
- Puede crear equipos de estudio
- Avatar frame especial "Nacom"

**Recompensa de promoción:**
- Achievement: "Ascenso a Nacom"
- 100 ML Coins bonus
- Notificación especial con animación

---

#### Rango 3: Ah K'in (Sacerdote del Sol) ☀️

**Umbral:** 1,000 - 1,499 XP
**Requisito:** Ganar 1,000 XP

**Significado histórico:**
> "Ah K'in" era un sacerdote, guardián del calendario y del conocimiento astronómico. Representa sabiduría y dominio.

**Características:**
- Rango intermedio-alto
- Solo ~20% de usuarios activos lo alcanzan

**Badge visual:**
```
┌─────────┐
│   ☀️    │  Guardián del conocimiento
│ AH K'IN │
└─────────┘
```

**Beneficios:**
- +15% bonus en XP ganado
- Desbloquea ejercicios avanzados
- Puede ser tutor de estudiantes Ajaw/Nacom
- Acceso a "Biblioteca Avanzada" (contenido exclusivo)
- Avatar frame "Ah K'in" con efectos dorados

**Recompensa de promoción:**
- Achievement: "Ascenso a Ah K'in"
- 250 ML Coins bonus
- Título especial en perfil público
- Certificado digital descargable

---

#### Rango 4: Halach Uinic (Hombre Verdadero) 👑

**Umbral:** 1,500 - 2,249 XP
**Requisito:** Ganar 1,500 XP

**Significado histórico:**
> "Halach Uinic" significa "Hombre Verdadero", título del gobernante supremo de una ciudad-estado maya. Representa liderazgo y maestría.

**Características:**
- Rango avanzado, elite
- Solo ~5% de usuarios activos lo alcanzan
- Reconocimiento público en plataforma

**Badge visual:**
```
┌─────────────┐
│     👑      │  Gobernante del saber
│ HALACH UINIC│
└─────────────┘
```

**Beneficios:**
- +20% bonus en XP ganado
- Acceso a "Desafíos de Maestría" (contenido experto)
- Puede crear aulas como maestro invitado
- Aparece en "Hall of Fame" de la plataforma
- Avatar frame animado "Halach Uinic"
- Badge especial en foros y comentarios

**Recompensa de promoción:**
- Achievement: "Ascenso a Halach Uinic"
- 500 ML Coins bonus
- Mención en newsletter mensual
- Entrevista opcional para blog de Gamilit

---

#### Rango 5: K'uk'ulkan (Serpiente Emplumada) 🐉

**Umbral:** 2,250+ XP
**Requisito:** Ganar 2,250 XP

**Significado histórico:**
> "K'uk'ulkan" (Kukulkán en español) es la deidad maya asociada con el conocimiento, el viento y el planeta Venus. Equivalente a Quetzalcóatl. Representa la máxima sabiduría y trascendencia.

**Características:**
- Rango legendario
- Solo ~1% de usuarios lo alcanzan
- Máximo prestigio en la comunidad

**Badge visual:**
```
┌──────────────┐
│      🐉      │  Deidad del conocimiento
│  K'UK'ULKAN  │
└──────────────┘
```

**Beneficios:**
- +25% bonus en XP ganado
- Acceso a contenido exclusivo experimental (beta features)
- Puede participar en creación de contenido (contribuir ejercicios)
- Sesiones de mentoría 1:1 con equipo pedagógico
- Avatar frame épico animado "K'uk'ulkan"
- Badge legendario con efectos especiales
- Nombre en placa de honor permanente
- Acceso a comunidad privada de K'uk'ulkan

**Recompensa de promoción:**
- Achievement: "Ascenso a K'uk'ulkan"
- 1,000 ML Coins bonus
- Certificado físico enviado por correo
- Reconocimiento en redes sociales oficiales
- Invitación a eventos presenciales de Gamilit

---

### 2. Umbrales de XP

#### Tabla de Umbrales

| Rango | Umbral XP Mínimo | Umbral XP Máximo | XP Requerido para Promover |
|-------|------------------|------------------|----------------------------|
| Ajaw | 0 | 499 | 500 |
| Nacom | 500 | 999 | 1,000 |
| Ah K'in | 1,000 | 1,499 | 1,500 |
| Halach Uinic | 1,500 | 2,249 | 2,250 |
| K'uk'ulkan | 2,250 | ∞ | - (rango final) |

#### Progresión de Dificultad

**Diseño intencional:** Los umbrales crecen exponencialmente para:

1. **Rápida gratificación inicial** (Ajaw → Nacom en ~50 ejercicios)
2. **Progresión sostenida** (Nacom → Ah K'in requiere compromiso)
3. **Objetivo a largo plazo** (K'uk'ulkan es aspiracional)

**Tiempo estimado para alcanzar:**

| Rango | Ejercicios (~20 XP/ej) | Tiempo (estudiante activo 5 ej/día) |
|-------|------------------------|--------------------------------------|
| Nacom | ~25 ejercicios | 5 días |
| Ah K'in | ~50 ejercicios | 10 días |
| Halach Uinic | ~75 ejercicios | 15 días |
| K'uk'ulkan | ~113 ejercicios | 23 días (~3 semanas) |

---

### 3. Mecánica de Promoción

#### Flujo de Promoción Automática

```
Usuario gana XP (completa ejercicio)
        ↓
    total_xp += xp_earned
        ↓
Trigger: trg_check_rank_promotion_on_xp_gain
        ↓
    ┌────────────────────────────────┐
    │ check_rank_promotion(user_id) │
    └────────────┬───────────────────┘
                 ↓
    ┌────────────────────────────────┐
    │ ¿total_xp >= próximo umbral?  │
    └────────────┬───────────────────┘
                 ↓ Sí
    ┌────────────────────────────────┐
    │ promote_to_next_rank(user_id) │
    │ - Actualizar current_rank      │
    │ - Crear achievement            │
    │ - Registrar en rank_history    │
    │ - Otorgar ML Coins bonus       │
    │ - Enviar notificación          │
    └────────────┬───────────────────┘
                 ↓
    ┌────────────────────────────────┐
    │ Frontend muestra modal celebra │
    │ "¡Ascendiste a Nacom!"         │
    └────────────────────────────────┘
```

#### Validaciones de Promoción

| Validación | Condición | Acción |
|------------|-----------|--------|
| **Umbral alcanzado** | `total_xp >= next_rank_threshold` | Promover |
| **Ya en rango máximo** | `current_rank = 'K'uk'ulkan'` | No promover, es final |
| **Cuenta activa** | `profile.status = 'active'` | Solo cuentas activas |
| **Sin promoción duplicada** | Verificar último registro en `rank_history` | Evitar double promotion |

---

### 4. Beneficios por Rango

#### 4.1. Bonus de XP

Cada rango otorga un multiplicador de XP permanente:

| Rango | Multiplicador XP | Ejemplo |
|-------|------------------|---------|
| Ajaw | 1.00x | 20 XP → 20 XP |
| Nacom | 1.10x (+10%) | 20 XP → 22 XP |
| Ah K'in | 1.15x (+15%) | 20 XP → 23 XP |
| Halach Uinic | 1.20x (+20%) | 20 XP → 24 XP |
| K'uk'ulkan | 1.25x (+25%) | 20 XP → 25 XP |

**Implementación:**
```sql
-- Al completar ejercicio
xp_to_award = base_xp * rank_multiplier;
```

#### 4.2. Desbloqueo de Contenido

| Contenido | Rango Requerido |
|-----------|-----------------|
| Ejercicios básicos (easy) | Ajaw |
| Ejercicios medios (medium) | Ajaw |
| Ejercicios difíciles (hard) | Nacom |
| Ejercicios expertos (expert) | Ah K'in |
| Desafíos de Maestría | Halach Uinic |
| Contenido experimental | K'uk'ulkan |

#### 4.3. Funciones Sociales

| Función | Rango Requerido |
|---------|-----------------|
| Unirse a aulas | Ajaw |
| Crear equipos de estudio | Nacom |
| Ser tutor de otros | Ah K'in |
| Crear aulas como maestro invitado | Halach Uinic |
| Contribuir ejercicios a plataforma | K'uk'ulkan |

#### 4.4. Beneficios Visuales

| Benefit | Ajaw | Nacom | Ah K'in | Halach Uinic | K'uk'ulkan |
|---------|------|-------|---------|--------------|------------|
| **Badge básico** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Avatar frame** | - | ✅ | ✅ | ✅ | ✅ |
| **Frame con efectos** | - | - | ✅ (dorado) | ✅ (animado) | ✅ (épico) |
| **Badge en comentarios** | - | - | - | ✅ | ✅ |
| **Efectos especiales** | - | - | - | - | ✅ |

---

### 5. Historial de Rangos

#### Tabla: `rank_history`

Cada promoción se registra permanentemente:

```sql
CREATE TABLE gamification_system.rank_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    old_rank gamification_system.maya_rank NOT NULL,
    new_rank gamification_system.maya_rank NOT NULL,
    xp_at_promotion INTEGER NOT NULL,
    days_in_old_rank INTEGER, -- Cuántos días estuvo en rango anterior
    promoted_at TIMESTAMPTZ DEFAULT NOW(),
    achievement_id UUID REFERENCES gamification_system.user_achievements(id)
);
```

**Propósito:**
- Tracking completo de progresión
- Análisis de retención por rango
- Verificación de integridad
- Visualización de timeline personal

---

## 💼 Casos de Uso

### CU-GAM-003-001: Promoción Automática a Nacom

**Actor:** Sistema (automático)
**Trigger:** Usuario alcanza 1,000 XP

**Precondiciones:**
- Usuario tiene `current_rank = 'Ajaw'`
- `total_xp >= 1000`
- Cuenta activa

**Flujo Principal:**

1. Usuario completa un ejercicio que le da 15 XP
2. Sistema actualiza `user_stats.total_xp`: 990 → 1005
3. Trigger `trg_check_rank_promotion_on_xp_gain` se dispara
4. Función `check_rank_promotion(user_id)` evalúa:
   ```sql
   IF total_xp >= 1000 AND current_rank = 'Ajaw' THEN
       RETURN promote_to_next_rank(user_id);
   END IF;
   ```
5. Función `promote_to_next_rank(user_id)` ejecuta:
   - Actualiza `current_rank` de 'Ajaw' a 'Nacom'
   - Crea achievement `rank_promotion` con metadata:
     ```json
     {
       "old_rank": "Ajaw",
       "new_rank": "Nacom",
       "xp": 1005
     }
     ```
   - Otorga 50 ML Coins bonus
   - Registra en `rank_history`
   - Crea notificación tipo `rank_up`:
     ```json
     {
       "type": "rank_up",
       "title": "¡Ascendiste a Nacom!",
       "body": "Eres ahora un Capitán Guerrero del conocimiento. +5% XP bonus desbloqueado.",
       "data": {
         "new_rank": "Nacom",
         "bonus_coins": 50
       }
     }
     ```
6. Frontend detecta notificación y muestra modal celebratorio:
   ```
   ┌────────────────────────────────────┐
   │          ⚔️ ¡PROMOCIÓN! ⚔️         │
   │                                    │
   │     Has ascendido a Nacom          │
   │     Capitán Guerrero               │
   │                                    │
   │  🎁 +50 ML Coins                   │
   │  ⚡ +5% Bonus XP                   │
   │  🏅 Achievement desbloqueado       │
   │                                    │
   │          [Continuar]               │
   └────────────────────────────────────┘
   ```

**Postcondiciones:**
- `user_stats.current_rank` = 'Nacom'
- `user_stats.ml_coins` += 50
- `rank_history` contiene nuevo registro
- `user_achievements` contiene achievement `rank_promotion`
- Usuario recibe notificación

---

### CU-GAM-003-002: Ver Progreso Hacia Próximo Rango

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado
- No está en rango máximo (K'uk'ulkan)

**Flujo Principal:**

1. Usuario navega a "Mi Perfil" o "Progreso"
2. Sistema muestra componente `RankProgressBar`:
   ```
   ┌────────────────────────────────────────────┐
   │  ⚔️ NACOM                    🎯 Ah K'in   │
   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
   │  ████████████░░░░░░░░░░░░░░░░░░░░░░ 38%   │
   │                                            │
   │  3,540 / 5,000 XP                          │
   │  1,460 XP para Ah K'in                     │
   └────────────────────────────────────────────┘
   ```
3. Usuario puede hacer click para ver detalles:
   - XP total actual
   - XP requerido para próximo rango
   - Estimado de ejercicios restantes
   - Beneficios que desbloqueará

**Postcondiciones:**
- Ninguna (solo lectura)

---

### CU-GAM-003-003: Ver Historial de Promociones

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado
- Ha sido promovido al menos una vez

**Flujo Principal:**

1. Usuario navega a "Mi Perfil" → "Historial de Rangos"
2. Sistema muestra timeline de promociones:
   ```
   ┌────────────────────────────────────────────┐
   │  📜 Tu Camino Maya                         │
   │                                            │
   │  🐉 K'uk'ulkan (actual)                    │
   │  └─ 2025-10-15 • 102,450 XP               │
   │                                            │
   │  👑 Halach Uinic                           │
   │  └─ 2025-07-20 • 21,300 XP                │
   │     180 días en este rango                 │
   │                                            │
   │  ☀️ Ah K'in                                │
   │  └─ 2025-05-01 • 6,200 XP                 │
   │     80 días en este rango                  │
   │                                            │
   │  ⚔️ Nacom                                  │
   │  └─ 2025-03-15 • 1,050 XP                 │
   │     47 días en este rango                  │
   │                                            │
   │  🌱 Ajaw (inicio)                          │
   │  └─ 2025-01-27 • 0 XP                     │
   │     47 días en este rango                  │
   └────────────────────────────────────────────┘
   ```
3. Usuario puede hacer click en cada rango para ver:
   - Fecha exacta de promoción
   - XP al momento de promover
   - Tiempo en rango anterior
   - Achievement asociado

**Postcondiciones:**
- Ninguna (solo lectura)

---

### CU-GAM-003-004: Desbloquear Contenido con Rango

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado

**Flujo Principal:**

1. Usuario (rango Ajaw) navega a "Ejercicios"
2. Sistema muestra lista de ejercicios:
   ```
   ✅ Conjugación Básica (easy) - Disponible
   ✅ Números Mayas (medium) - Disponible
   🔒 Subjuntivo Avanzado (hard) - Requiere Nacom
   🔒 Literatura Maya (expert) - Requiere Ah K'in
   ```
3. Usuario hace click en ejercicio bloqueado
4. Sistema muestra modal:
   ```
   ┌────────────────────────────────────────────┐
   │  🔒 Ejercicio Bloqueado                    │
   │                                            │
   │  Este ejercicio requiere rango Nacom      │
   │  o superior.                               │
   │                                            │
   │  Tu progreso actual:                       │
   │  ━━━━━━░░░░░░░░░░░░░░░░ 25%               │
   │  250 / 1,000 XP para Nacom                 │
   │                                            │
   │  Completa 38 ejercicios más para           │
   │  desbloquear este contenido.               │
   │                                            │
   │  [Ver Ejercicios Disponibles]              │
   └────────────────────────────────────────────┘
   ```

**Flujo Alternativo 3a: Usuario alcanza Nacom**
- Usuario completa ejercicios y alcanza 1,000 XP
- Promoción a Nacom ocurre
- Usuario regresa a lista de ejercicios
- Ejercicio "Subjuntivo Avanzado" ahora está disponible ✅

**Postcondiciones:**
- Usuario entiende requisitos de rango
- Motivación para ganar más XP

---

### CU-GAM-003-005: K'uk'ulkan Contribuye Ejercicio

**Actor:** Estudiante (rango K'uk'ulkan)
**Precondiciones:**
- Usuario tiene `current_rank = 'K'uk'ulkan'`
- Cuenta verificada

**Flujo Principal:**

1. Usuario K'uk'ulkan ve opción "Contribuir Ejercicio" en menú (solo visible para K'uk'ulkan)
2. Usuario hace click y abre formulario de contribución
3. Usuario completa formulario:
   - Mecánica del ejercicio
   - Texto/pregunta
   - Respuestas correctas
   - Explicación
   - Dificultad sugerida
4. Usuario envía contribución
5. Sistema crea ticket de revisión para equipo pedagógico
6. Si aprobado:
   - Ejercicio se publica en plataforma
   - Usuario recibe 500 ML Coins bonus
   - Usuario recibe achievement especial "Creador de Contenido"
   - Nombre del usuario aparece como "Contribuido por [nombre]"

**Postcondiciones:**
- Nuevo ejercicio en revisión
- Usuario K'uk'ulkan se siente valorado
- Comunidad se beneficia

---

## 🔒 Consideraciones de Seguridad

### 1. Prevención de Manipulación

| Riesgo | Mitigación |
|--------|------------|
| **XP farming (ganar XP artificialmente)** | Rate limiting, detección de patrones sospechosos |
| **Manipulación de `total_xp`** | Campo protegido, solo modificable por funciones SQL |
| **Bypass de requisitos de rango** | Validaciones en backend y DB con RLS |
| **Promoción manual indebida** | Función `promote_to_next_rank` solo llamable por trigger automático |

### 2. Validaciones en Código

```typescript
// ❌ NUNCA confiar en current_rank del frontend
// ✅ SIEMPRE consultar desde DB

async checkContentAccess(userId: string, contentId: string) {
  // 1. Obtener rango REAL desde DB
  const userStats = await this.db.query(
    'SELECT current_rank FROM gamification_system.user_stats WHERE user_id = $1',
    [userId]
  );

  // 2. Obtener requisito de contenido
  const content = await this.contentService.findOne(contentId);

  // 3. Validar que rango actual >= rango requerido
  const rankOrder = ['Ajaw', 'Nacom', 'Ah K\'in', 'Halach Uinic', 'K\'uk\'ulkan'];
  const userRankIndex = rankOrder.indexOf(userStats.current_rank);
  const requiredRankIndex = rankOrder.indexOf(content.required_rank);

  if (userRankIndex < requiredRankIndex) {
    throw new ForbiddenException(
      `Content requires rank ${content.required_rank} or higher`
    );
  }

  return true;
}
```

### 3. Auditoría

Todas las promociones se registran en `audit_logging.audit_logs`:

```sql
INSERT INTO audit_logging.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    severity
) VALUES (
    user_id,
    'rank_promotion',
    'rank',
    new_rank::TEXT,
    jsonb_build_object(
        'old_rank', old_rank,
        'new_rank', new_rank,
        'xp_at_promotion', total_xp,
        'days_in_old_rank', days_in_old_rank
    ),
    'info'
);
```

---

## ✅ Criterios de Aceptación

### CA-GAM-003-001: Promoción Automática

- [ ] Usuario se promueve automáticamente al alcanzar umbral de XP
- [ ] Promoción ocurre inmediatamente después de ganar XP suficiente
- [ ] Solo se puede promover un rango a la vez (no saltar rangos)
- [ ] Achievement `rank_promotion` se crea correctamente
- [ ] ML Coins bonus se otorgan según rango alcanzado
- [ ] Notificación `rank_up` se envía
- [ ] Registro en `rank_history` es correcto

### CA-GAM-003-002: Umbrales de XP

- [ ] Ajaw: 0-999 XP
- [ ] Nacom: 1,000-4,999 XP
- [ ] Ah K'in: 5,000-19,999 XP
- [ ] Halach Uinic: 20,000-99,999 XP
- [ ] K'uk'ulkan: 2,250+ XP
- [ ] Usuario en K'uk'ulkan no puede promover más (es final)

### CA-GAM-003-003: Bonus de XP por Rango

- [ ] Ajaw: 1.0x (sin bonus)
- [ ] Nacom: 1.25x (+25%)
- [ ] Ah K'in: 1.25x (+25%)
- [ ] Halach Uinic: 1.25x (+25%)
- [ ] K'uk'ulkan: 1.25x (+25%)
- [ ] Bonus se aplica correctamente en cada ejercicio completado

### CA-GAM-003-004: Desbloqueo de Contenido

- [ ] Ejercicios hard requieren Nacom o superior
- [ ] Ejercicios expert requieren Ah K'in o superior
- [ ] Desafíos de Maestría requieren Halach Uinic
- [ ] Contenido experimental requiere K'uk'ulkan
- [ ] Validación en backend previene bypass

### CA-GAM-003-005: Visualización

- [ ] Badge de rango se muestra en perfil
- [ ] RankProgressBar muestra progreso hacia próximo rango
- [ ] Historial de promociones muestra timeline completo
- [ ] Modal de promoción celebra correctamente
- [ ] Avatar frames se desbloquean según rango

### CA-GAM-003-006: Historial

- [ ] Cada promoción se registra en `rank_history`
- [ ] Historial incluye fecha, XP, días en rango anterior
- [ ] Historial es inmutable (no se puede editar)

---

## 🧪 Testing

### Test Case 1: Promoción de Ajaw a Nacom

```typescript
test('User promotes from Ajaw to Nacom at 1000 XP', async () => {
  // Arrange
  const user = await createUser({
    current_rank: 'Ajaw',
    total_xp: 990,
  });

  // Act - Completar ejercicio que da 15 XP
  await completeExercise(user.id, { base_xp: 15 });

  // Assert
  const updatedUser = await getUser(user.id);
  expect(updatedUser.current_rank).toBe('Nacom');
  expect(updatedUser.total_xp).toBe(1005); // 990 + 15

  // Verificar achievement
  const achievements = await getUserAchievements(user.id);
  const rankAchievement = achievements.find(
    (a) => a.achievement_type === 'rank_promotion'
  );
  expect(rankAchievement).toBeDefined();
  expect(rankAchievement.metadata.new_rank).toBe('Nacom');

  // Verificar ML Coins bonus
  expect(updatedUser.ml_coins).toBeGreaterThanOrEqual(50);

  // Verificar historial
  const history = await getRankHistory(user.id);
  expect(history).toHaveLength(1);
  expect(history[0].old_rank).toBe('Ajaw');
  expect(history[0].new_rank).toBe('Nacom');
});
```

### Test Case 2: No Promociona si No Alcanza Umbral

```typescript
test('User does not promote if below threshold', async () => {
  // Arrange
  const user = await createUser({
    current_rank: 'Ajaw',
    total_xp: 950,
  });

  // Act - Completar ejercicio que da 30 XP (total: 980)
  await completeExercise(user.id, { base_xp: 30 });

  // Assert
  const updatedUser = await getUser(user.id);
  expect(updatedUser.current_rank).toBe('Ajaw'); // Sigue en Ajaw
  expect(updatedUser.total_xp).toBe(980); // No alcanzó 1000

  // No hay achievement de promoción
  const achievements = await getUserAchievements(user.id);
  const rankAchievement = achievements.find(
    (a) => a.achievement_type === 'rank_promotion'
  );
  expect(rankAchievement).toBeUndefined();
});
```

### Test Case 3: Bonus de XP por Rango

```typescript
test('Nacom receives +5% XP bonus', async () => {
  // Arrange
  const user = await createUser({
    current_rank: 'Nacom',
    total_xp: 2000,
  });

  const exercise = await createExercise({ base_xp: 20 });

  // Act
  const result = await completeExercise(user.id, exercise.id);

  // Assert
  expect(result.xp_earned).toBe(21); // 20 * 1.05 = 21

  const updatedUser = await getUser(user.id);
  expect(updatedUser.total_xp).toBe(2021); // 2000 + 21
});
```

### Test Case 4: K'uk'ulkan No Promociona Más Allá

```typescript
test('K\'uk\'ulkan cannot promote further (max rank)', async () => {
  // Arrange
  const user = await createUser({
    current_rank: 'K\'uk\'ulkan',
    total_xp: 150000,
  });

  // Act - Ganar 10,000 XP más
  await giveXP(user.id, 10000);

  // Assert
  const updatedUser = await getUser(user.id);
  expect(updatedUser.current_rank).toBe('K\'uk\'ulkan'); // Sigue en K'uk'ulkan
  expect(updatedUser.total_xp).toBe(160000); // XP sigue acumulando

  // No hay nueva promoción en historial
  const history = await getRankHistory(user.id);
  const latestPromotion = history[history.length - 1];
  expect(latestPromotion.new_rank).not.toBe('beyond_kukulkan'); // No existe rango superior
});
```

### Test Case 5: Restricción de Contenido por Rango

```typescript
test('Ajaw cannot access hard exercise (requires Nacom)', async () => {
  // Arrange
  const user = await createUser({ current_rank: 'Ajaw' });
  const hardExercise = await createExercise({
    difficulty: 'hard',
    required_rank: 'Nacom',
  });

  // Act & Assert
  await expect(accessExercise(user.id, hardExercise.id)).rejects.toThrow(
    'Content requires rank Nacom or higher'
  );
});

test('Nacom can access hard exercise', async () => {
  // Arrange
  const user = await createUser({ current_rank: 'Nacom' });
  const hardExercise = await createExercise({
    difficulty: 'hard',
    required_rank: 'Nacom',
  });

  // Act
  const result = await accessExercise(user.id, hardExercise.id);

  // Assert
  expect(result.allowed).toBe(true);
});
```

### Test Case 6: Promoción Múltiple en Secuencia

```typescript
test('User promotes through multiple ranks correctly', async () => {
  // Arrange
  const user = await createUser({
    current_rank: 'Ajaw',
    total_xp: 0,
  });

  // Act - Dar suficiente XP para Ah K'in (5,000 XP)
  await giveXP(user.id, 5500);

  // Assert - Debería estar en Ah K'in, pasando por Nacom
  const updatedUser = await getUser(user.id);
  expect(updatedUser.current_rank).toBe('Ah K\'in');

  // Verificar que pasó por Nacom (historial tiene 2 entradas)
  const history = await getRankHistory(user.id);
  expect(history).toHaveLength(2);

  expect(history[0].old_rank).toBe('Ajaw');
  expect(history[0].new_rank).toBe('Nacom');

  expect(history[1].old_rank).toBe('Nacom');
  expect(history[1].new_rank).toBe('Ah K\'in');
});
```

---

## 📊 Métricas y Análisis

### KPIs a Monitorear

| Métrica | Cálculo | Objetivo |
|---------|---------|----------|
| **Distribución de rangos** | `COUNT(*) GROUP BY current_rank` | Pirámide: 50% Ajaw, 30% Nacom, 15% Ah K'in, 4% Halach, 1% K'uk'ulkan |
| **Tiempo promedio por rango** | `AVG(days_in_old_rank) GROUP BY old_rank` | Ajaw: 30-45 días, Nacom: 60-90 días |
| **Tasa de progresión** | `usuarios que promovieron / total usuarios` | >60% alcanzan Nacom, >20% Ah K'in |
| **Retención por rango** | DAU/MAU por rango | K'uk'ulkan: >80%, Ajaw: ~40% |
| **XP promedio al promover** | Detectar si usuarios esperan más del umbral | Cerca de umbral = bien balanceado |

### Dashboards para Product Team

**Dashboard 1: Distribución de Rangos**
```sql
SELECT
    current_rank,
    COUNT(*) as user_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM gamification_system.user_stats
WHERE user_id IN (SELECT id FROM auth.users WHERE status = 'active')
GROUP BY current_rank
ORDER BY
    CASE current_rank
        WHEN 'Ajaw' THEN 1
        WHEN 'Nacom' THEN 2
        WHEN 'Ah K''in' THEN 3
        WHEN 'Halach Uinic' THEN 4
        WHEN 'K''uk''ulkan' THEN 5
    END;
```

**Dashboard 2: Tiempo Promedio por Rango**
```sql
SELECT
    old_rank,
    AVG(days_in_old_rank) as avg_days,
    MIN(days_in_old_rank) as min_days,
    MAX(days_in_old_rank) as max_days
FROM gamification_system.rank_history
GROUP BY old_rank
ORDER BY
    CASE old_rank
        WHEN 'Ajaw' THEN 1
        WHEN 'Nacom' THEN 2
        WHEN 'Ah K''in' THEN 3
        WHEN 'Halach Uinic' THEN 4
    END;
```

---

## 🔗 Referencias Adicionales

### Documentación Relacionada

- [RF-GAM-001: Sistema de Achievements](./RF-GAM-001-achievements.md) - Achievement `rank_promotion`
- [RF-GAM-002: Sistema de Comodines](./RF-GAM-002-comodines.md) - Comodines desbloqueados por rango
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Acumulación de XP
- [RF-NOT-001: Tipos de Notificaciones](../06-notificaciones/RF-NOT-001-tipos-notificaciones.md) - Notificación `rank_up`

### ADRs

- [ADR-007: Elección de Rangos Maya vs Niveles Numéricos](../../02-especificaciones-tecnicas/adr/ADR-007-rangos-maya.md)
- [ADR-010: Umbrales de XP por Rango](../../02-especificaciones-tecnicas/adr/ADR-010-umbrales-xp-rangos.md)

### Consultoría Cultural

- Documento: "Validación de Nombres y Significados Maya"
- Asesor: [Nombre del consultor cultural]
- Fecha: 2025-10-01

### Referencias Históricas

- Thompson, J. E. S. (1954). "The Rise and Fall of Maya Civilization"
- Sharer, R. J. (2006). "The Ancient Maya" (6th Edition)
- Coe, M. D. (2011). "The Maya" (8th Edition)

### Inspiración de Juegos

- World of Warcraft: Sistema de niveles épicos
- League of Legends: Ranked tiers (Bronze, Silver, Gold...)
- Duolingo: Leagues (Bronze, Silver, Gold, Platinum...)

**Diferenciador de Gamilit:** Uso de jerarquía maya auténtica en lugar de metales genéricos.

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md`
**Propósito:** Requerimientos funcionales del sistema de rangos Maya
**Audiencia:** Product Owner, Developers, QA Team, Cultural Advisor
