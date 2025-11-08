# _MAP: docs/01-requerimientos/07-contenido-media/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales de gestión de contenido multimedia (imágenes, audio, video, archivos)
**Audiencia:** Product Owners, Desarrolladores Full-Stack, Diseñadores de Contenido
**Estado:** 🟡 En Desarrollo

---

## 📁 Contenido de esta Carpeta

| Documento | Título | Estado | Prioridad |
|-----------|--------|--------|-----------|
| [RF-CNT-001](./RF-CNT-001-gestion-media.md) | Gestión de Contenido y Media | ✅ Implementado | Alta |
| [RF-CNT-002](./RF-CNT-002-tipos-media-procesamiento.md) | Tipos de Media y Procesamiento Específico | ✅ Implementado | Alta |
| [RF-CNT-003](./RF-CNT-003-storage-cdn.md) | Storage y Distribución mediante CDN | ✅ Implementado | Alta |

**Total documentos:** 3/9 (33%)
**Estado:** 🟡 En Desarrollo

---

## 🎯 Funcionalidades Planeadas (Sin Documentar)

### Gestión de Archivos Multimedia

**Tipos de contenido:**
- **Imágenes** - PNG, JPG, SVG, WebP
- **Audio** - MP3, WAV (lecturas narradas, pronunciación)
- **Video** - MP4, WebM (video-lecturas, tutoriales)
- **Documentos** - PDF (textos para lectura)

**Funcionalidades esperadas:**
1. Upload de archivos (maestros, admins)
2. Almacenamiento seguro (S3-compatible)
3. Procesamiento automático (resize, optimize, thumbnails)
4. CDN para entrega rápida
5. Gestión de cuotas por organización
6. Moderación de contenido

---

## 🔗 Interdependencias Anticipadas

### Módulos Relacionados

**Dependerá de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Control de acceso a uploads
- [03-contenido-educativo](../03-contenido-educativo/) - Multimedia en ejercicios
- [08-auditoria-configuracion](../08-auditoria-configuracion/) - Logging de uploads/deletes

**Usará:**
- [Admin Portal](../admin-portal/) - Gestión de biblioteca multimedia
- [Teacher Portal](../teacher-portal/) - Upload de contenido

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-MED-*](../../02-especificaciones-tecnicas/07-contenido-media/) (cuando exista)

**Database:**
- Schema: `storage` → `apps/database/ddl/schemas/storage/`
  - Tablas existentes: `buckets`, `objects`, `media_metadata`

---

## 📊 Métricas

- **Total documentos:** 3/9 (33%)
- **RFs completos:** 3
- **Cobertura implementación:** 33%
- **Estado:** 🟡 En Desarrollo

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. [ ] Crear RF-MED-001: Sistema de Upload de Imágenes
2. [ ] Crear RF-MED-002: Procesamiento Automático de Imágenes
3. [ ] Crear RF-MED-003: Gestión de Storage y Cuotas

### Prioridad Media
4. [ ] Crear RF-MED-004: Upload de Audio (lecturas narradas)
5. [ ] Crear RF-MED-005: Upload de Video
6. [ ] Crear RF-MED-006: Biblioteca de Media

### Prioridad Baja
7. [ ] Crear RF-MED-007: Moderación de Contenido
8. [ ] Crear RF-MED-008: Transcripción Automática de Audio/Video (IA)
9. [ ] Crear RF-MED-009: Generación de Subtítulos

---

## ⚠️ Consideraciones Técnicas

### Almacenamiento
- **Storage Backend:** Supabase Storage (S3-compatible)
- **CDN:** CloudFlare / Supabase CDN
- **Cuotas:** Por organización y por usuario
- **Límites:**
  - Imágenes: Max 10MB por archivo
  - Audio: Max 50MB por archivo
  - Video: Max 500MB por archivo
  - PDF: Max 20MB por archivo

### Seguridad
- **Validación de tipo de archivo** (MIME type + magic bytes)
- **Escaneo de malware** (ClamAV o similar)
- **Moderación de contenido** (Google Vision API para imágenes inapropiadas)
- **Acceso controlado** - URLs firmadas con expiración

### Performance
- **Lazy loading** de imágenes
- **Responsive images** (srcset, sizes)
- **Video streaming** (HLS o DASH)
- **Thumbnails automáticos** para videos

---

## 📚 Stack Tecnológico Anticipado

**Backend:**
- Supabase Storage API
- Sharp (procesamiento de imágenes)
- FFmpeg (procesamiento de audio/video)

**Frontend:**
- React Upload components
- Image optimization (next/image o similar)
- Video player (Video.js o similar)

**Infraestructura:**
- S3-compatible storage
- CDN global
- Lambda/Edge functions para procesamiento

---

## 📖 Referencias Externas

**Mejores prácticas:**
- [Web.dev - Optimize images](https://web.dev/fast/#optimize-your-images)
- [Cloudinary - Media optimization](https://cloudinary.com/documentation)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
