# Dashboards - Grafana

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Dashboards (Grafana)
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 1700-1888)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Dashboard 1: System Overview

```json
{
  "title": "Gamilit - System Overview",
  "panels": [
    {
      "title": "Request Rate",
      "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[5m])) by (status_code)",
          "legendFormat": "{{ status_code }}"
        }
      ]
    },
    {
      "title": "Response Time (P50, P95, P99)",
      "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P50"
        },
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P95"
        },
        {
          "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P99"
        }
      ]
    }
  ]
}
```

---

## Dashboard 2: Business Metrics

```json
{
  "title": "Gamilit - Business Metrics",
  "panels": [
    {
      "title": "Exercises Completed (by type)",
      "targets": [
        {
          "expr": "sum(increase(gamilit_exercises_completed_total[1h])) by (type)"
        }
      ]
    },
    {
      "title": "ML Coins Economy",
      "targets": [
        {
          "expr": "sum(rate(gamilit_ml_coins_earned_total[5m]))",
          "legendFormat": "Earned"
        },
        {
          "expr": "sum(rate(gamilit_ml_coins_spent_total[5m]))",
          "legendFormat": "Spent"
        }
      ]
    }
  ]
}
```

---

## Custom Grafana Variables

```json
{
  "templating": {
    "list": [
      {
        "name": "environment",
        "type": "custom",
        "options": ["production", "staging", "development"]
      },
      {
        "name": "time_range",
        "type": "interval",
        "options": ["5m", "15m", "1h", "6h", "24h", "7d"]
      },
      {
        "name": "exercise_type",
        "type": "query",
        "query": "label_values(gamilit_exercises_completed_total, type)"
      }
    ]
  }
}
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
