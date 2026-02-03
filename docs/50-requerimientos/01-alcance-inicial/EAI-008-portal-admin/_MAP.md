# EAI-008: Portal de Administracion

**Fase:** 01-fase-alcance-inicial
**Estado:** Done (Fase 1), Backlog (Fase 2)
**Ultima actualizacion:** 2026-01-04

---

## Indice de Documentos

### Requerimientos (RF)

| ID | Nombre | Modulo | Estado |
|----|--------|--------|--------|
| RF-ADM-001 | Sistema de Alertas Admin | Alertas | Done |
| RF-ADM-002 | Dashboard Analiticas | Analiticas | Done |
| RF-ADM-003 | Seguimiento Progreso | Progreso | Done |
| RF-ADM-004 | Monitoreo Sistema | Monitoreo | Done |
| RF-ADM-005 | Gestion Usuarios | Usuarios | Done |
| RF-ADM-006 | Gestion Instituciones | Instituciones | Done |
| RF-ADM-007 | Gestion Roles | Roles | Done |
| RF-ADM-008 | Configuracion Avanzada | Advanced | Backlog |
| RF-ADM-009 | Configuracion General | Settings | Backlog |
| RF-ADM-010 | Reportes Persistentes | Reports | Backlog |

### Especificaciones Tecnicas (ET)

| ID | Nombre | Archivado En |
|----|--------|--------------|
| ET-ADM-001 | Schema BD Admin | modulos-legacy/00-analisis-inicial/ |
| ET-ADM-002 | Endpoints REST | modulos-legacy/0X-modulo-*/ |
| ET-ADM-003 | Componentes Frontend | modulos-legacy/0X-modulo-*/ |

### User Stories (US)

| ID | Descripcion | SP | Estado |
|----|-------------|-----|--------|
| US-ADM-001 | Gestion de alertas del sistema | 8 | Done |
| US-ADM-002 | Dashboard de analiticas interactivo | 13 | Done |
| US-ADM-003 | Seguimiento de progreso estudiantes | 8 | Done |
| US-ADM-004 | Monitoreo en tiempo real | 8 | Done |
| US-ADM-005 | CRUD usuarios completo | 5 | Done |
| US-ADM-006 | CRUD instituciones | 5 | Done |
| US-ADM-007 | Gestion de roles y permisos | 5 | Done |
| US-ADM-008 | Feature flags y A/B testing | 13 | Backlog |
| US-ADM-009 | Configuracion general y seguridad | 8 | Backlog |
| US-ADM-010 | Reportes con persistencia BD | 13 | Backlog |

**Total SP:** 86 (52 Done, 34 Backlog)

### Tareas (tareas/)

Ver [tareas/_MAP.md](./tareas/_MAP.md)

---

## Estructura

```
EAI-008-portal-admin/
+-- _MAP.md              # Este archivo
+-- README.md            # Documentacion principal
+-- requerimientos/      # Requerimientos formales
+-- especificaciones/    # Especificaciones tecnicas
+-- historias-usuario/   # User Stories
+-- tareas/              # Tareas SCRUM
+-- implementacion/      # Trazabilidad a codigo
+-- archivados/          # Documentacion legacy por modulo
    +-- modulos-legacy/  # Estructura original por modulo
    +-- reportes-raiz-legacy/  # Reportes originales
```

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Paginas Admin | 15 (11 funcionales, 4 placeholder) |
| Endpoints REST | ~112 |
| Componentes React | 58 |
| DTOs Backend | 118 |
| Tests Automatizados | 62+ |
| Lineas de Codigo | 11,437 |

---

## Documentacion Legacy

La documentacion original fue estructurada por modulos:
- 00-analisis-inicial/ - Analisis y planeacion
- 01-modulo-alertas/ - Modulo de alertas
- 02-modulo-analiticas/ - Dashboard analiticas
- 03-modulo-progreso/ - Seguimiento progreso
- 04-modulo-monitoreo/ - Monitoreo sistema
- 05-otros-componentes/ - Roles, Reports, Settings
- 99-reportes-progreso/ - Reportes finales

Esta documentacion se preserva en `archivados/modulos-legacy/`.

---

**Actualizado:** 2026-01-04
