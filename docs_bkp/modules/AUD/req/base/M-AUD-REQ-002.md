
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-AUD-002 -->
<!-- ID Nuevo: M-AUD-REQ-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-AUD-REQ-002: Sistema de Alertas y Notificaciones

**ID:** RF-AUD-002
**Título:** Alertas Automáticas y Notificaciones del Sistema
**Módulo:** 08-auditoria-configuracion
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Descripción General

Este requerimiento funcional define el sistema de alertas automáticas y notificaciones para eventos críticos del sistema Gamilit. El sistema monitorea continuamente métricas de operación, seguridad y rendimiento, enviando notificaciones en tiempo real cuando se detectan anomalías o se superan umbrales definidos.

El sistema permite:
- Alertas automáticas basadas en reglas
- Múltiples canales de notificación (email, Slack, webhook)
- Configuración de umbrales por severidad
- Agrupación de alertas similares
- Escalamiento automático

---

## 🎯 Objetivos

1. **Detectar problemas proactivamente** antes de que afecten a usuarios
2. **Notificar al equipo correcto** según tipo y severidad
3. **Reducir ruido** con agrupación y deduplicación
4. **Facilitar respuesta rápida** con contexto completo
5. **Mantener historial** de alertas y resoluciones

---

## ✅ Requerimientos Funcionales

### M-AUD-REQ-002-01: Tipos de Alertas

**Descripción:** Sistema clasificado de alertas según área afectada.

**Tipos de Alertas:**

#### 1. Alertas de Seguridad (Security)
Eventos que comprometen o intentan comprometer la seguridad:

- **Intentos de login fallidos excesivos** (>5 en 5 minutos)
- **Acceso no autorizado** detectado
- **Cambios en roles/permisos** de usuarios críticos
- **API abuse** (rate limiting excedido)
- **Malware detectado** en archivos subidos
- **Ataques DDoS** detectados

**Severidad por defecto:** Critical/High
**Destinatarios:** Security Team, DevOps Team
**Respuesta esperada:** Inmediata (<5 minutos)

#### 2. Alertas de Rendimiento (Performance)
Degradación de métricas de rendimiento:

- **Latencia elevada** (P95 >500ms)
- **CPU alta** (>80% por >5 minutos)
- **Memoria alta** (>85% por >3 minutos)
- **Disco lleno** (>90%)
- **Queue backlog** (>1000 jobs pendientes)
- **Database slow queries** (>2s)

**Severidad por defecto:** Medium/High
**Destinatarios:** DevOps Team, Backend Team
**Respuesta esperada:** Dentro de 30 minutos

#### 3. Alertas de Disponibilidad (Availability)
Servicios o componentes no disponibles:

- **Servicio caído** (health check failed)
- **Database connection errors**
- **S3/Storage no accesible**
- **CDN degradado**
- **External API down** (OAuth providers, etc.)
- **Worker proceso muerto**

**Severidad por defecto:** Critical
**Destinatarios:** On-call Engineer, DevOps Team
**Respuesta esperada:** Inmediata (<5 minutos)

#### 4. Alertas de Negocio (Business)
Métricas de negocio anormales:

- **Registro de usuarios excepcionalmente bajo** (<50% del promedio)
- **Tasa de error en ejercicios alta** (>20%)
- **Abandono de sesión elevado** (>60%)
- **Pagos fallando** (>10% de transacciones)
- **Emails rebotando** (>15% bounce rate)

**Severidad por defecto:** Medium
**Destinatarios:** Product Team, Support Team
**Respuesta esperada:** Dentro de 4 horas

#### 5. Alertas de Costos (Cost)
Costos operacionales fuera de presupuesto:

- **Storage costos elevados** (>$100/mes)
- **Database costos elevados** (>$50/mes)
- **Bandwidth excedido** (>1TB/mes)
- **API usage excedido** (facturas inesperadas)

**Severidad por defecto:** Medium
**Destinatarios:** DevOps Lead, Finance Team
**Respuesta esperada:** Dentro de 24 horas

#### 6. Alertas de Datos (Data)
Integridad y consistencia de datos:

