# AdminContentPage - Visual Reference Guide

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx`
**Fecha:** 2025-11-24

---

## 📊 ESTADO DE TABS

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CONTENT PAGE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Pendientes   │ │ Multimedia   │ │ Versiones    │        │
│  │ (24)         │ │ (0) 🚧      │ │ (0) 🚧      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tab 1: Pendientes ✅
```
┌─────────────────────────────────────────────┐
│ EJERCICIOS PENDIENTES DE APROBACIÓN        │
├─────────────────────────────────────────────┤
│                                             │
│ 🔍 [Buscar ejercicios...]                  │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Título              Autor      Fecha    ││
│ ├─────────────────────────────────────────┤│
│ │ Análisis Maya      Teacher1   Nov 20   ││
│ │ [Ver] [✓ Aprobar] [✗ Rechazar]         ││
│ ├─────────────────────────────────────────┤│
│ │ Timeline Historia  Teacher2   Nov 19   ││
│ │ [Ver] [✓ Aprobar] [✗ Rechazar]         ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Mostrando 1-10 de 24 ejercicios            │
└─────────────────────────────────────────────┘

Estado: ✅ FUNCIONAL (70%)
Funcionalidad:
  - ✅ Listar ejercicios pendientes
  - ✅ Aprobar ejercicio
  - ✅ Rechazar con razón
  - ✅ Vista previa básica
```

### Tab 2: Multimedia 🚧
```
CUANDO NO HAY DATOS:

┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              ┌───────────┐                 │
│              │           │                 │
│              │   📷      │                 │
│              │           │                 │
│              └───────────┘                 │
│                                             │
│          Librería Multimedia                │
│                                             │
│  La gestión avanzada de multimedia          │
│  estará disponible próximamente.            │
│  Esta funcionalidad requiere                │
│  configuración de Supabase Storage.         │
│                                             │
│         ┌─────────────────┐                │
│         │  En desarrollo  │                │
│         └─────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘

Estado: ⚠️ EN DESARROLLO
Mensaje: Empty state informativo
Bloqueador: Supabase Storage no configurado
```

```
CUANDO HAY DATOS (futuro):

┌─────────────────────────────────────────────┐
│ LIBRERÍA MULTIMEDIA                         │
├─────────────────────────────────────────────┤
│                                             │
│ [📤 Subir Archivo]                         │
│                                             │
│ 🔍 [Buscar archivos...]                    │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Archivo         Tipo    Tamaño  Fecha  ││
│ ├─────────────────────────────────────────┤│
│ │ 📷 image.png    Image   2.3MB   Nov20 ││
│ │ 🎵 audio.mp3    Audio   5.1MB   Nov19 ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Tab 3: Versiones 🚧
```
CUANDO NO HAY DATOS:

┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              ┌───────────┐                 │
│              │           │                 │
│              │   🕐      │                 │
│              │           │                 │
│              └───────────┘                 │
│                                             │
│         Control de Versiones                │
│                                             │
│  El historial completo de versiones y       │
│  la comparación de cambios estará           │
│  disponible próximamente.                   │
│                                             │
│         ┌─────────────────┐                │
│         │  En desarrollo  │                │
│         └─────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘

Estado: ⚠️ EN DESARROLLO
Mensaje: Empty state informativo
Bloqueador: Sistema de versionado sin implementar
```

```
CUANDO HAY DATOS (futuro):

┌─────────────────────────────────────────────┐
│ HISTORIAL DE VERSIONES                      │
├─────────────────────────────────────────────┤
│                                             │
│ 🔍 [Buscar versiones...]                   │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Contenido  Versión  Cambios       Fecha││
│ ├─────────────────────────────────────────┤│
│ │ EX-001     v3       Fixed typo    Nov20││
│ │ EX-001     v2       Updated text  Nov19││
│ │ EX-001     v1       Initial       Nov18││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE RENDERIZADO

### Multimedia Tab
```
START
  ↓
¿Está cargando?
  ├─ SÍ → [SPINNER] "Cargando multimedia..."
  └─ NO
      ↓
  ¿Hay archivos?
      ├─ SÍ → [TABLA + BOTÓN SUBIR]
      └─ NO → [EMPTY STATE]
              "En desarrollo - Requiere Supabase Storage"
```

### Versiones Tab
```
START
  ↓
¿Está cargando?
  ├─ SÍ → [SPINNER] "Cargando versiones..."
  └─ NO
      ↓
  ¿Hay versiones?
      ├─ SÍ → [TABLA]
      └─ NO → [EMPTY STATE]
              "En desarrollo - Historial próximamente"
```

---

## 🎨 COMPONENTES EMPTY STATE

### Estructura Visual
```
┌──────────────────────────────┐
│                              │
│    ┌────────────────┐       │  ← Contenedor circular
│    │                │       │    (bg-detective-bg-secondary)
│    │   [ICON 64px]  │       │
│    │                │       │
│    └────────────────┘       │
│                              │
│   [TÍTULO DESTACADO]         │  ← text-xl font-semibold
│                              │
│   [Descripción del estado]   │  ← text-detective-text-secondary
│   [y bloqueadores técnicos]  │    max-w-md mx-auto
│                              │
│   ┌──────────────────┐      │
│   │  En desarrollo   │      │  ← Badge informativo
│   └──────────────────┘      │    bg-blue-500/20
│                              │
└──────────────────────────────┘
```

### Código Pattern
```tsx
<div className="text-center py-16">
  {/* Icon Container */}
  <div className="mb-4 flex justify-center">
    <div className="p-4 bg-detective-bg-secondary rounded-full">
      <IconComponent className="w-16 h-16 text-gray-400" />
    </div>
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold text-detective-text mb-2">
    [Título del Feature]
  </h3>

  {/* Description */}
  <p className="text-detective-text-secondary mb-4 max-w-md mx-auto">
    [Descripción del estado y bloqueadores]
  </p>

  {/* Badge */}
  <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-full font-medium">
    En desarrollo
  </span>
