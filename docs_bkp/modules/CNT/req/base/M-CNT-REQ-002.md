
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-CNT-002 -->
<!-- ID Nuevo: M-CNT-REQ-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-CNT-REQ-002: Tipos de Media y Procesamiento Específico

**ID:** RF-CNT-002
**Título:** Procesamiento Diferenciado por Tipo de Media
**Módulo:** 07-contenido-media
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el procesamiento específico para cada tipo de media soportado en la plataforma Gamilit: imágenes, audio, video y documentos. Cada tipo requiere validaciones, conversiones y optimizaciones específicas.

Los tipos de media soportados son:
- **Imágenes:** JPEG, PNG, WebP, GIF
- **Audio:** MP3, WAV, OGG, M4A
- **Video:** MP4, WebM, MOV
- **Documentos:** PDF, DOCX, TXT

---

## 🎯 Objetivos

1. **Validar formato y calidad** de cada tipo de media
2. **Procesar y optimizar** archivos para web
3. **Generar variantes** (thumbnails, transcoding)
4. **Extraer metadatos** relevantes
5. **Garantizar seguridad** mediante escaneo de malware

---

## ✅ Requerimientos Funcionales

### M-CNT-REQ-002-01: Procesamiento de Imágenes

**Descripción:** Procesamiento optimizado de imágenes para ejercicios y contenido educativo.

**Formatos Soportados:**
- JPEG/JPG (fotos, ilustraciones)
- PNG (transparencias, gráficos)
- WebP (moderno, comprimido)
- GIF (animaciones simples)

**Restricciones:**
- Tamaño máximo: **10 MB**
- Dimensiones máximas: **4096 x 4096 px**
- Dimensiones mínimas: **100 x 100 px**

**Procesamiento Automático:**

1. **Validación:**
   - Verificar formato real (no solo extensión)
   - Validar dimensiones y tamaño
   - Escanear malware en metadatos EXIF

2. **Optimización:**
   - Comprimir sin pérdida visible de calidad
   - Eliminar metadatos EXIF sensibles (ubicación, dispositivo)
   - Convertir a WebP para navegadores modernos
   - Mantener original como fallback

3. **Generación de Variantes:**
   - **Thumbnail:** 150x150 px (cuadrado, crop center)
   - **Small:** 320 px ancho máximo
   - **Medium:** 640 px ancho máximo
   - **Large:** 1280 px ancho máximo
   - **Original:** Sin modificar (storage)

4. **Metadatos Extraídos:**
   ```json
   {
     "width": 1920,
     "height": 1080,
     "format": "jpeg",
     "size_bytes": 245680,
     "has_transparency": false,
     "dominant_color": "#3A5F8B"
   }
   ```

**Ejemplo de Uso:**
- Ilustraciones en ejercicios de vocabulario
- Fotos de objetos para identificación
- Gráficos en lecturas
- Avatares de usuarios

---

### M-CNT-REQ-002-02: Procesamiento de Audio

**Descripción:** Procesamiento de archivos de audio para ejercicios de pronunciación y comprensión auditiva.

**Formatos Soportados:**
- MP3 (comprimido, universal)
- WAV (sin comprimir, alta calidad)
- OGG (comprimido, open source)
- M4A (comprimido, iOS)

**Restricciones:**
- Tamaño máximo: **50 MB**
- Duración máxima: **10 minutos** (600 segundos)
- Bitrate mínimo: **64 kbps**
- Sample rate mínimo: **22050 Hz**

**Procesamiento Automático:**

1. **Validación:**
   - Verificar formato de audio real
   - Validar duración y bitrate
   - Detectar silencios prolongados (>10 segundos)

2. **Normalización:**
   - Normalizar volumen a -14 LUFS (Loudness Units Full Scale)
   - Eliminar silencios al inicio/final
   - Aplicar fade in/out (0.5 segundos)

3. **Conversión:**
   - Convertir a MP3 (128 kbps) para compatibilidad
   - Convertir a OGG (128 kbps) para navegadores modernos
   - Mantener WAV original si es de alta calidad

