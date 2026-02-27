---
titulo: SPEC-MULTIMEDIA - Student Portal Multimedia Handling
tipo: portal
portal: student
ultima_actualizacion: 2026-02-27
---

# SPEC-MULTIMEDIA - Student Portal Multimedia Handling

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El Student Portal maneja varios tipos de contenido multimedia:
- Avatares de usuario (upload/display)
- Imágenes en ejercicios
- Audio para ejercicios de listening
- Video embebido para tutoriales
- Iconos y emojis del sistema de gamificación

---

## 2. Tipos de Multimedia

### 2.1 Avatar de Usuario

| Aspecto | Especificación |
|---------|----------------|
| Tipos permitidos | JPEG, PNG, GIF |
| Tamaño máximo | 2 MB |
| Dimensiones | Variable (CSS responsive) |
| Almacenamiento | CDN externo |
| Fallback | Icono User de lucide-react |

### 2.2 Imágenes de Ejercicio

| Aspecto | Especificación |
|---------|----------------|
| Fuente | mechanicData.images[] |
| Formato | URL absoluta |
| Lazy loading | Sí (via React) |
| Fallback | Placeholder genérico |

### 2.3 Audio

| Aspecto | Especificación |
|---------|----------------|
| Uso | Ejercicios de listening |
| Formatos | MP3, WAV, OGG |
| Controles | Play, Pause, Seek |
| Precarga | metadata |

### 2.4 Video Embebido

| Aspecto | Especificación |
|---------|----------------|
| Proveedores | YouTube, Vimeo |
| Integración | iframe embed |
| Responsive | Sí (aspect-ratio) |

---

## 3. Upload de Avatar

### 3.1 Flujo

```
1. Usuario selecciona archivo
2. Validación cliente:
   - Tipo: file.type.startsWith('image/')
   - Tamaño: file.size < 2 * 1024 * 1024
3. Preview local: FileReader.readAsDataURL()
4. Upload: profileAPI.uploadAvatar(userId, file)
5. Response: { avatarUrl: string }
6. Actualizar UI con nueva URL
```

### 3.2 Código de Validación

```typescript
const validateAvatar = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  if (!VALID_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'El archivo excede 2MB' };
  }

  return { valid: true };
};
```

### 3.3 Progress Tracking

```typescript
// Simulated progress
const [progress, setProgress] = useState(0);

useEffect(() => {
  if (uploading) {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);
    return () => clearInterval(interval);
  }
}, [uploading]);
```

---

## 4. Iconos del Sistema

### 4.1 Lucide React

Biblioteca principal de iconos:

```typescript
import {
  Trophy, Star, Flame, Crown, Shield,
  BookOpen, CheckCircle, AlertTriangle,
  User, Settings, Bell, Home
} from 'lucide-react';
```

### 4.2 Iconos de Rango Maya

```typescript
const rankIcons: Record<string, string> = {
  'Nacom': '🔍',
  'Ajaw': '🏹',
  'Ah K\'in': '🗡️',
  'Halach Uinic': '⚔️',
  'K\'uk\'ulkan': '👑'
};
```

### 4.3 Iconos de Actividad

```typescript
const activityIcons: Record<ActivityType, LucideIcon> = {
  exercise_completed: CheckCircle,
  achievement_unlocked: Trophy,
  level_up: Star,
  module_completed: BookOpen,
  streak_milestone: Flame,
  badge_earned: Award,
  social_interaction: Users,
  daily_goal_met: Target
};
```

---

## 5. Animaciones Multimedia

### 5.1 Power-up Effects

```typescript
// PowerUpEffects.tsx
const effects = {
  particles: 20,           // Número de partículas
  duration: '2-4s',        // Duración de caída
  rotation: '0-720°',      // Rotación aleatoria
  displacement: '±100px',  // Desplazamiento X
};
```

### 5.2 Celebration Modal

```typescript
// CelebrationModal.tsx - Confetti
const confettiConfig = {
  particles: 30,
  colors: ['#f97316', '#f59e0b', '#1e3a8a', '#10b981'],
  fallDuration: '2-4s',
};
```

### 5.3 Achievement Toast

```typescript
// AchievementToast.tsx
const toastAnimation = {
  spring: { stiffness: 300, damping: 30 },
  duration: 5000,  // Auto-close
  maxStack: 3,     // Máximo simultáneo
};
```

---

## 6. Responsive Images

### 6.1 CSS Classes

```css
/* Avatar */
.avatar {
  @apply w-10 h-10 rounded-full object-cover;
}

/* Module Icon */
.module-icon {
  @apply w-12 h-12 rounded-lg;
}

/* Full-width image */
.exercise-image {
  @apply w-full h-auto rounded-lg;
}
```

### 6.2 Aspect Ratios

| Uso | Ratio |
|-----|-------|
| Avatar | 1:1 |
| Module card | 16:9 |
| Exercise image | Variable |
| Video embed | 16:9 |

---

## 7. CDN y Storage

### 7.1 URLs de Recursos

- Avatares: Almacenados en CDN (URL retornada por API)
- Contenido de ejercicios: URLs en mechanicData
- Iconos: Bundled con la aplicación

### 7.2 Caching

- Browser cache para imágenes estáticas
- React Query cache para datos de ejercicios
- Service Worker (si PWA habilitado)

---

## 8. Accesibilidad

### 8.1 Alt Text

```typescript
// Imágenes de ejercicio
<img src={image.url} alt={image.description || 'Imagen del ejercicio'} />

// Avatar
<img src={user.avatarUrl} alt={`Avatar de ${user.displayName}`} />
```

### 8.2 Audio/Video

- Controles nativos del navegador
- Transcripciones cuando disponibles
- Subtítulos para video (si disponibles)

---

## 9. Gaps Conocidos

| ID | Descripción | Severidad |
|----|-------------|-----------|
| - | Sin lazy loading explícito para imágenes de ejercicio | Baja |
| - | Sin optimización de imágenes (WebP) | Baja |
| - | Sin transcripciones para audio | Media |

---

## 10. Referencias

- **Profile:** `SPEC-PROFILE.md`
- **Exercises:** `SPEC-EXERCISES.md`
- **Lucide Icons:** https://lucide.dev/

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.0.0*