- **Backup fallido**
- **Inconsistencia detectada** (foreign key violations)
- **Migration failed**
- **Datos huérfanos** detectados
- **Corrupción de archivos** en storage

**Severidad por defecto:** High
**Destinatarios:** Database Team, Backend Team
**Respuesta esperada:** Dentro de 1 hora

---

### M-AUD-REQ-002-02: Niveles de Severidad

**Descripción:** Clasificación de alertas según urgencia e impacto.

**4 Niveles de Severidad:**

#### Critical (Crítico)
- **Impacto:** Sistema completamente inoperante o compromiso de seguridad mayor
- **Ejemplos:**
  - Database caída
  - Aplicación inaccesible
  - Brecha de seguridad activa
  - Pérdida de datos
- **SLA de respuesta:** <5 minutos
- **Notificación:** Email + SMS + Slack mention + PagerDuty
- **Escalamiento:** Automático a manager después de 10 minutos sin ACK

#### High (Alta)
- **Impacto:** Funcionalidad crítica afectada, algunos usuarios impactados
- **Ejemplos:**
  - Latencia >1s (P95)
  - Rate de error >5%
  - Feature importante rota
  - Backup fallido
- **SLA de respuesta:** <30 minutos
- **Notificación:** Email + Slack message
- **Escalamiento:** Manual si no se resuelve en 2 horas

#### Medium (Media)
- **Impacto:** Degradación menor, pocos usuarios afectados
- **Ejemplos:**
  - Latencia >500ms (P95)
  - Queue con backlog moderado
  - Métricas de negocio bajas
  - Logs con warnings frecuentes
- **SLA de respuesta:** <4 horas
- **Notificación:** Email + Slack message
- **Escalamiento:** No automático

#### Low (Baja)
- **Impacto:** Informativo, sin impacto inmediato en usuarios
- **Ejemplos:**
  - Actualizaciones de dependencias disponibles
  - Certificado SSL expira en 30 días
  - Storage al 70% de capacidad
  - Logs de debug inusuales
- **SLA de respuesta:** <24 horas
- **Notificación:** Solo email
- **Escalamiento:** No automático

---

### M-AUD-REQ-002-03: Canales de Notificación

**Descripción:** Múltiples canales para enviar alertas según preferencias y severidad.

#### Canal 1: Email
**Uso:** Todas las severidades
**Configuración:**
```json
{
  "to": ["devops@gamilit.com", "oncall@gamilit.com"],
  "subject_template": "[{severity}] {alert_type}: {alert_title}",
  "html_template": "templates/alert-email.html",
  "batch_window": 300 // 5 minutos (agrupar emails)
}
```

**Características:**
- Formato HTML con contexto completo
- Links directos a dashboards relevantes
- Historial de alertas similares
- Botón "Acknowledge" inline

#### Canal 2: Slack
**Uso:** Critical, High, Medium
**Configuración:**
```json
{
  "webhook_url": "https://hooks.slack.com/services/...",
  "channel": "#alerts-prod",
  "mention_on_critical": true,
  "mention_users": ["@oncall", "@devops-lead"]
}
```

**Características:**
- Mensajes con colores según severidad
- Botones interactivos (Acknowledge, Resolve, Escalate)
- Thread para actualizaciones de la misma alerta
- Menciones automáticas en Critical

#### Canal 3: Webhook (Genérico)
**Uso:** Integración con sistemas externos
**Configuración:**
```json
{
  "url": "https://external-system.com/webhooks/alerts",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
  },
  "retry_attempts": 3
}
```

**Payload:**
```json
{
  "alert_id": "uuid",
  "type": "security",
  "severity": "critical",
  "title": "Excessive login failures detected",
  "description": "User user@example.com: 10 failed attempts in 2 minutes",
  "timestamp": "2025-11-07T10:30:00Z",
  "metadata": {
    "user_id": "uuid",
    "ip_address": "192.168.1.1",
    "count": 10
  },
  "actions": [
    {
      "name": "Block IP",
      "endpoint": "/api/security/block-ip",
      "params": {"ip": "192.168.1.1"}
    }
  ]
}
```