4. **Metadatos Extraídos:**
   ```json
   {
     "duration_seconds": 45.3,
     "bitrate": 128000,
     "sample_rate": 44100,
     "channels": 2,
     "format": "mp3",
     "codec": "mp3"
   }
   ```

**Ejemplo de Uso:**
- Pronunciación de palabras en maya
- Ejercicios de comprensión auditiva
- Audio de lecturas narradas
- Feedback de maestros (audio)

---

### M-CNT-REQ-002-03: Procesamiento de Video

**Descripción:** Procesamiento de videos para contenido educativo y demostraciones.

**Formatos Soportados:**
- MP4 (H.264, universal)
- WebM (VP9, open source)
- MOV (QuickTime, Apple)

**Restricciones:**
- Tamaño máximo: **500 MB**
- Duración máxima: **15 minutos** (900 segundos)
- Resolución máxima: **1920 x 1080 (Full HD)**
- Framerate mínimo: **24 fps**

**Procesamiento Automático:**

1. **Validación:**
   - Verificar formato de contenedor y codec
   - Validar duración y resolución
   - Verificar que tenga video (no solo audio)

2. **Transcoding:**
   - Convertir a MP4 (H.264) si no lo es
   - Bitrate adaptativo basado en resolución:
     - 480p: 1 Mbps
     - 720p: 2.5 Mbps
     - 1080p: 5 Mbps
   - AAC audio (128 kbps)

3. **Generación de Variantes:**
   - **480p:** Resolución baja (móviles)
   - **720p:** Resolución media (tablets)
   - **1080p:** Resolución alta (desktop)
   - **Thumbnail:** Frame en segundo 2 (JPEG)

4. **Metadatos Extraídos:**
   ```json
   {
     "duration_seconds": 120.5,
     "width": 1920,
     "height": 1080,
     "framerate": 30,
     "video_codec": "h264",
     "audio_codec": "aac",
     "bitrate": 5000000
   }
   ```

5. **Subtítulos (Opcional):**
   - Extraer subtítulos embebidos
   - Soportar archivos SRT/VTT externos
   - Generar transcripción automática (futuro)

**Ejemplo de Uso:**
- Tutoriales de pronunciación
- Videos culturales (tradiciones mayas)
- Demostraciones de ejercicios
- Feedback de maestros (video)

---

### M-CNT-REQ-002-04: Procesamiento de Documentos

**Descripción:** Procesamiento de documentos para lecturas y materiales complementarios.

**Formatos Soportados:**
- PDF (lecturas, materiales)
- DOCX (documentos Word)
- TXT (texto plano)

**Restricciones:**
- Tamaño máximo: **25 MB**
- Páginas máximas (PDF): **100 páginas**
- Caracteres máximos (TXT): **100,000**

**Procesamiento Automático:**

1. **Validación:**
   - Verificar formato real
   - Escanear malware (macros en DOCX)
   - Validar que sea legible (no corrupto)

2. **Extracción de Texto:**
   - Extraer texto de PDF (OCR si es imagen)
   - Extraer texto de DOCX
   - Indexar para búsqueda full-text

3. **Generación de Thumbnails:**
   - Primera página como imagen (PDF)
   - Vista previa de primeros 500 caracteres (TXT)

4. **Conversión:**
   - DOCX → PDF (para visualización uniforme)
   - TXT → HTML (con formato básico)

5. **Metadatos Extraídos:**
   ```json
   {
     "format": "pdf",
     "pages": 15,
     "word_count": 3245,
     "reading_time_minutes": 13,
     "language": "es",
     "has_images": true
   }
   ```

**Ejemplo de Uso:**
- Lecturas de comprensión
- Material complementario
- Guías de estudio
- Certificados de logros (PDF generados)

---

## 🔒 Consideraciones de Seguridad

### Escaneo de Malware
- Todos los archivos se escanean con ClamAV antes de procesamiento
- Archivos infectados se rechazan inmediatamente
- Se notifica al usuario del rechazo (sin revelar tipo de malware)

