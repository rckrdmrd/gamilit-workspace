
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-AUD-004 -->
<!-- ID Nuevo: M-AUD-REQ-004 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-AUD-REQ-004: Políticas de Retención y Eliminación de Datos

**ID:** RF-AUD-004
**Título:** Gestión del Ciclo de Vida de Datos
**Módulo:** 08-auditoria-configuracion
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐⭐ (Compliance GDPR)
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define las políticas de retención y eliminación de datos para la plataforma Gamilit, asegurando cumplimiento con regulaciones de privacidad (GDPR, COPPA) y optimizando almacenamiento. El sistema gestiona automáticamente el ciclo de vida completo de los datos desde su creación hasta su eliminación permanente.

El sistema permite:
- Políticas de retención diferenciadas por tipo de dato
- Eliminación automática según reglas configurables
- Soft delete con período de gracia
- Anonimización vs eliminación permanente
- Auditoría completa de eliminaciones
- Derecho al olvido (GDPR Article 17)

---

## 🎯 Objetivos

1. **Cumplir regulaciones** de privacidad (GDPR, COPPA)
2. **Optimizar almacenamiento** eliminando datos obsoletos
3. **Proteger datos** con soft delete y backups
4. **Facilitar auditorías** con registro completo
5. **Automatizar mantenimiento** de base de datos

---

## ✅ Requerimientos Funcionales

### M-AUD-REQ-004-01: Clasificación de Datos

**Descripción:** Clasificar datos según su sensibilidad y requisitos legales.

**4 Categorías de Datos:**

#### 1. Datos Personales Identificables (PII)
**Definición:** Información que identifica directamente a una persona.

**Incluye:**
- Nombre completo
- Email
- Teléfono
- Dirección física
- IP address (en algunos contextos)
- Fecha de nacimiento
- Foto de perfil con rostro reconocible

**Regulación:**
- **GDPR:** Derecho al olvido (eliminar a solicitud)
- **COPPA:** Requiere consentimiento parental para menores <13
- **Retención:** Máximo mientras cuenta esté activa + 30 días

**Acciones al Eliminar Cuenta:**
- Eliminación inmediata (hard delete)
- O anonimización (reemplazar con "Usuario Eliminado")

#### 2. Datos Transaccionales
**Definición:** Registros de actividad y transacciones.

**Incluye:**
- Historial de ejercicios completados
- Progreso en módulos
- Logros obtenidos
- Compras y pagos
- Sesiones de login
- Cambios en configuración

**Regulación:**
- **Contabilidad:** Registros financieros 7 años mínimo
- **Auditoría:** Logs de acceso 90 días mínimo
- **GDPR:** Puede anonimizarse en lugar de eliminarse

**Retención:**
- Datos financieros: 7 años (ley fiscal)
- Datos de actividad: 2 años (analítica)
- Logs de auditoría: 90 días (seguridad)

#### 3. Contenido Generado por Usuario
**Definición:** Contenido creado directamente por usuarios.

**Incluye:**
- Comentarios en ejercicios
- Publicaciones en foros
- Media subida (imágenes, audio)
- Respuestas en ejercicios de producción de texto

**Regulación:**
- **GDPR:** Puede conservarse anonimizado
- **Derecho de autor:** Usuario mantiene derechos

**Retención:**
- Con cuenta activa: Indefinido
- Después de eliminar cuenta:
  - Anonimizar (reemplazar autor con "Usuario Eliminado")
  - Mantener contenido si es valioso para comunidad
  - O eliminar completamente a solicitud explícita

#### 4. Datos Agregados y Analíticos
**Definición:** Métricas y estadísticas sin identificación personal.

**Incluye:**
- Métricas de uso (usuarios activos, ejercicios completados)
- Estadísticas de rendimiento
- Mapas de calor (anonimizados)
- Tasas de conversión

**Regulación:**
- **GDPR:** Exento si está completamente anonimizado
- No requiere consentimiento explícito

**Retención:**
- Indefinido (es anónimo)

---

### M-AUD-REQ-004-02: Políticas de Retención por Entidad

