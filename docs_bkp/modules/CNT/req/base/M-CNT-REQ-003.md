
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-CNT-003 -->
<!-- ID Nuevo: M-CNT-REQ-003 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-CNT-REQ-003: Storage y Distribución mediante CDN

**ID:** RF-CNT-003
**Título:** Almacenamiento y Distribución de Media
**Módulo:** 07-contenido-media
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el sistema de almacenamiento y distribución de archivos media en la plataforma Gamilit, utilizando storage en la nube (S3-compatible) y Content Delivery Network (CDN) para entrega optimizada a nivel global.

El sistema permite:
- Almacenamiento escalable en S3 (AWS, DigitalOcean Spaces, MinIO)
- Distribución global mediante CDN (CloudFlare, CloudFront)
- URLs firmadas para contenido privado
- Backup automático y redundancia
- Políticas de retención y archivado

---

## 🎯 Objetivos

1. **Almacenar de forma escalable** millones de archivos media
2. **Distribuir globalmente** con baja latencia
3. **Optimizar costos** mediante tiers de almacenamiento
4. **Garantizar disponibilidad** con backup y redundancia
5. **Controlar acceso** con URLs firmadas

---

## ✅ Requerimientos Funcionales

### M-CNT-REQ-003-01: Storage en la Nube (S3-Compatible)

**Descripción:** Almacenamiento de archivos media en servicios S3-compatible.

**Proveedores Soportados:**
- **AWS S3:** Producción (alta disponibilidad)
- **DigitalOcean Spaces:** Alternativa económica
- **MinIO:** Desarrollo/testing local

**Estructura de Buckets:**

```
gamilit-media/
├── uploads/          # Archivos originales sin procesar
│   ├── pending/      # Esperando procesamiento
│   └── failed/       # Fallos de procesamiento
├── images/           # Imágenes procesadas
│   ├── thumbnails/
│   ├── small/
│   ├── medium/
│   ├── large/
│   └── original/
├── audio/            # Audio procesado
│   ├── mp3/
│   ├── ogg/
│   └── original/
├── video/            # Video procesado
│   ├── 480p/
│   ├── 720p/
│   ├── 1080p/
│   └── original/
└── documents/        # Documentos
    ├── pdf/
    └── txt/
```

**Naming Convention:**
```
{type}/{user_id}/{timestamp}-{uuid}.{extension}
Ejemplo: images/user-123/20251107-a3b4c5d6.webp
```

**Metadatos S3:**
- `Content-Type`: MIME type correcto
- `Cache-Control`: max-age según tipo
- `X-Amz-Meta-User-Id`: ID del usuario propietario
- `X-Amz-Meta-Original-Name`: Nombre original del archivo

**Restricciones:**
- Máximo 1 TB de storage por organización (aumentable)
- Máximo 10,000 archivos por usuario
- Rate limit: 100 uploads por hora por usuario

---

### M-CNT-REQ-003-02: Content Delivery Network (CDN)

**Descripción:** Distribución de contenido mediante CDN para baja latencia global.

**CDN Provider:** CloudFlare (o CloudFront como alternativa)

**Beneficios:**
- Reducción de latencia (80-90%)
- Offload del servidor origin (reduce costos)
- Protección DDoS incluida
- Optimización automática de imágenes (Cloudflare Polish)

**Cache Strategy:**

| Tipo | Cache TTL | Descripción |
|------|-----------|-------------|
| **Imágenes** | 7 días | Raramente cambian |
| **Audio** | 30 días | Contenido estático |
| **Video** | 30 días | Contenido estático |
| **Documentos** | 7 días | Pueden actualizarse |
| **Avatares** | 1 día | Pueden cambiar frecuentemente |

**Cache Headers:**
```http
Cache-Control: public, max-age=604800, immutable
ETag: "a3b4c5d6e7f8"
X-Cache: HIT
```

**Invalidación de Cache:**
- Manual: API call a CloudFlare
- Automática: Al actualizar archivo (nuevo UUID)
- Purge total: Solo en despliegues mayores

**Edge Locations:**
- Prioridad: América Latina (México, Colombia, Chile)
- Secundario: Estados Unidos, Europa
- Target: <100ms latencia en LATAM

---

### M-CNT-REQ-003-03: URLs Públicas vs Privadas

**Descripción:** Gestión de acceso a media mediante URLs públicas y privadas (firmadas).