### Validación de Formatos
- Verificar magic numbers (primeros bytes del archivo)
- No confiar solo en la extensión
- Rechazar archivos con formato inconsistente

### Límites de Procesamiento
- Timeout de 5 minutos por archivo
- Rechazar archivos que excedan CPU/memoria
- Queue para procesamiento asíncrono (evitar DoS)

### Privacidad
- Eliminar metadatos EXIF de imágenes (ubicación, dispositivo)
- No exponer rutas de filesystem originales
- Generar URLs públicas solo para archivos aprobados

---

## ⚙️ Procesamiento Asíncrono

### Queue System

Todos los procesamientos pesados se realizan en background:

```
┌─────────────┐
│   Upload    │
└──────┬──────┘
       ▼
  Estado: pending
       │
       ▼
┌─────────────┐
│  Queue Job  │
└──────┬──────┘
       ▼
  Estado: processing
       │
       ├─ Success → Estado: completed
       └─ Error   → Estado: failed
```

**Prioridad de Jobs:**
- **Alta:** Imágenes pequeñas (<1 MB)
- **Media:** Audio y documentos
- **Baja:** Videos (más pesados)

**Reintentos:**
- Máximo 3 reintentos en caso de fallo
- Backoff exponencial (1s, 2s, 4s)
- Notificar al usuario después de 3 fallos

---

## 📊 Métricas de Procesamiento

### Tiempos Esperados
- **Imágenes:** 2-5 segundos
- **Audio:** 5-15 segundos
- **Video (480p):** 30-60 segundos
- **Video (1080p):** 2-5 minutos
- **Documentos:** 5-10 segundos

### Tasa de Éxito
- Target: >98% de archivos procesados exitosamente
- Fallos comunes:
  - Archivos corruptos (3%)
  - Timeout por archivos muy grandes (1%)
  - Formatos no soportados (1%)

---

## 🧪 Casos de Prueba

### Test 1: Procesamiento de Imagen JPEG

```typescript
test('Process JPEG image and generate variants', async () => {
  const imageFile = await uploadTestImage('test-image.jpg', { size: '2MB' });

  const result = await mediaService.processImage(imageFile.id);

  expect(result.status).toBe('completed');
  expect(result.variants).toHaveLength(5); // thumbnail, small, medium, large, original
  expect(result.metadata.width).toBe(1920);
  expect(result.metadata.format).toBe('jpeg');
});
```

### Test 2: Normalización de Audio

```typescript
test('Normalize audio volume to -14 LUFS', async () => {
  const audioFile = await uploadTestAudio('loud-audio.mp3');

  const result = await mediaService.processAudio(audioFile.id);

  expect(result.metadata.loudness_lufs).toBeCloseTo(-14, 1);
  expect(result.variants).toContain('mp3');
  expect(result.variants).toContain('ogg');
});
```

### Test 3: Transcoding de Video a Múltiples Resoluciones

```typescript
test('Transcode video to 480p, 720p, 1080p', async () => {
  const videoFile = await uploadTestVideo('video-1080p.mp4');

  const result = await mediaService.processVideo(videoFile.id);

  expect(result.status).toBe('completed');
  expect(result.variants).toHaveLength(3);
  expect(result.variants.find(v => v.resolution === '480p')).toBeDefined();
  expect(result.variants.find(v => v.resolution === '720p')).toBeDefined();
  expect(result.variants.find(v => v.resolution === '1080p')).toBeDefined();
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `storage.media_files` - Metadata de archivos (RF-CNT-001)
- `storage.media_variants` - Variantes generadas por tipo

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-CNT-002: Tipos de Media y Procesamiento](../../02-especificaciones-tecnicas/07-contenido-media/ET-CNT-002-tipos-media-procesamiento.md)

### Documentos Relacionados

- [RF-CNT-001: Gestión de Media](./RF-CNT-001-gestion-media.md) - Sistema base de media
- [RF-CNT-003: Storage y CDN](./RF-CNT-003-storage-cdn.md) - Almacenamiento y distribución

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, Infraestructura
**Próxima revisión:** 2026-01-07