**Descripción:** Períodos de retención específicos por tipo de dato.

#### Tabla: auth_management.users

| Campo | Tipo | Retención | Al Eliminar Cuenta |
|-------|------|-----------|---------------------|
| `email` | PII | Mientras cuenta activa | Hard delete inmediato |
| `password_hash` | PII | Mientras cuenta activa | Hard delete inmediato |
| `full_name` | PII | Mientras cuenta activa | Hard delete o anonimizar |
| `date_of_birth` | PII | Mientras cuenta activa | Hard delete inmediato |
| `profile_picture` | PII | Mientras cuenta activa | Eliminar de storage |
| `last_login_at` | Transaccional | 90 días | Conservar anonimizado |
| `created_at` | Transaccional | Indefinido | Conservar anonimizado |

**Acción al Eliminar:**
```sql
-- Soft delete (30 días de gracia)
UPDATE auth_management.users
SET deleted_at = CURRENT_TIMESTAMP,
    account_status = 'deleted'
WHERE id = $1;

-- Hard delete (después de 30 días)
DELETE FROM auth_management.users WHERE id = $1;
```

#### Tabla: progress_tracking.user_progress

| Campo | Tipo | Retención | Al Eliminar Cuenta |
|-------|------|-----------|---------------------|
| `user_id` | PII | 2 años después de última actividad | Anonimizar o eliminar |
| `exercise_id` | Transaccional | Indefinido | Conservar anonimizado |
| `score` | Transaccional | 2 años | Conservar anonimizado |
| `completed_at` | Transaccional | 2 años | Conservar anonimizado |

**Anonimización:**
```sql
-- Reemplazar user_id con UUID anónimo
UPDATE progress_tracking.user_progress
SET user_id = '00000000-0000-0000-0000-000000000000',
    is_anonymized = TRUE
WHERE user_id = $1;
```

#### Tabla: audit_logging.audit_logs

| Campo | Tipo | Retención | Acción |
|-------|------|-----------|--------|
| `user_id` | PII | 90 días | Anonimizar después de 90 días |
| `action` | Transaccional | 90 días (info), 365 días (critical) | Eliminar según severidad |
| `ip_address` | PII (contextual) | 90 días | Eliminar o ofuscar |
| `created_at` | Transaccional | Según severidad | Eliminar |

**Política:**
```yaml
audit_logs:
  retention:
    critical: 365 days
    high: 180 days
    medium: 90 days
    low: 30 days
  anonymize_after: 90 days  # Ofuscar PII después de 90 días
```

#### Tabla: storage.media_files

| Campo | Tipo | Retención | Acción |
|-------|------|-----------|--------|
| `uploaded_by` | PII | Mientras cuenta activa + 90 días | Anonimizar |
| `file` | Contenido | Según tipo y uso | Ver política de media |
| `metadata` | Mixto | Igual que file | Conservar metadatos técnicos |

**Política:**
```yaml
media_files:
  retention:
    avatar: 0 days after account deletion  # Eliminar inmediatamente
    exercise_submission: 90 days after account deletion
    public_content: Indefinido (anonimizar autor)
    temporary_feedback: 90 days absolute
```

---

### M-AUD-REQ-004-03: Soft Delete vs Hard Delete

**Descripción:** Dos estrategias de eliminación según criticidad de datos.

#### Soft Delete (Eliminación Lógica)

**Uso:**
- Datos que pueden necesitar recuperación
- Período de gracia para cambio de opinión
- Mantenimiento de integridad referencial

**Implementación:**
```sql
-- Columna deleted_at en tablas relevantes
ALTER TABLE auth_management.users
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Soft delete
UPDATE auth_management.users
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Filtrar registros eliminados en queries
SELECT * FROM auth_management.users
WHERE deleted_at IS NULL;  -- Solo activos
```

**Ventajas:**
- Recuperación posible
- Auditoría completa
- No rompe foreign keys inmediatamente

**Desventajas:**
- Ocupa espacio
- Requiere limpieza posterior

**Período de Gracia:**
- Cuentas de usuario: 30 días
- Contenido: 90 días
- Configuración: 7 días

