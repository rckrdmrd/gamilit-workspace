# EPIC-GAM-K8S: Kubernetes Gamilit

| Campo | Valor |
|-------|-------|
| **Proyecto** | gamilit |
| **Wave** | wave_3 (High Priority P1) |
| **Story Points** | 8 |
| **Estado** | completed |
| **Prioridad** | P1 |

**ADR:** [ADR-0019](../../../../../../../docs/90-adr/ADR-0019-ssot-documentacion-producto-en-proyecto.md)

---

## Descripcion

Preparacion de la infraestructura Kubernetes para el deployment en produccion de la plataforma educativa gamilit. Esta epica es unica del proyecto gamilit (reemplaza el patron estandar de CI/CD con una estrategia K8s-first). Abarca la creacion de manifests de Kubernetes para todos los componentes del sistema: backend NestJS, frontend React, PostgreSQL como StatefulSet, Redis, e Ingress para ruteo de los 4 portales. Incluye Horizontal Pod Autoscaler para manejar picos de uso en horario escolar y configuracion de health check probes para alta disponibilidad.

## Alcance

- Namespace configuration para aislamiento del proyecto gamilit
- Backend deployment + service (NestJS 11, replicas con HPA)
- Frontend deployment + service (React 19 + Nginx)
- PostgreSQL StatefulSet con persistent volumes
- Redis deployment para cache y sesiones
- Ingress configuration para ruteo de los 4 portales (student, teacher, admin, parents)
- HPA (Horizontal Pod Autoscaler) para escalado automatico en horario escolar
- ConfigMaps y Secrets para configuracion segura
- Health check probes (liveness, readiness) conectadas a /health, /ready, /live

## Componentes Afectados

| Capa | Componentes |
|------|-------------|
| Database | PostgreSQL StatefulSet, persistent volumes, backup CronJob |
| Backend | Deployment manifest, service, HPA, ConfigMap, liveness/readiness probes |
| Frontend | Deployment manifest, Nginx service, Ingress rules |
| DevOps | Namespace, Ingress controller, Redis deployment, Secrets management, HPA policies |

## Dependencias

**Depende de:** EPIC-GAM-FRONTEND
**Bloquea:** EPIC-GAM-TESTING

## User Stories

> Detalle en: [../user-stories/](../user-stories/) (27 US L3)

## Definition of Done

- [ ] Manifests K8s completos para todos los componentes (backend, frontend, PostgreSQL, Redis)
- [ ] HPA configurado con metricas de CPU/memoria y probado con carga simulada
- [ ] Ingress funcional con ruteo correcto a los 4 portales
- [ ] Documentacion actualizada
- [ ] Inventarios sincronizados

## Tracking

**YAML:** [EPIC-GAM-K8S.yml](../../../../orchestration/work-items/epics/EPIC-GAM-K8S.yml)

---
*Generado: 2026-02-07 | SSOT: ADR-0019 | Template: TEMPLATE-EPICA.md v2.0.0*
