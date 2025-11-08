
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-CNT-001 -->
<!-- ID Nuevo: M-CNT-REQ-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-CNT-REQ-001: Gestión de Contenido y Media

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-CNT-001 |
| **Módulo** | 07 - Contenido y Media |
| **Título** | Sistema de Gestión de Media |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM: media_type**
- **Ubicación:** `apps/database/ddl/schemas/content_management/enums/media_type.sql:1-10`
- **Valores:** `'image'`, `'audio'`, `'video'`, `'document'`, `'other'`

🗄️ **ENUM: media_status**
- **Ubicación:** `apps/database/ddl/schemas/content_management/enums/media_status.sql:1-10`
- **Valores:** `'uploading'`, `'processing'`, `'ready'`, `'failed'`, `'deleted'`

🗄️ **Tabla: media_files**
- **Ubicación:** `apps/database/ddl/schemas/content_management/tables/media_files.sql:1-60`

### Especificación Técnica

📘 [ET-CNT-001: Implementación de Gestión de Media](../../02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md)

---

## 📖 Descripción General

Sistema completo de gestión de archivos multimedia que permite subir, procesar, almacenar y servir contenido educativo (imágenes, audio, video, documentos PDF).

### Tipos de Media Soportados

| Tipo | Formatos | Tamaño Máximo | Procesamiento |
|------|----------|---------------|---------------|
| **Imagen** | JPG, PNG, WEBP, GIF | 10 MB | Resize, compress, thumbnail |
| **Audio** | MP3, WAV, OGG | 50 MB | Transcode to MP3, normalize |
| **Video** | MP4, WEBM, MOV | 500 MB | Transcode to MP4, thumbnail, múltiples calidades |
| **Documento** | PDF | 20 MB | Preview image, text extraction |
| **Otro** | TXT, JSON | 5 MB | Validation only |

---

## ⚙️ Requerimientos Funcionales

### 1. Upload de Archivos

**Flujo:**
```
Usuario selecciona archivo → Frontend valida → Upload a storage temporal →
Backend procesa → Almacenamiento permanente → Estado: ready
```

**Validaciones:**
- Extensión permitida
- Tamaño dentro del límite
- MIME type correcto
- Virus scan (opcional)

**Metadatos capturados:**
```json
{
  "filename": "leccion-1-audio.mp3",
  "original_filename": "Lección 1 - Introducción.mp3",
  "size_bytes": 2458624,
  "mime_type": "audio/mpeg",
  "uploaded_by": "uuid-user",
  "uploaded_at": "2025-11-07T10:30:00Z"
}
```

### 2. Procesamiento Asíncrono

**Images:**
- Generate thumbnail (200x200)
- Compress to WebP
- Resize para web (max 1920px width)

**Audio:**
- Transcode to MP3 (128kbps)
- Normalize volume

**Video:**
- Generate thumbnail (frame at 2s)
- Transcode to MP4 H.264
- Multiple qualities (360p, 720p, 1080p)

**Status Flow:**
```
uploading → processing → ready
                ↓
              failed
```

### 3. Almacenamiento

**Estructura de storage:**
```
/media/{type}/{year}/{month}/{uuid}.{ext}
/media/image/2025/11/abc123-def456.webp
/media/audio/2025/11/xyz789-uvw012.mp3
/media/video/2025/11/mno345-pqr678.mp4
```

**Backup:**
- S3 con versioning habilitado
- Lifecycle policy: eliminar soft-deleted después de 30 días

### 4. Acceso y Permisos

**Tipos de acceso:**
- `public`: Cualquiera puede ver (thumbnails, previews)
- `authenticated`: Solo usuarios autenticados
- `restricted`: Solo miembros de aula específica

**URL firmadas:**
- Videos y archivos pesados usan signed URLs (expiran en 1 hora)
- Imágenes públicas usan CDN

---

## 💼 Casos de Uso

### CU-CNT-001: Subir Imagen para Ejercicio

**Actor:** Maestro

**Flujo:**
1. Maestro crea ejercicio → Sube imagen
2. Frontend valida (tamaño, tipo)
3. Upload a S3 temporal
4. Backend crea registro en `media_files` (status: uploading)
5. Job procesa imagen (resize, compress)
6. Actualiza status a `ready`
7. Imagen disponible en ejercicio

---

## ✅ Criterios de Aceptación

- [ ] Soporta 5 tipos de media (image, audio, video, document, other)
- [ ] Validación de tamaño y tipo
- [ ] Procesamiento asíncrono
- [ ] Storage en S3 con estructura organizada
- [ ] Signed URLs para contenido privado
- [ ] Soft delete con recuperación de 30 días

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación |

---

**Documento:** `docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md`