#### Hard Delete (Eliminación Física)

**Uso:**
- Después del período de soft delete
- Datos temporales sin valor histórico
- Cumplimiento GDPR (derecho al olvido)

**Implementación:**
```sql
-- Eliminar permanentemente
DELETE FROM auth_management.users
WHERE id = $1;

-- Con cascada (cuidado)
DELETE FROM auth_management.users
WHERE id = $1
CASCADE;  -- Elimina registros relacionados
```

**Ventajas:**
- Libera espacio inmediatamente
- Cumple GDPR al 100%
- No requiere filtrado en queries

**Desventajas:**
- Irreversible
- Puede romper foreign keys si no se maneja bien
- Sin auditoría del registro eliminado

**Auditoría de Hard Delete:**
Antes de eliminar, registrar en tabla de auditoría:
```sql
-- Auditar eliminación
INSERT INTO audit_logging.deletion_log (
    entity_type,
    entity_id,
    deleted_by,
    reason,
    data_snapshot  -- Snapshot JSON del registro
)
VALUES (
    'user',
    $1,
    $2,
    'User requested account deletion',
    row_to_json(user_record)
);

-- Luego eliminar
DELETE FROM auth_management.users WHERE id = $1;
```

---

### M-AUD-REQ-004-04: Eliminación Automática (Cron Jobs)

**Descripción:** Jobs programados para limpieza automática de datos expirados.

**Jobs Definidos:**

#### Job 1: Cleanup Soft Deleted Users (Diario)
```yaml
job:
  name: cleanup_soft_deleted_users
  schedule: "0 2 * * *"  # 2 AM diario
  description: Elimina permanentemente usuarios soft-deleted hace >30 días

action:
  - query: |
      DELETE FROM auth_management.users
      WHERE deleted_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND account_status = 'deleted'
  - notify: devops_team
    on: deleted_count > 100
```

#### Job 2: Cleanup Expired Audit Logs (Diario)
```yaml
job:
  name: cleanup_expired_audit_logs
  schedule: "0 3 * * *"  # 3 AM diario
  description: Elimina logs según política de retención por severidad

action:
  - query: |
      DELETE FROM audit_logging.audit_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND severity = 'low'
  - query: |
      DELETE FROM audit_logging.audit_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
        AND severity IN ('medium', 'high')
  - query: |
      DELETE FROM audit_logging.audit_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '365 days'
        AND severity = 'critical'
```

#### Job 3: Cleanup Temporary Files (Cada 6 horas)
```yaml
job:
  name: cleanup_temporary_files
  schedule: "0 */6 * * *"  # Cada 6 horas
  description: Elimina archivos temporales no referenciados

action:
  - query: |
      DELETE FROM storage.media_files
      WHERE is_temporary = TRUE
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
  - cleanup_s3_orphans: true
```

#### Job 4: Anonymize Old Logs (Semanal)
```yaml
job:
  name: anonymize_old_audit_logs
  schedule: "0 4 * * 0"  # Domingos 4 AM
  description: Anonimiza PII en logs >90 días

action:
  - query: |
      UPDATE audit_logging.audit_logs
      SET user_id = NULL,
          ip_address = regexp_replace(ip_address, '\d+$', 'XXX'),
          metadata = metadata - 'email' - 'phone'
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
        AND user_id IS NOT NULL
```

---

### M-AUD-REQ-004-05: Derecho al Olvido (GDPR Article 17)

**Descripción:** Proceso para eliminar completamente datos de un usuario a solicitud.

**Flujo Completo:**

```
┌──────────────────┐
│ Usuario solicita │
│ eliminación de   │
│ cuenta           │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Confirmación     │ Enviar email de confirmación
│ (24h para        │ con link único
│ cancelar)        │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Soft Delete      │ Marcar cuenta como deleted
│ (30 días gracia) │ Deshabilitar login
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Notificación     │ Informar al usuario
│ (7 días antes)   │ última oportunidad para recuperar
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Hard Delete      │ Eliminación permanente
│ (después 30 días)│ de todos los datos PII
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Anonimización    │ Datos transaccionales
│ de registros     │ se anonimizan (no eliminan)
│ históricos       │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Certificado de   │ Enviar confirmación
│ Eliminación      │ de eliminación completa
└──────────────────┘
```

