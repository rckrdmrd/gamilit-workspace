# Alerting - Prometheus Alertmanager

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Alerting
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 1522-1698)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Alert Rules (Prometheus + Alertmanager)

**alert.rules.yml:**
```yaml
groups:
  - name: gamilit_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m]))
          /
          sum(rate(http_requests_total[5m]))
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"

      # Slow response time
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response time"
          description: "P95 response time is {{ $value }}s (threshold: 1s)"

      # Database connection issues
      - alert: DatabaseConnectionPoolExhausted
        expr: gamilit_db_pool_size{state="waiting"} > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
          description: "{{ $value }} queries waiting for connections"

      # Service down
      - alert: ServiceDown
        expr: up{job="gamilit-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Gamilit backend service is down"
          description: "Service {{ $labels.instance }} is unreachable"

      # Business metrics alerts
      - alert: NoExercisesCompletedIn1Hour
        expr: |
          sum(increase(gamilit_exercises_completed_total[1h])) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No exercises completed in the last hour"
          description: "This might indicate a problem with the exercise system"
```

---

## Alertmanager Configuration

**alertmanager.yml:**
```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'team-alerts'

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true

    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'team-alerts'
    email_configs:
      - to: 'team@gamilit.com'
        from: 'alerts@gamilit.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@gamilit.com'
        auth_password: 'password'

  - name: 'critical-alerts'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'warning-alerts'
    slack_configs:
      - channel: '#alerts-warning'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## On-Call Rotation

**PagerDuty / Opsgenie Setup:**
```yaml
Schedule:
  - Week 1: John Doe (Engineering Lead)
  - Week 2: Jane Smith (Backend Dev)
  - Week 3: Bob Johnson (DevOps)
  - Week 4: Alice Williams (Full Stack)

Escalation Policy:
  Level 1: On-call engineer (immediately)
  Level 2: Team lead (after 15 minutes)
  Level 3: CTO (after 30 minutes)

Alert Channels:
  - Phone call (critical only)
  - SMS (critical + high)
  - Slack (all severities)
  - Email (all severities)
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