#### Canal 4: SMS (Opcional)
**Uso:** Solo Critical
**Proveedor:** Twilio
**Configuración:**
```json
{
  "enabled": false, // Deshabilitado por defecto (costoso)
  "phone_numbers": ["+521234567890"],
  "message_template": "[CRITICAL] {alert_type}: {short_description}"
}
```

#### Canal 5: PagerDuty (Opcional)
**Uso:** Critical alerts con on-call rotation
**Configuración:**
```json
{
  "enabled": false,
  "integration_key": "pagerduty_key",
  "auto_acknowledge": true,
  "escalation_policy": "default"
}
```

---

### M-AUD-REQ-002-04: Reglas de Alerta

**Descripción:** Definición de condiciones que disparan alertas automáticamente.

**Estructura de una Regla:**

```yaml
alert_rule:
  id: "high_error_rate"
  name: "High Error Rate Detected"
  description: "Triggers when error rate exceeds 5% for 5 minutes"

  # Condición
  condition:
    metric: "http_errors_rate"
    operator: ">"
    threshold: 0.05
    duration: 300 # segundos
    aggregation: "avg"

  # Metadata
  type: "performance"
  severity: "high"
  enabled: true

  # Notificación
  notification:
    channels: ["email", "slack"]
    throttle: 600 # No repetir si ya se envió hace <10 min

  # Acciones automáticas (opcional)
  actions:
    - type: "scale_up"
      params:
        service: "backend"
        instances: 2
```

**Reglas Predefinidas:**

#### Seguridad
1. **Excessive Login Failures**
   - Condición: >5 fallos en 5 minutos por usuario
   - Severidad: High
   - Acción: Bloqueo temporal (15 minutos)

2. **Brute Force Attack Detected**
   - Condición: >50 fallos en 5 minutos desde misma IP
   - Severidad: Critical
   - Acción: Bloqueo permanente de IP

3. **Unauthorized Access Attempt**
   - Condición: Acceso a recurso denegado (403) repetido
   - Severidad: High

#### Rendimiento
1. **High Latency**
   - Condición: P95 >500ms por >5 minutos
   - Severidad: Medium

2. **Very High Latency**
   - Condición: P95 >1000ms por >2 minutos
   - Severidad: High

3. **High CPU Usage**
   - Condición: CPU >80% por >5 minutos
   - Severidad: Medium
   - Acción: Auto-scale si está habilitado

#### Disponibilidad
1. **Service Down**
   - Condición: Health check failed (3 intentos consecutivos)
   - Severidad: Critical
   - Acción: Restart automático + notificación

2. **Database Connection Errors**
   - Condición: >10 errores de conexión en 1 minuto
   - Severidad: Critical

---

### M-AUD-REQ-002-05: Gestión de Alertas

**Descripción:** Workflow completo de una alerta desde creación hasta resolución.

**Estados de una Alerta:**

```
┌─────────┐
│ Pending │ Alerta generada, aún no notificada (batch window)
└────┬────┘
     ▼
┌─────────┐
│  Fired  │ Notificación enviada, esperando acknowledgement
└────┬────┘
     ├─ timeout (10 min) → Escalate
     ▼
┌──────────────┐
│ Acknowledged │ Alguien está trabajando en ello
└──────┬───────┘
       ├─ timeout (2 horas) → Escalate
       ▼
┌──────────┐
│ Resolved │ Problema solucionado
└────┬─────┘
     │
     ▼
┌──────────┐
│  Closed  │ Verificado que no vuelve a ocurrir (24h sin repetir)
└──────────┘
```

**Acciones Disponibles:**

1. **Acknowledge (ACK)**
   - Indica que alguien está trabajando en el problema
   - Detiene notificaciones repetidas
   - Registra quién ACK y cuándo

2. **Resolve**
   - Marca la alerta como resuelta
   - Requiere nota explicando la resolución
   - Alerta pasa a estado "monitoring" por 24h

3. **Escalate**
   - Notifica al siguiente nivel (manager, senior engineer)
   - Manual o automático por timeout

4. **Snooze**
   - Silencia temporalmente (15 min, 1h, 4h, 24h)
   - Útil para mantenimientos programados
   - Se reactiva automáticamente después del período