**API Endpoint:**

```typescript
POST /api/users/request-deletion
{
  "userId": "uuid",
  "reason": "No longer need the service",  // Opcional
  "confirm": true
}

Response:
{
  "status": "deletion_scheduled",
  "softDeletedAt": "2025-11-07T10:00:00Z",
  "hardDeleteAt": "2025-12-07T10:00:00Z",  // 30 días después
  "cancellationDeadline": "2025-12-06T10:00:00Z",
  "confirmationToken": "abc-123"
}
```

**Cancelación (Dentro de 30 días):**

```typescript
POST /api/users/cancel-deletion
{
  "userId": "uuid",
  "confirmationToken": "abc-123"
}

Response:
{
  "status": "deletion_cancelled",
  "accountRestored": true
}
```

**Qué se Elimina:**

✅ **Hard Delete (Inmediato después de 30 días):**
- Email, password, nombre completo
- Teléfono, dirección, fecha de nacimiento
- Foto de perfil y archivos personales
- Tokens de sesión y OAuth
- Direcciones IP recientes
- Configuraciones personales

⚠️ **Anonimizar (Conservar sin PII):**
- Historial de progreso (para estadísticas)
- Comentarios públicos (reemplazar autor con "Usuario Eliminado")
- Compras (para contabilidad, eliminar datos de pago)

❌ **Conservar (Requisitos Legales):**
- Registros financieros (7 años por ley fiscal)
- Logs de auditoría críticos (1 año por seguridad)

---

### M-AUD-REQ-004-06: Backups y Recuperación

**Descripción:** Gestión de backups con política de retención.

**Estrategia de Backup:**

#### Backup Completo (Semanal)
```yaml
full_backup:
  schedule: "0 1 * * 0"  # Domingos 1 AM
  retention: 4 weeks
  storage: S3 Glacier
  compression: gzip
  encryption: AES-256
```

#### Backup Incremental (Diario)
```yaml
incremental_backup:
  schedule: "0 1 * * 1-6"  # Lunes a Sábado 1 AM
  retention: 7 days
  storage: S3 Standard
  compression: gzip
```

#### Backup Transaccional (Continuo)
```yaml
transaction_log_backup:
  schedule: continuous  # WAL archiving
  retention: 7 days
  storage: S3 Standard
  point_in_time_recovery: true
```

**Retención de Backups:**

| Tipo | Frecuencia | Retención | Storage Tier |
|------|------------|-----------|--------------|
| Completo | Semanal | 4 semanas | Glacier |
| Incremental | Diario | 7 días | Standard |
| Transaccional | Continuo | 7 días | Standard |
| Archive | Mensual | 12 meses | Deep Archive |

**Eliminación de Datos en Backups:**

Problema: Backups contienen datos que deberían eliminarse (GDPR).

Solución:
1. **Backups nuevos:** No incluyen datos eliminados
2. **Backups antiguos:** Se conservan completos (restauración completa si es necesario)
3. **Point-in-time recovery:** Limitado a 30 días (después se pierde capacidad de restaurar datos eliminados)

**Política GDPR:**
- Backups >30 días pueden contener datos "eliminados" (aceptable por GDPR si es impracticable eliminarlos)
- Documentar en Privacy Policy
- No usar backups antiguos excepto en desastre

---

## 📊 Métricas y Reporting

### Métricas de Retención

**KPIs:**
- Total de datos almacenados por categoría
- Tasa de crecimiento de datos (GB/mes)
- Datos eliminados automáticamente (últimos 30 días)
- Cuentas en soft delete pendientes