**URLs Públicas:**
Contenido accesible sin autenticación:
- Imágenes de ejercicios públicos
- Audio de pronunciación
- Videos de tutoriales
- Avatares de usuarios

```
https://cdn.gamilit.com/images/thumbnails/20251107-a3b4c5d6.webp
```

**URLs Firmadas (Privadas):**
Contenido que requiere autenticación:
- Ejercicios de pago
- Materiales de cursos premium
- Feedback de maestros (audio/video)
- Documentos de evaluación

```
https://cdn.gamilit.com/premium/video/lesson-1.mp4
  ?Expires=1699459200
  &Signature=abc123...
  &Key-Pair-Id=APKAIXYZ
```

**Parámetros de URLs Firmadas:**
- `Expires`: Timestamp de expiración (Unix)
- `Signature`: Firma HMAC-SHA256
- `Key-Pair-Id`: ID de clave pública

**Tiempo de Expiración:**
- **Ejercicios:** 24 horas
- **Videos de lecciones:** 6 horas
- **Documentos:** 1 hora
- **Feedback:** 7 días

---

### M-CNT-REQ-003-04: Backup y Redundancia

**Descripción:** Sistema de backup automático para prevenir pérdida de datos.

**Estrategia de Backup:**

**Backup Incremental (Diario):**
- Solo archivos modificados/nuevos
- Retención: 7 días
- Costo: Bajo (solo diferencias)

**Backup Completo (Semanal):**
- Todos los archivos
- Retención: 4 semanas
- Costo: Medio

**Backup Mensual (Archivo):**
- Snapshot completo
- Retención: 12 meses
- Costo: Alto (storage glaciar)

**Replicación Geográfica:**
- **Primary:** us-east-1 (AWS S3)
- **Replica:** eu-west-1 (Cross-region replication)
- RPO (Recovery Point Objective): <1 hora
- RTO (Recovery Time Objective): <4 horas

**Verificación de Integridad:**
- Checksum MD5/SHA256 al subir
- Verificación mensual de archivos críticos
- Alertas automáticas si se detecta corrupción

---

### M-CNT-REQ-003-05: Políticas de Retención

**Descripción:** Gestión del ciclo de vida de archivos media.

**Tiers de Almacenamiento:**

```
┌─────────────┐
│   Hot Tier  │ Acceso frecuente (primeros 30 días)
│   (S3 Std)  │ Costo: $$$ | Latencia: <10ms
└──────┬──────┘
       ▼
┌─────────────┐
│  Warm Tier  │ Acceso ocasional (30-90 días)
│ (S3 IA)     │ Costo: $$ | Latencia: <50ms
└──────┬──────┘
       ▼
┌─────────────┐
│  Cold Tier  │ Acceso raro (90-365 días)
│(S3 Glacier) │ Costo: $ | Latencia: minutos
└──────┬──────┘
       ▼
┌─────────────┐
│Archive Tier │ Archivo permanente (>365 días)
│(Deep Archive│ Costo: ¢ | Latencia: horas
└─────────────┘
```

**Lifecycle Rules:**

| Tipo de Archivo | Hot → Warm | Warm → Cold | Cold → Archive | Eliminar |
|-----------------|------------|-------------|----------------|----------|
| **Ejercicios** | 30 días | 90 días | 1 año | Nunca |
| **Avatares** | 7 días | - | - | Al eliminar cuenta |
| **Feedback Temporal** | - | - | - | 90 días |
| **Backups** | - | 7 días | 30 días | 1 año |

**Eliminación Automática:**
- Archivos marcados como "deleted" → 30 días en soft-delete → eliminación permanente
- Archivos huérfanos (sin referencias en DB) → 90 días → eliminación
- Archivos de usuarios eliminados → inmediato (GDPR)

---

### M-CNT-REQ-003-06: Optimización de Costos

**Descripción:** Estrategias para minimizar costos de storage y transferencia.

**Estimación de Costos (Mensual):**

```
Storage (S3):
- Hot (100 GB):   $2.30
- Warm (500 GB):  $6.25
- Cold (1 TB):    $4.00
Total Storage: $12.55/mes

Transfer (CloudFlare CDN):
- Bandwidth ilimitado: $0 (incluido)

Total Estimado: ~$13/mes para 1.6 TB
```

**Optimizaciones:**
- Comprimir imágenes con WebP (70% reducción)
- Transcoding adaptativo de video (50% reducción)
- Lifecycle automático a tiers fríos
- CDN gratuito (CloudFlare)
- Deduplicación de archivos idénticos (hash-based)

