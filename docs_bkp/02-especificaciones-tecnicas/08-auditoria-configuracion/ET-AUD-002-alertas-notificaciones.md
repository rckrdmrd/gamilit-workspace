# ET-AUD-002: Especificación Técnica - Alertas y Notificaciones

**ID:** ET-AUD-002
**Título:** Implementación del Sistema de Alertas y Notificaciones
**Módulo:** 08-auditoria-configuracion
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación del sistema de alertas automáticas y notificaciones para la plataforma Gamilit, incluyendo reglas de alerta, canales de notificación (email, Slack, webhook), agrupación, escalamiento y gestión del ciclo de vida de alertas.

---

## 🔗 Referencias

**Implementa:**
- [RF-AUD-002: Alertas y Notificaciones](../../01-requerimientos/08-auditoria-configuracion/RF-AUD-002-alertas-notificaciones.md)

**Relacionado con:**
- [ET-AUD-001: Sistema de Auditoría](./ET-AUD-001-sistema-auditoria.md)
- [ET-AUD-003: Niveles de Logging](./ET-AUD-003-niveles-logging.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 Tabla: `alerts`

```sql
-- Archivo: apps/database/ddl/schemas/system_configuration/tables/alerts.sql
CREATE TYPE system_configuration.alert_type AS ENUM (
    'security', 'performance', 'availability', 'business', 'cost', 'data'
);

CREATE TYPE system_configuration.alert_severity AS ENUM (
    'critical', 'high', 'medium', 'low'
);

CREATE TYPE system_configuration.alert_status AS ENUM (
    'pending', 'fired', 'acknowledged', 'resolved', 'closed'
);

CREATE TABLE system_configuration.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type system_configuration.alert_type NOT NULL,
    severity system_configuration.alert_severity NOT NULL,
    status system_configuration.alert_status NOT NULL DEFAULT 'pending',

    title VARCHAR(200) NOT NULL,
    description TEXT,
    resource VARCHAR(200),  -- recurso afectado (ej: "backend-1", "postgres-prod")

    metadata JSONB DEFAULT '{}',  -- datos adicionales
    fingerprint VARCHAR(64) NOT NULL,  -- hash para deduplicación

    count INT NOT NULL DEFAULT 1,  -- cuántas veces ocurrió (dedup)
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,

    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,

    closed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_status ON system_configuration.alerts(status) WHERE status IN ('pending', 'fired', 'acknowledged');
CREATE INDEX idx_alerts_severity ON system_configuration.alerts(severity);
CREATE INDEX idx_alerts_fingerprint ON system_configuration.alerts(fingerprint);
CREATE INDEX idx_alerts_resource ON system_configuration.alerts(resource);
```

### 1.2 Tabla: `alert_rules`

```sql
-- Archivo: apps/database/ddl/schemas/system_configuration/tables/alert_rules.sql
CREATE TABLE system_configuration.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    type system_configuration.alert_type NOT NULL,
    severity system_configuration.alert_severity NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Condición
    condition JSONB NOT NULL,  -- { metric, operator, threshold, duration }

    -- Notificación
    notification_channels TEXT[] NOT NULL DEFAULT ARRAY['email'],  -- email, slack, webhook
    throttle_seconds INT NOT NULL DEFAULT 600,  -- no repetir si se envió hace <10 min

    -- Acciones automáticas (opcional)
    actions JSONB DEFAULT '[]',

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_enabled ON system_configuration.alert_rules(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_alert_rules_type ON system_configuration.alert_rules(type);
```

### 1.3 Tabla: `alert_notifications`

```sql
-- Archivo: apps/database/ddl/schemas/system_configuration/tables/alert_notifications.sql
CREATE TYPE system_configuration.notification_status AS ENUM (
    'pending', 'sent', 'failed', 'throttled'
);

CREATE TABLE system_configuration.alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES system_configuration.alerts(id) ON DELETE CASCADE,

    channel VARCHAR(50) NOT NULL,  -- email, slack, webhook, sms
    status system_configuration.notification_status NOT NULL DEFAULT 'pending',

    recipients TEXT[] NOT NULL,  -- emails, user IDs, etc.
    payload JSONB NOT NULL,

    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_notifications_alert ON system_configuration.alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_status ON system_configuration.alert_notifications(status) WHERE status = 'pending';
```

### 1.4 Función: `fire_alert`

```sql
-- Archivo: apps/database/ddl/schemas/system_configuration/functions/fire_alert.sql
CREATE OR REPLACE FUNCTION system_configuration.fire_alert(
    p_type system_configuration.alert_type,
    p_severity system_configuration.alert_severity,
    p_title VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_resource VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
    v_fingerprint VARCHAR(64);
    v_existing_alert RECORD;
BEGIN
    -- Generar fingerprint para deduplicación
    v_fingerprint := encode(digest(p_type::TEXT || p_title || COALESCE(p_resource, ''), 'sha256'), 'hex');

    -- Buscar alerta existente activa
    SELECT * INTO v_existing_alert
    FROM system_configuration.alerts
    WHERE fingerprint = v_fingerprint
      AND status IN ('pending', 'fired', 'acknowledged')
      AND last_seen_at > CURRENT_TIMESTAMP - INTERVAL '10 minutes';

    IF FOUND THEN
        -- Actualizar alerta existente (deduplicación)
        UPDATE system_configuration.alerts
        SET count = count + 1,
            last_seen_at = CURRENT_TIMESTAMP,
            metadata = p_metadata,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_existing_alert.id
        RETURNING id INTO v_alert_id;
    ELSE
        -- Crear nueva alerta
        INSERT INTO system_configuration.alerts (
            type, severity, status, title, description, resource, metadata, fingerprint
        ) VALUES (
            p_type, p_severity, 'fired', p_title, p_description, p_resource, p_metadata, v_fingerprint
        )
        RETURNING id INTO v_alert_id;
    END IF;

    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Service: `AlertService`

```typescript
// Archivo: apps/backend/src/modules/monitoring/services/alert.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationService } from './notification.service';

interface AlertOptions {
    type: 'security' | 'performance' | 'availability' | 'business' | 'cost' | 'data';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description?: string;
    resource?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class AlertService {
    constructor(
        private dataSource: DataSource,
        private notificationService: NotificationService
    ) {}

    async fireAlert(options: AlertOptions): Promise<string> {
        // Crear alerta en DB (con deduplicación automática)
        const result = await this.dataSource.query(`
            SELECT system_configuration.fire_alert($1, $2, $3, $4, $5, $6)
        `, [
            options.type,
            options.severity,
            options.title,
            options.description || null,
            options.resource || null,
            JSON.stringify(options.metadata || {})
        ]);

        const alertId = result[0].fire_alert;

        // Enviar notificaciones (asíncrono)
        this.sendNotifications(alertId).catch(err => {
            console.error('Failed to send alert notifications:', err);
        });

        return alertId;
    }

    private async sendNotifications(alertId: string): Promise<void> {
        const alert = await this.getAlert(alertId);

        // Obtener regla de alerta para saber qué canales usar
        const rule = await this.getAlertRule(alert.type, alert.title);

        if (!rule) {
            // No hay regla configurada, usar defaults
            await this.notificationService.sendEmail({
                to: ['devops@gamilit.com'],
                subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                body: alert.description
            });
            return;
        }

        // Verificar throttle
        if (await this.isThrottled(alert, rule)) {
            console.log(`Alert ${alertId} throttled`);
            return;
        }

        // Enviar por cada canal configurado
        for (const channel of rule.notification_channels) {
            try {
                if (channel === 'email') {
                    await this.notificationService.sendEmail({
                        to: ['devops@gamilit.com', 'oncall@gamilit.com'],
                        subject: `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.title}`,
                        body: this.formatEmailBody(alert)
                    });
                } else if (channel === 'slack') {
                    await this.notificationService.sendSlack({
                        channel: '#alerts-prod',
                        text: this.formatSlackMessage(alert),
                        severity: alert.severity
                    });
                } else if (channel === 'webhook') {
                    await this.notificationService.sendWebhook({
                        url: process.env.ALERT_WEBHOOK_URL,
                        payload: alert
                    });
                }

                // Registrar notificación enviada
                await this.logNotification(alertId, channel, 'sent');
            } catch (error) {
                console.error(`Failed to send ${channel} notification:`, error);
                await this.logNotification(alertId, channel, 'failed', error.message);
            }
        }
    }

    private async isThrottled(alert: any, rule: any): Promise<boolean> {
        // Buscar última notificación enviada para esta alerta
        const lastNotification = await this.dataSource.query(`
            SELECT sent_at
            FROM system_configuration.alert_notifications
            WHERE alert_id = $1
              AND status = 'sent'
            ORDER BY sent_at DESC
            LIMIT 1
        `, [alert.id]);

        if (lastNotification.length === 0) {
            return false;  // No hay notificación previa
        }

        const lastSentAt = new Date(lastNotification[0].sent_at);
        const throttleMs = rule.throttle_seconds * 1000;
        const elapsed = Date.now() - lastSentAt.getTime();

        return elapsed < throttleMs;
    }

    private formatEmailBody(alert: any): string {
        return `
Alert Details:
--------------
Type: ${alert.type}
Severity: ${alert.severity}
Resource: ${alert.resource || 'N/A'}
First Seen: ${alert.first_seen_at}
Occurrences: ${alert.count}

Description:
${alert.description}

Metadata:
${JSON.stringify(alert.metadata, null, 2)}

View in Dashboard: ${process.env.APP_URL}/admin/alerts/${alert.id}
        `.trim();
    }

    private formatSlackMessage(alert: any): string {
        const emoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🔵'
        }[alert.severity];

        return `${emoji} *[${alert.severity.toUpperCase()}] ${alert.type}*: ${alert.title}\n` +
               `Resource: ${alert.resource || 'N/A'}\n` +
               `Occurrences: ${alert.count}\n` +
               `<${process.env.APP_URL}/admin/alerts/${alert.id}|View Details>`;
    }

    async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
        await this.dataSource.query(`
            UPDATE system_configuration.alerts
            SET status = 'acknowledged',
                acknowledged_by = $2,
                acknowledged_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [alertId, userId]);

        // Auditar acción
        await this.auditAction(alertId, userId, 'acknowledged');
    }

    async resolveAlert(alertId: string, userId: string, note: string): Promise<void> {
        await this.dataSource.query(`
            UPDATE system_configuration.alerts
            SET status = 'resolved',
                resolved_by = $2,
                resolved_at = CURRENT_TIMESTAMP,
                resolution_note = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [alertId, userId, note]);

        // Auditar acción
        await this.auditAction(alertId, userId, 'resolved', note);
    }

    private async auditAction(alertId: string, userId: string, action: string, note?: string): Promise<void> {
        // Registrar en audit log (ver ET-AUD-001)
        await this.dataSource.query(`
            INSERT INTO audit_logging.audit_logs (user_id, action, resource_type, resource_id, metadata)
            VALUES ($1, $2, 'alert', $3, $4)
        `, [userId, `alert_${action}`, alertId, JSON.stringify({ note })]);
    }
}
```

### 2.2 Service: `NotificationService`

```typescript
// Archivo: apps/backend/src/modules/monitoring/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { WebClient } from '@slack/web-api';
import axios from 'axios';