</div>
```

---

## 📍 UBICACIÓN EN CÓDIGO

```typescript
apps/frontend/src/apps/admin/pages/AdminContentPage.tsx

Línea 361-408: Tab Multimedia
├─ 372-376: Loading state
├─ 377-390: Tabla (cuando hay datos)
└─ 392-406: Empty state ← NUEVO

Línea 410-449: Tab Versiones
├─ 421-425: Loading state
├─ 426-431: Tabla (cuando hay datos)
└─ 433-447: Empty state ← NUEVO
```

---

## 🔑 PROPS Y ESTADOS

### Multimedia
```typescript
const {
  media: mediaItems,        // MediaItem[]
  loading: loadingMedia,    // boolean
  error: errorMedia,        // string | null
  // ...
} = useMediaLibrary();

// Renderizado condicional:
loadingMedia && !mediaItems.length → SPINNER
mediaItems.length > 0 → TABLA
else → EMPTY STATE
```

### Versiones
```typescript
const {
  versions,                 // ContentVersion[]
  loading: loadingVersions, // boolean
  error: errorVersions,     // string | null
  // ...
} = useContentVersions();

// Renderizado condicional:
loadingVersions && !versions.length → SPINNER
versions.length > 0 → TABLA
else → EMPTY STATE
```

---

## 🎯 CRITERIOS DE TRANSICIÓN

### ¿Cuándo desaparece el Empty State?

**Tab Multimedia:**
```
Backend retorna mediaItems.length > 0
  ↓
Automáticamente muestra TABLA + BOTÓN
  ↓
Usuario ve funcionalidad completa
```

**Requerimientos previos:**
- ✅ Supabase Storage configurado
- ✅ Endpoints `/v1/admin/content/media-library` retornan datos reales
- ✅ Upload de archivos funcional

**Tab Versiones:**
```
Backend retorna versions.length > 0
  ↓
Automáticamente muestra TABLA
  ↓
Usuario ve historial de versiones
```

**Requerimientos previos:**
- ✅ Tabla `content_versions` creada en DB
- ✅ Endpoints `/v1/admin/content/versions` retornan datos reales
- ✅ Sistema de versionado implementado

---

## 📊 COMPARACIÓN VISUAL

### Antes (sin empty state)
```
Usuario hace clic en "Multimedia"
  ↓
┌─────────────────────────────┐
│ MULTIMEDIA                  │
├─────────────────────────────┤
│                             │
│ [📤 Subir Archivo]         │  ← Botón sin contexto
│                             │
│ 🔍 [Buscar archivos...]    │
│                             │
│ (tabla vacía)              │  ← Confuso: ¿bug o vacío real?
│                             │
└─────────────────────────────┘

Problema: Usuario no sabe si es:
  - Bug del sistema
  - Funcionalidad no cargada
  - Realmente vacío
```

### Después (con empty state)
```
Usuario hace clic en "Multimedia"
  ↓
┌─────────────────────────────┐
│                             │
│      ┌───────────┐         │
│      │   📷      │         │  ← Icono visual claro
│      └───────────┘         │
│                             │
│  Librería Multimedia        │  ← Título explicativo
│                             │
│  La gestión avanzada de     │  ← Razón técnica
│  multimedia estará          │
│  disponible próximamente.   │
│  Requiere Supabase Storage. │
│                             │
│  ┌─────────────────┐       │
│  │  En desarrollo  │       │  ← Estado claro
│  └─────────────────┘       │
│                             │
└─────────────────────────────┘

Beneficio: Usuario entiende:
  - ✅ No es un bug
  - ✅ Está en construcción
  - ✅ Habrá funcionalidad futura
```

---

## 🚀 INTEGRACIÓN FUTURA

### Checklist para activar Multimedia

```bash
# 1. Backend-Agent
[ ] Implementar AdminContentController.getMediaLibrary()
[ ] Implementar AdminContentController.uploadMedia()
[ ] Integrar con Supabase Storage SDK

# 2. DevOps
[ ] Configurar SUPABASE_URL en .env
[ ] Configurar SUPABASE_ANON_KEY en .env
[ ] Crear bucket en Supabase Console

# 3. Database-Agent (si aplica)
[ ] Crear tabla media_files (si no existe)
[ ] Agregar columnas: storage_path, bucket_name

# 4. Frontend-Agent
[ ] Actualizar useMediaLibrary para manejar uploads
[ ] Agregar vista previa de imágenes
[ ] Implementar drag & drop

# 5. Testing
[ ] Test unitario de upload
[ ] Test E2E de librería multimedia
[ ] Validar límites de tamaño
```

### Checklist para activar Versiones

```bash
# 1. Database-Agent
[ ] Crear tabla content_versions
[ ] Agregar triggers de versionado automático
[ ] Crear índices para queries de historial

# 2. Backend-Agent
[ ] Implementar AdminContentController.getVersions()
[ ] Implementar AdminContentController.createVersion()
[ ] Implementar diff generator

# 3. Frontend-Agent
[ ] Crear componente DiffViewer
[ ] Implementar modal de comparación
[ ] Agregar restore de versión

# 4. Testing
[ ] Test de creación de versión
[ ] Test de comparación
[ ] Test de restore
```

---

**Última actualización:** 2025-11-24
**Mantenido por:** Frontend-Agent
