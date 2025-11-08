# _MAP: docs/01-requerimientos/08-auditoria-configuracion/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales de auditoría de acciones y configuración del sistema
**Audiencia:** Developers, Security Engineers, Compliance Officers, Admins
**Estado:** 🟡 En Desarrollo

---

## 📁 Contenido de esta Carpeta

| Documento | Título | Estado | Prioridad |
|-----------|--------|--------|-----------|
| [RF-AUD-001](./RF-AUD-001-sistema-auditoria.md) | Sistema de Auditoría y Logs | ✅ Implementado | Alta |
| [RF-AUD-002](./RF-AUD-002-alertas-notificaciones.md) | Alertas Automáticas y Notificaciones del Sistema | ✅ Implementado | Alta |
| [RF-AUD-003](./RF-AUD-003-niveles-logging.md) | Sistema de Logging con Niveles Configurables | ✅ Implementado | Alta |
| [RF-AUD-004](./RF-AUD-004-retencion-datos.md) | Políticas de Retención y Eliminación de Datos | ✅ Implementado | Alta |
| [RF-CFG-001](./RF-CFG-001-sistema-configuracion.md) | Sistema de Configuración y Feature Flags | ✅ Implementado | Alta |

**Total documentos:** 5/9 (56%)
**Estado:** 🟢 En Desarrollo

---

## 🎯 Funcionalidades Planeadas (Sin Documentar)

### Auditoría (Logging)

**Eventos a auditar:**
1. **Autenticación y Autorización**
   - Login exitoso/fallido
   - Logout
   - Cambios de rol/permisos
   - Impersonación de usuarios

2. **Acciones Críticas**
   - Creación/modificación/eliminación de usuarios
   - Cambios en configuración del sistema
   - Modificación de feature flags
   - Acceso a datos sensibles (PII)

3. **Contenido Educativo**
   - Creación/modificación de ejercicios
   - Publicación de contenido
   - Eliminación de tareas

4. **Acciones Administrativas**
   - Cambios en organizaciones
   - Modificación de cuotas
   - Acceso al panel de administración

**Información a registrar:**
- Timestamp (UTC)
- Usuario que realizó la acción
- IP Address
- User Agent
- Acción realizada (verbo + recurso)
- Resultado (éxito/fallo)
- Datos antes/después (para modificaciones)
- Contexto adicional (metadata)

### Configuración del Sistema

**Tipos de configuración:**
1. **Feature Flags** (ya implementado)
   - Activar/desactivar funcionalidades
   - Rollout gradual de features
   - A/B testing

2. **Parámetros del Sistema**
   - Límites de intentos (login, ejercicios)
   - Timeouts
   - Cuotas de storage
   - Configuración de gamificación (XP, ML Coins)

3. **Integraciones Externas**
   - APIs de terceros (OpenAI, Google, etc.)
   - Credenciales (encriptadas)
   - Webhooks

4. **Políticas de Seguridad**
   - Complejidad de contraseñas
   - Duración de sesiones
   - MFA obligatorio para roles

---

## 🔗 Interdependencias Anticipadas

### Módulos Relacionados

**Dependerá de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Eventos de auth a auditar
- [Admin Portal](../admin-portal/) - UI para ver audit logs y modificar configuración

**Usará:**
- Todos los módulos - Sistema transversal

### Documentación Relacionada

**Especificaciones Técnicas:**
- [ET-AUD-*](../../02-especificaciones-tecnicas/08-auditoria-configuracion/) (cuando exista)

**Database:**
- Schema: `audit_logging` → `apps/database/ddl/schemas/audit_logging/`
  - Tablas existentes: `audit_logs`
- Schema: `system_configuration` → `apps/database/ddl/schemas/system_configuration/`
  - Tablas existentes: `feature_flags`, `system_settings`

---

## 📊 Métricas

- **Total documentos:** 5/9 (56%)
- **RFs completos:** 5
- **Cobertura implementación:** 80% (auditoría, alertas, logging, retención, configuración)

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. [ ] Crear RF-AUD-001: Sistema de Audit Logging Completo
2. [ ] Crear RF-AUD-002: Configuración de Parámetros del Sistema
3. [ ] Crear RF-AUD-003: Retención y Archivado de Logs

### Prioridad Media
4. [ ] Crear RF-CFG-001: Feature Flags Avanzados (ya básico implementado)
5. [ ] Crear RF-CFG-002: Gestión de Credenciales de Integraciones
6. [ ] Crear RF-AUD-004: Dashboard de Auditoría para Admins

### Prioridad Baja
7. [ ] Crear RF-AUD-005: Alertas de Eventos Sospechosos
8. [ ] Crear RF-AUD-006: Exportación de Logs para Compliance
9. [ ] Crear RF-CFG-003: Versionado de Configuración

---

## ⚠️ Consideraciones de Cumplimiento

### Regulaciones Aplicables
- **GDPR** - Right to access, right to deletion
- **COPPA** - Protección de datos de menores (<13 años)
- **FERPA** - Privacidad de registros educativos (USA)
- **SOC 2** - Controles de seguridad y auditoría

### Requerimientos de Auditoría
- **Retención mínima:** 1 año para logs de acceso
- **Retención extendida:** 7 años para acciones críticas (compliance)
- **Inmutabilidad:** Logs no pueden ser modificados o eliminados (excepto por retención)
- **Acceso controlado:** Solo admins autorizados pueden ver logs

---

## 🔒 Consideraciones de Seguridad

### Protección de Datos Sensibles
- **No loggear PII directamente** - Solo referencias (user_id, no nombre completo)
- **Encriptar logs en reposo**
- **Enmascarar datos sensibles** en logs (emails, IPs parciales)
- **Acceso basado en roles** - Solo security team y super_admins

### Alertas de Seguridad
- Múltiples intentos de login fallidos
- Acceso desde IPs sospechosas
- Cambios en configuración crítica
- Acceso a datos de múltiples usuarios (scraping)

---

## 📚 Stack Tecnológico Anticipado

**Logging:**
- Pino (structured logging en backend)
- Winston (alternativa)
- OpenTelemetry (trazabilidad distribuida)

**Almacenamiento de Logs:**
- PostgreSQL `audit_logging.audit_logs` (corto plazo: 30 días)
- S3/Object Storage (largo plazo: comprimido, particionado por fecha)

**Visualización:**
- Admin Dashboard custom (React)
- Grafana (dashboards de auditoría)
- Datadog / New Relic (opcional, para producción)

**Alertas:**
- PagerDuty / OpsGenie (alertas críticas)
- Email notifications (alertas medias)

---

## 📖 Referencias Externas

**Mejores prácticas:**
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Cloud Security Alliance - Audit Logging](https://cloudsecurityalliance.org/)
- [NIST SP 800-92 - Guide to Computer Security Log Management](https://csrc.nist.gov/publications/detail/sp/800-92/final)