@Injectable()
export class NotificationService {
    private emailTransporter: nodemailer.Transporter;
    private slackClient: WebClient;

    constructor(private configService: ConfigService) {
        // Email transporter
        this.emailTransporter = nodemailer.createTransporter({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: true,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS')
            }
        });

        // Slack client
        const slackToken = this.configService.get('SLACK_BOT_TOKEN');
        if (slackToken) {
            this.slackClient = new WebClient(slackToken);
        }
    }

    async sendEmail(options: {
        to: string[];
        subject: string;
        body: string;
    }): Promise<void> {
        await this.emailTransporter.sendMail({
            from: 'alerts@gamilit.com',
            to: options.to.join(','),
            subject: options.subject,
            text: options.body,
            html: this.formatEmailHtml(options.body)
        });
    }

    async sendSlack(options: {
        channel: string;
        text: string;
        severity: string;
    }): Promise<void> {
        if (!this.slackClient) {
            throw new Error('Slack client not configured');
        }

        const color = {
            critical: 'danger',
            high: 'warning',
            medium: '#FFD700',
            low: 'good'
        }[options.severity] || '#808080';

        await this.slackClient.chat.postMessage({
            channel: options.channel,
            text: options.text,
            attachments: [{
                color,
                text: options.text,
                fallback: options.text,
                footer: 'Gamilit Monitoring',
                ts: Math.floor(Date.now() / 1000).toString()
            }]
        });
    }

    async sendWebhook(options: {
        url: string;
        payload: any;
    }): Promise<void> {
        await axios.post(options.url, options.payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Gamilit-Monitoring/1.0'
            },
            timeout: 5000
        });
    }

    private formatEmailHtml(text: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #e74c3c; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert-box">
            <pre>${text}</pre>
        </div>
    </div>
</body>
</html>
        `.trim();
    }
}
```

### 2.3 Worker: `AlertMonitorWorker`

```typescript
// Archivo: apps/backend/src/workers/alert-monitor.worker.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertService } from '../modules/monitoring/services/alert.service';
import { MetricsService } from '../modules/monitoring/services/metrics.service';

@Injectable()
export class AlertMonitorWorker {
    constructor(
        private alertService: AlertService,
        private metricsService: MetricsService
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async checkMetrics(): Promise<void> {
        const rules = await this.getActiveAlertRules();

        for (const rule of rules) {
            await this.evaluateRule(rule);
        }
    }

    private async evaluateRule(rule: any): Promise<void> {
        const { condition } = rule;

        // Obtener métrica actual
        const currentValue = await this.metricsService.getMetric(condition.metric);

        // Evaluar condición
        const threshold = condition.threshold;
        const isBreach = this.evaluateCondition(currentValue, condition.operator, threshold);

        if (isBreach) {
            // Verificar duración (si la condición debe mantenerse por X tiempo)
            if (condition.duration) {
                const breachDuration = await this.getBreachDuration(condition.metric, threshold);
                if (breachDuration < condition.duration) {
                    return;  // No ha durado suficiente tiempo
                }
            }

            // Disparar alerta
            await this.alertService.fireAlert({
                type: rule.type,
                severity: rule.severity,
                title: rule.name,
                description: `${condition.metric} is ${currentValue} (threshold: ${threshold})`,
                metadata: {
                    metric: condition.metric,
                    currentValue,
                    threshold,
                    duration: condition.duration
                }
            });
        }
    }

    private evaluateCondition(value: number, operator: string, threshold: number): boolean {
        switch (operator) {
            case '>': return value > threshold;
            case '>=': return value >= threshold;
            case '<': return value < threshold;
            case '<=': return value <= threshold;
            case '==': return value === threshold;
            default: return false;
        }
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Componente: `AlertDashboard`

```typescript
// Archivo: apps/frontend/src/components/admin/AlertDashboard.tsx
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

export function AlertDashboard() {
    const { data: alerts, refetch } = useQuery({
        queryKey: ['alerts', 'active'],
        queryFn: async () => {
            const response = await apiClient.get('/admin/alerts?status=active');
            return response.data;
        },
        refetchInterval: 30000  // Refetch cada 30 segundos
    });

    const acknowledgeMutation = useMutation({
        mutationFn: async (alertId: string) => {
            await apiClient.post(`/admin/alerts/${alertId}/acknowledge`);
        },
        onSuccess: () => refetch()
    });

    const resolveMutation = useMutation({
        mutationFn: async ({ alertId, note }: { alertId: string; note: string }) => {
            await apiClient.post(`/admin/alerts/${alertId}/resolve`, { note });
        },
        onSuccess: () => refetch()
    });

    const groupedAlerts = {
        critical: alerts?.filter(a => a.severity === 'critical') || [],
        high: alerts?.filter(a => a.severity === 'high') || [],
        medium: alerts?.filter(a => a.severity === 'medium') || [],
        low: alerts?.filter(a => a.severity === 'low') || []
    };

    return (
        <div className="alert-dashboard">
            <h1>Active Alerts ({alerts?.length || 0})</h1>

            {groupedAlerts.critical.length > 0 && (
                <div className="alert-group critical">
                    <h2>🔴 CRITICAL ({groupedAlerts.critical.length})</h2>
                    {groupedAlerts.critical.map(alert => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onAcknowledge={() => acknowledgeMutation.mutate(alert.id)}
                            onResolve={(note) => resolveMutation.mutate({ alertId: alert.id, note })}
                        />
                    ))}
                </div>
            )}

            {groupedAlerts.high.length > 0 && (
                <div className="alert-group high">
                    <h2>🟠 HIGH ({groupedAlerts.high.length})</h2>
                    {groupedAlerts.high.map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            )}

            {/* Similar para medium y low */}
        </div>
    );
}

interface AlertCardProps {
    alert: any;
    onAcknowledge?: () => void;
    onResolve?: (note: string) => void;
}

function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
    const [resolveNote, setResolveNote] = React.useState('');

    return (
        <div className="alert-card">
            <div className="alert-header">
                <h3>{alert.title}</h3>
                <span className="alert-badge">{alert.type}</span>
            </div>

            <div className="alert-body">
                <p><strong>Resource:</strong> {alert.resource || 'N/A'}</p>
                <p><strong>Status:</strong> {alert.status}</p>
                <p><strong>First Seen:</strong> {new Date(alert.first_seen_at).toLocaleString()}</p>
                <p><strong>Occurrences:</strong> {alert.count}</p>
                <p>{alert.description}</p>
            </div>

            <div className="alert-actions">
                {alert.status === 'fired' && onAcknowledge && (
                    <button onClick={onAcknowledge}>Acknowledge</button>
                )}

                {alert.status === 'acknowledged' && onResolve && (
                    <div>
                        <input
                            type="text"
                            placeholder="Resolution note..."
                            value={resolveNote}
                            onChange={(e) => setResolveNote(e.target.value)}
                        />
                        <button onClick={() => onResolve(resolveNote)}>
                            Resolve
                        </button>
                    </div>
                )}

                <a href={`/admin/alerts/${alert.id}`}>View Details</a>
            </div>
        </div>
    );
}
```

---

## ✅ Criterios de Aceptación

- [x] Tabla `alerts` almacena alertas con deduplicación
- [x] Tabla `alert_rules` define reglas configurables
- [x] Función `fire_alert()` implementa deduplicación automática
- [x] AlertService dispara alertas con múltiples canales
- [x] NotificationService envía email, Slack, webhook
- [x] AlertMonitorWorker evalúa reglas cada minuto
- [x] AlertDashboard muestra alertas activas con acciones
- [x] Throttling impide spam de notificaciones

---

## 📚 Referencias Técnicas

### Database
- Schema: `system_configuration`
- Tablas: `alerts`, `alert_rules`, `alert_notifications`
- Función: `fire_alert()`

### Backend
- Service: `apps/backend/src/modules/monitoring/services/alert.service.ts`
- Service: `apps/backend/src/modules/monitoring/services/notification.service.ts`
- Worker: `apps/backend/src/workers/alert-monitor.worker.ts`

### Frontend
- Component: `apps/frontend/src/components/admin/AlertDashboard.tsx`

---

**Última revisión:** 2025-11-07
**Revisores:** DevOps Team, Backend Team
**Próxima revisión:** 2026-01-07