**Dashboard:**
```
┌────────────────────────────────────────────────┐
│ DATA RETENTION METRICS                         │
├────────────────────────────────────────────────┤
│ Total Storage: 1.2 TB                          │
│   ├─ PII: 50 GB                                │
│   ├─ Transactional: 800 GB                     │
│   ├─ Media: 300 GB                             │
│   └─ Logs: 50 GB                               │
│                                                 │
│ Scheduled for Deletion:                        │
│   ├─ Soft deleted users: 45 (hard delete in 5 days) │
│   ├─ Expired logs: 2.1M records                │
│   └─ Temporary files: 1,234 files             │
│                                                 │
│ Compliance:                                     │
│   ├─ GDPR deletion requests: 12 (last 30 days) │
│   ├─ Average deletion time: 31 days            │
│   └─ Backup retention: ✅ Compliant           │
└────────────────────────────────────────────────┘
```

---

## 🧪 Casos de Prueba

### Test 1: Soft Delete con Período de Gracia

```typescript
test('User soft delete with 30-day grace period', async () => {
  const user = await createTestUser();

  // Solicitar eliminación
  await userService.requestDeletion(user.id);

  // Verificar soft delete
  const deletedUser = await userService.findById(user.id);
  expect(deletedUser.deleted_at).toBeDefined();
  expect(deletedUser.account_status).toBe('deleted');

  // No debe poder loguearse
  await expect(authService.login(user.email, 'password'))
    .rejects.toThrow('Account has been deleted');

  // Cancelar eliminación
  await userService.cancelDeletion(user.id);

  // Verificar restauración
  const restoredUser = await userService.findById(user.id);
  expect(restoredUser.deleted_at).toBeNull();
  expect(restoredUser.account_status).toBe('active');
});
```

### Test 2: Cleanup Automático de Logs

```typescript
test('Cleanup expired audit logs', async () => {
  // Crear logs con diferentes fechas
  await createAuditLog({ severity: 'low', created_at: '2024-10-01' });  // >30 días
  await createAuditLog({ severity: 'low', created_at: '2025-11-01' });  // Reciente

  // Ejecutar cleanup
  await cleanupService.cleanupExpiredAuditLogs();

  // Verificar que log viejo fue eliminado
  const oldLog = await findAuditLog({ created_at: '2024-10-01' });
  expect(oldLog).toBeNull();

  // Verificar que log reciente se conserva
  const recentLog = await findAuditLog({ created_at: '2025-11-01' });
  expect(recentLog).toBeDefined();
});
```

### Test 3: Anonimización de Datos

```typescript
test('Anonymize user data after deletion', async () => {
  const user = await createTestUser({ email: 'test@example.com' });
  await createProgressRecords(user.id, 10);

  // Eliminar cuenta (hard delete)
  await userService.hardDelete(user.id);

  // Verificar que usuario fue eliminado
  const deletedUser = await userService.findById(user.id);
  expect(deletedUser).toBeNull();

  // Verificar que progreso fue anonimizado (no eliminado)
  const progress = await progressService.findByUserId(user.id);
  expect(progress).toHaveLength(0);

  const anonymousProgress = await progressService.findAnonymous();
  expect(anonymousProgress).toHaveLength(10);
  expect(anonymousProgress[0].user_id).toBe('00000000-0000-0000-0000-000000000000');
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- Todas las tablas con `deleted_at` column
- `audit_logging.deletion_log` - Registro de eliminaciones
- `system_configuration.retention_policies` - Políticas configurables

### Especificación Técnica

📘 **Documento ET Relacionado:**
- Implementación en ETdel módulo de auditoría

### Documentos Relacionados

- [RF-AUD-001: Sistema de Auditoría](./RF-AUD-001-sistema-auditoria.md)
- [RF-AUTH-002: Estados de Cuenta](../01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md)

---

## 📚 Referencias Legales

**GDPR (General Data Protection Regulation):**
- Article 17: Right to Erasure ("Right to be Forgotten")
- Article 5: Storage Limitation Principle
- Article 32: Security of Processing (backups)

**COPPA (Children's Online Privacy Protection Act):**
- Parental consent for minors <13
- Deletion of data upon parent request

---

**Última revisión:** 2025-11-07
**Revisores:** Legal Team, DevOps Team, DPO (Data Protection Officer)
**Próxima revisión:** 2026-01-07