5. **Suppress**
   - Desactiva permanentemente esta alerta específica
   - Requiere justificación
   - Solo para false positives confirmados

---

### M-AUD-REQ-002-06: Agrupación y Deduplicación

**Descripción:** Reducir ruido agrupando alertas relacionadas.

**Estrategias:**

#### 1. Agrupación por Similaridad
Alertas del mismo tipo y recurso se agrupan:

```
Antes (5 alertas separadas):
- High CPU on backend-1 (85%)
- High CPU on backend-2 (87%)
- High CPU on backend-3 (82%)
- High CPU on backend-4 (88%)
- High CPU on backend-5 (84%)

Después (1 alerta agrupada):
- High CPU across 5 backend instances (avg: 85.2%)
  - backend-1: 85%
  - backend-2: 87%
  - backend-3: 82%
  - backend-4: 88%
  - backend-5: 84%
```

#### 2. Deduplicación Temporal
No enviar la misma alerta repetidamente:

- **Throttle window:** 10 minutos (configurable)
- **Fingerprint:** Hash de (tipo + recurso + condición)
- **Update en lugar de nuevo:** Actualiza contador y timestamp

Ejemplo:
```
10:00 - [FIRED] High CPU on backend-1
10:05 - [UPDATE] High CPU on backend-1 (still active, count: 2)
10:10 - [UPDATE] High CPU on backend-1 (still active, count: 3)
10:15 - [RESOLVED] High CPU on backend-1 back to normal
```

#### 3. Agrupación por Ventana de Tiempo
Batch múltiples alertas en un solo mensaje:

- **Batch window:** 5 minutos
- **Max alerts per batch:** 20
- **Formato:** Digest con tabla resumen

---

### M-AUD-REQ-002-07: Dashboard de Alertas

**Descripción:** Interfaz web para visualizar y gestionar alertas.

**Vistas Principales:**

