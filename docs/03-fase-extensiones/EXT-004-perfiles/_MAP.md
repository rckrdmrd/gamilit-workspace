# _MAP: EXT-004 - Perfiles Avanzados

**Épica:** EXT-004
**Nombre:** Perfiles de Usuario Avanzados
**Fase:** 3 - Extensiones
**Presupuesto:** $10,000 MXN
**Story Points:** 35 SP
**Estado:** ✅ Completado 100%

---

## 📋 Propósito

Perfiles de usuario enriquecidos con avatar personalizado, biografía, badges display, estadísticas públicas, historial de achievements y comparación social.

**Impacto:** **MEDIO** - Personalización y motivación social

---

## 📁 Contenido

| Archivo | Descripción |
|---------|-------------|
| [README.md](./README.md) | Overview de la épica |
| [historias-usuario/](./historias-usuario/) | User stories (~8) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad |

---

## 🎯 Funcionalidades

### 1. Perfil Personalizado
- Avatar upload/selection
- Biografía editable
- Banner image
- Temas de color

### 2. Badges & Achievements
- Display de badges ganados
- Showcase de achievements favoritos
- Progreso hacia próximos badges
- Rareza y fecha de obtención

### 3. Estadísticas Públicas
- Total XP y rank
- Módulos completados
- Tiempo invertido
- Racha actual

### 4. Comparación Social
- Ranking vs peers
- Classroom leaderboard
- Similar users suggestions
- Friend comparisons

---

## 🏗️ Implementación

### Backend
- **Módulo:** `profiles`
- **Endpoints:** ~8 endpoints

### Frontend
- **Feature:** `user-profile`
- **Componentes:** ProfileHeader, BadgesShowcase, StatsPanel, SocialComparison

### Base de Datos
- **Tabla:** `user_profiles_extended`
- **Campos:** avatar_url, bio, banner_url, theme, showcase_badges

---

**Generado:** 2025-11-08
