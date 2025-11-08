# Sistema de Almacenamiento (Storage)

**Schema:** `storage`
**Propósito:** Integración con sistema de almacenamiento de archivos (Supabase Storage)
**Estado:** ✅ Implementado
**Última actualización:** 2025-11-08

---

## 📋 Descripción

El schema `storage` proporciona tipos y estructuras para la integración con el sistema de almacenamiento de archivos de Supabase Storage, utilizado para gestionar archivos multimedia de la plataforma (imágenes, videos, documentos, etc.).

---

## 🗂️ Objetos del Schema

### Enum: `buckettype`

**Archivo:** `apps/database/ddl/schemas/storage/enums/buckettype.sql`

**Descripción:** Define los tipos de buckets de almacenamiento disponibles.

**Valores:**
- `STANDARD` - Bucket estándar para archivos generales (imágenes de perfil, documentos, etc.)
- `ANALYTICS` - Bucket para datos de analytics y métricas

**Uso:**
Este enum probablemente se utiliza en el backend para categorizar y gestionar diferentes tipos de buckets de almacenamiento con políticas y configuraciones específicas.

---

## 🔗 Integración

### Supabase Storage

El schema `storage` está diseñado para integrarse con [Supabase Storage](https://supabase.com/docs/guides/storage), que proporciona:

- Almacenamiento de archivos con CDN global
- Transformaciones de imágenes automáticas
- Políticas de acceso (RLS)
- Gestión de cuotas y límites

### Buckets Esperados

Basado en el enum, se esperan al menos 2 buckets:

1. **Bucket STANDARD**
   - Propósito: Archivos generales de usuarios
   - Contenido típico:
     - Imágenes de perfil
     - Avatares
     - Documentos subidos
     - Recursos educativos multimedia

2. **Bucket ANALYTICS**
   - Propósito: Datos de analytics y reportes
   - Contenido típico:
     - Reportes exportados (PDF, CSV)
     - Gráficos y visualizaciones
     - Logs de sistema

---

## 📊 Relaciones con Otros Schemas

### Tablas que Referencian Storage

Es probable que las siguientes tablas hagan referencia a archivos en storage:

- `auth_management.profiles` - Avatar de usuario
- `educational_content.media_resources` - Recursos multimedia educativos
- `content_management.media_files` - Archivos de contenido
- `gamification_system.achievements` - Imágenes de logros/insignias

**Nota:** Las referencias no están en la BD directamente, sino que se manejan como URLs o paths desde el backend.

---

## 🔧 Uso en Backend

### Servicio de Storage

El backend debería tener un servicio de storage que:

1. Crea y gestiona buckets según el tipo
2. Sube archivos al bucket apropiado
3. Genera URLs firmadas para acceso controlado
4. Aplica transformaciones de imagen
5. Gestiona políticas de acceso

**Ejemplo conceptual:**

```typescript
// apps/backend/src/modules/storage/storage.service.ts

enum BucketType {
  STANDARD = 'STANDARD',
  ANALYTICS = 'ANALYTICS'
}

class StorageService {
  async uploadFile(file: File, bucketType: BucketType) {
    const bucket = this.getBucketName(bucketType);
    // Upload to Supabase Storage
  }
}
```

---

## 📝 Configuraciones Recomendadas

### Bucket STANDARD

```json
{
  "name": "gamilit-standard",
  "public": false,
  "file_size_limit": 52428800,  // 50MB
  "allowed_mime_types": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf"
  ]
}
```

### Bucket ANALYTICS

```json
{
  "name": "gamilit-analytics",
  "public": false,
  "file_size_limit": 104857600,  // 100MB
  "allowed_mime_types": [
    "application/pdf",
    "text/csv",
    "application/json"
  ]
}
```

---

## 🛡️ Seguridad

### Políticas RLS Recomendadas

Para el bucket STANDARD:
- Usuarios autenticados pueden subir a su carpeta personal
- Administradores pueden acceder a todos los archivos
- Archivos públicos (avatares) accesibles sin auth

Para el bucket ANALYTICS:
- Solo administradores y teachers pueden acceder
- Exportaciones personales solo por el usuario creador

---

## 📈 Métricas y Monitoring

### Métricas Importantes

1. **Uso de almacenamiento** por bucket
2. **Número de archivos** por tipo
3. **Ancho de banda** consumido
4. **Errores de upload/download**
5. **Transformaciones de imagen** ejecutadas

---

## 🔗 Referencias

- **Schema:** `apps/database/ddl/schemas/storage/`
- **Enum:** `apps/database/ddl/schemas/storage/enums/buckettype.sql`
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Backend (estimado):** `apps/backend/src/modules/storage/`

---

## ⚠️ Notas

- ✅ Enum definido y listo para uso
- ⚠️ No hay tablas en este schema (integración externa)
- ⚠️ Backend y políticas de storage requieren implementación/documentación
- 📋 Considerar agregar más tipos de buckets si es necesario:
  - `BACKUPS` - Para respaldos de sistema
  - `TEMP` - Para archivos temporales con auto-delete
  - `ARCHIVE` - Para archivos archivados (cold storage)

---

## 🎯 Próximos Pasos

1. Documentar servicio de storage en backend
2. Crear políticas RLS para buckets
3. Implementar gestión de cuotas por tenant
4. Configurar CDN y transformaciones de imagen
5. Crear sistema de limpieza de archivos huérfanos

---

**Creado:** 2025-11-08
**Tipo:** Documentación retroactiva
**Estado:** ✅ Documentación básica completa