**Alertas de Costos:**
- Warning si costos >$50/mes
- Critical si costos >$100/mes
- Revisar archivos grandes (>50 MB) semanalmente

---

## 🔒 Consideraciones de Seguridad

### Encriptación
- **En tránsito:** TLS 1.3 obligatorio
- **En reposo:** AES-256 server-side encryption (SSE)
- **Claves:** AWS KMS (managed keys)

### Control de Acceso
- Buckets privados por defecto (no public-read)
- IAM roles con permisos mínimos (least privilege)
- URLs firmadas con tiempo de expiración
- Audit logs de accesos (CloudTrail)

### Compliance
- **GDPR:** Eliminación inmediata al eliminar cuenta
- **COPPA:** Contenido de menores en bucket segregado
- **Copyright:** Watermarks opcionales en imágenes premium

---

## 📊 Métricas y Monitoreo

### KPIs de Storage
- **Total Storage Used:** TB actuales
- **Storage Growth Rate:** % mensual
- **Cost per GB:** $/GB promedio
- **Orphaned Files:** Archivos sin referencias

### KPIs de CDN
- **Cache Hit Ratio:** >90% target
- **P95 Latency:** <200ms target (LATAM)
- **Bandwidth Saved:** % offload del origin
- **4xx/5xx Errors:** <0.1% target

### Alertas
- Storage >80% del límite
- CDN cache hit ratio <80%
- P95 latency >500ms
- Errores de replicación geográfica

---

## 🧪 Casos de Prueba

### Test 1: Upload y Recuperación desde CDN

```typescript
test('Upload image and retrieve from CDN', async () => {
  const image = await uploadFile('test.jpg');

  // Esperar procesamiento
  await waitForProcessing(image.id);

  // Obtener URL del CDN
  const cdnUrl = await storageService.getCDNUrl(image.id, 'medium');

  expect(cdnUrl).toContain('cdn.gamilit.com');

  // Verificar que es accesible
  const response = await fetch(cdnUrl);
  expect(response.status).toBe(200);
  expect(response.headers.get('x-cache')).toBeTruthy();
});
```

### Test 2: URL Firmada con Expiración

```typescript
test('Signed URL expires after TTL', async () => {
  const premiumFile = await uploadPremiumFile('lesson-1.mp4');

  const signedUrl = await storageService.getSignedUrl(premiumFile.id, {
    expiresIn: 5 // 5 segundos
  });

  // Debe funcionar inmediatamente
  const response1 = await fetch(signedUrl);
  expect(response1.status).toBe(200);

  // Esperar expiración
  await sleep(6000);

  // Debe fallar
  const response2 = await fetch(signedUrl);
  expect(response2.status).toBe(403);
});
```

### Test 3: Lifecycle Transition a Cold Tier

```typescript
test('File moves to cold tier after 90 days', async () => {
  const oldFile = await createFileWithTimestamp({
    created_at: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000) // 91 días atrás
  });

  await storageService.applyLifecycleRules();

  const fileInfo = await s3.headObject({ Key: oldFile.s3_key });
  expect(fileInfo.StorageClass).toBe('GLACIER');
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `storage.media_files` - Metadata de archivos
- `storage.cdn_cache_rules` - Reglas de cache
- `storage.signed_urls` - URLs firmadas activas

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-CNT-003: Storage y CDN](../../02-especificaciones-tecnicas/07-contenido-media/ET-CNT-003-storage-cdn.md)

### Documentos Relacionados

- [RF-CNT-001: Gestión de Media](./RF-CNT-001-gestion-media.md)
- [RF-CNT-002: Tipos de Media y Procesamiento](./RF-CNT-002-tipos-media-procesamiento.md)

---

## 📝 Notas de Implementación

### Migración Inicial
1. Configurar bucket S3 con lifecycle rules
2. Configurar CloudFlare CDN con cache rules
3. Migrar archivos existentes (si aplica)
4. Configurar backup automático
5. Habilitar monitoreo y alertas

### Costos Iniciales
- Setup: $0 (servicios pay-as-you-go)
- Primer mes (estimado): $5-10
- Crecimiento: $10-15/mes por cada 1000 usuarios activos

### Alternativas Evaluadas
- **Vercel/Netlify:** No adecuados para archivos grandes
- **Self-hosted MinIO:** Mayor complejidad operacional
- **B2 Backblaze:** Económico pero menos features

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo DevOps, Backend, Finanzas
**Próxima revisión:** 2026-01-07