#### Vista 1: Alertas Activas
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 ACTIVE ALERTS (12)                      [Filters ▼] │
├─────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL (2)                                         │
│   ├─ Database Connection Errors                         │
│   │   Status: Acknowledged by @john                     │
│   │   Started: 2 minutes ago                            │
│   │   [View Details] [Resolve] [Escalate]              │
│   │                                                      │
│   └─ Service Down: backend-prod-3                       │
│       Status: Fired (no ACK)                            │
│       Started: 30 seconds ago                           │
│       [Acknowledge] [View Logs] [Restart Service]       │
│                                                          │
│ 🟠 HIGH (5)                                             │
│   ├─ High Latency: P95 > 1000ms                        │
│   └─ Backup Failed: daily-backup-20251107              │
│                                                          │
│ 🟡 MEDIUM (5)                                           │
│   ├─ Queue Backlog: 1,234 pending jobs                 │
│   └─ Storage at 85% capacity                           │
└─────────────────────────────────────────────────────────┘
```

#### Vista 2: Historial
- Todas las alertas (últimos 30 días)
- Filtros: severidad, tipo, estado, fecha
- Métricas: MTTD, MTTR, tasa de resolución

#### Vista 3: Reglas de Alerta
- Listado de todas las reglas configuradas
- Edición inline de umbrales
- Habilitar/deshabilitar reglas
- Crear nuevas reglas (UI o YAML)

#### Vista 4: Estadísticas
- Alertas por día/semana/mes
- Top 10 alertas más frecuentes
- Tiempo promedio de resolución por tipo
- Tasa de false positives

---

## 🔒 Consideraciones de Seguridad

### Control de Acceso
- Solo roles `admin_teacher` y `super_admin` pueden ver alertas
- Logs de auditoría para todas las acciones sobre alertas
- Alertas de seguridad tienen acceso restringido adicional

### Protección de Datos Sensibles
- No incluir passwords en mensajes de alerta
- Ofuscar información PII (emails parciales, IPs parciales)
- Alertas con datos sensibles solo por canal seguro (no Slack público)

### Rate Limiting
- Máximo 100 alertas/hora por tipo (evitar storm)
- Si se excede, enviar solo un "Alert Storm Detected" summary

---

## 📊 Métricas de Alertas

### KPIs Operacionales

**MTTD (Mean Time to Detect):**
- Target: <1 minuto
- Tiempo desde evento hasta alerta generada

**MTTA (Mean Time to Acknowledge):**
- Critical: <5 minutos
- High: <30 minutos
- Medium: <4 horas

**MTTR (Mean Time to Resolution):**
- Critical: <1 hora
- High: <4 horas
- Medium: <24 horas

**Tasa de False Positives:**
- Target: <5%
- Alertas marcadas como "suppress" / total alertas

---

## 🧪 Casos de Prueba

### Test 1: Alerta Critical con Escalamiento

```typescript
test('Critical alert escalates after 10 min without ACK', async () => {
  // Simular alerta critical
  await alertService.fireAlert({
    type: 'availability',
    severity: 'critical',
    title: 'Database connection lost',
    resource: 'postgres-prod'
  });

  // Verificar notificación inmediata
  const notifications = await getNotificationsSent();
  expect(notifications).toContainEqual({
    channel: 'slack',
    mentions: ['@oncall']
  });

  // Esperar 10 minutos sin ACK
  await advanceTime(10 * 60 * 1000);

  // Verificar escalamiento automático
  const escalated = await getNotificationsSent();
  expect(escalated).toContainEqual({
    channel: 'email',
    to: ['manager@gamilit.com']
  });
});
```

### Test 2: Deduplicación de Alertas

```typescript
test('Duplicate alerts within throttle window are grouped', async () => {
  // Enviar 5 alertas idénticas en 2 minutos
  for (let i = 0; i < 5; i++) {
    await alertService.fireAlert({
      type: 'performance',
      severity: 'medium',
      title: 'High CPU',
      resource: 'backend-1'
    });
    await sleep(30000); // 30 segundos
  }

  // Verificar que solo se envió 1 notificación (con update count)
  const notifications = await getNotificationsSent();
  expect(notifications).toHaveLength(1);
  expect(notifications[0].metadata.count).toBe(5);
});
```

### Test 3: Agrupación de Alertas Similares

```typescript
test('Similar alerts are grouped in batch', async () => {
  // Simular high CPU en 5 instancias
  for (let i = 1; i <= 5; i++) {
    await alertService.fireAlert({
      type: 'performance',
      severity: 'medium',
      title: 'High CPU',
      resource: `backend-${i}`
    });
  }

  // Esperar batch window (5 minutos)
  await advanceTime(5 * 60 * 1000);

  // Verificar que se envió 1 notificación agrupada
  const notifications = await getNotificationsSent();
  expect(notifications).toHaveLength(1);
  expect(notifications[0].title).toContain('High CPU across 5 instances');
});
```

---

## 🔗 Referencias

### Implementación DDL

🗄️ **Tablas:**
- `system_configuration.alerts` - Definición de alertas activas
- `system_configuration.alert_rules` - Reglas de disparo
- `system_configuration.alert_channels` - Configuración de canales
- `system_configuration.alert_history` - Historial completo

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-AUD-002: Alertas y Notificaciones](../../02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-002-alertas-notificaciones.md)

### Documentos Relacionados

- [RF-AUD-001: Sistema de Auditoría](./RF-AUD-001-sistema-auditoria.md)
- [RF-AUD-003: Niveles de Logging](./RF-AUD-003-niveles-logging.md)

---

## 📝 Notas de Implementación

### Priorización de Desarrollo

**Fase 1 (MVP):**
- Alertas de seguridad y disponibilidad (Critical/High)
- Canal: Email + Slack
- Reglas básicas hardcoded

**Fase 2:**
- Dashboard web para gestionar alertas
- Agrupación y deduplicación
- Todas las severidades

**Fase 3:**
- Webhooks genéricos
- Reglas configurables por UI
- Escalamiento automático

### Herramientas Recomendadas

**Monitoreo:**
- Prometheus + Grafana (métricas)
- AlertManager (gestión de alertas)

**Notificaciones:**
- Nodemailer (email)
- Slack SDK (@slack/web-api)
- Twilio (SMS, opcional)

---

**Última revisión:** 2025-11-07
**Revisores:** DevOps Team, Security Team
**Próxima revisión:** 2026-01-07
