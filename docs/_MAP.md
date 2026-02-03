# MAPA DE DOCUMENTACION: GAMILIT (V2)

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Ultima actualizacion:** 2026-02-03
**Estado:** V2 COMPLIANT

---

## Estructura de Documentacion (Workspace V2)

```
docs/
+-- 00-vision-general/       # Vision integral, glosario, objetivos estrategicos
+-- 10-arquitectura/         # Arquitectura, modelado, stack, jerarquia
+-- 20-perfiles/             # Capacidades de agentes y perfiles de usuario
+-- 30-directivas/           # Principios SIMCO, CAPVED, politicas
+-- 40-estandares/           # Estandares de codigo, API, UI/UX, guias
+-- 50-requerimientos/       # Requerimientos (Alcance, Robustecimiento, Extensiones)
+-- 60-proyectos/            # Modulos internos y componentes
+-- 70-onboarding/           # Guias de inicio rapido y capacitacion
+-- 80-referencias/          # Glosarios, referencias tecnicas, transversal
+-- 90-adr/                  # Architecture Decision Records (21+ registros)
```

---

## Mapeo de Requerimientos (Fase 50)

| Seccion | Contenido | Estado |
|---------|-----------|--------|
| [01-alcance-inicial](50-requerimientos/01-alcance-inicial/) | Fundamentos, Gamificacion, Analytics | Migrado |
| [02-robustecimiento](50-requerimientos/02-robustecimiento/) | Modulos M4-M5, Migracion BD | Migrado |
| [03-extensiones](50-requerimientos/03-extensiones/) | Portal Maestros, Notificaciones, LTI | Migrado |
| [04-backlog](50-requerimientos/04-backlog/) | Definicion de Ready, Features pendientes | Migrado |

---

## Arquitectura y Modelado (Fase 10)

| Documento | Descripcion |
|-----------|-------------|
| [modelado/COHERENCE-ENTITIES-DDL.md](10-arquitectura/modelado/COHERENCE-ENTITIES-DDL.md) | Coherencia entre entidades y DDL |
| [modelado/TRACEABILITY-US-SCHEMAS.md](10-arquitectura/modelado/TRACEABILITY-US-SCHEMAS.md) | Trazabilidad Historias -> Schemas |

---

## Referencias y Estandares

- **[40-estandares/guias/](40-estandares/guias/)**: Guias de desarrollo migradas.
- **[80-referencias/transversal/](80-referencias/transversal/)**: Documentacion transversal del sistema.
- **[80-referencias/quick-ref/](80-referencias/quick-ref/)**: Cheatsheets y referencias rapidas.

---

## Metricas Post-Migracion

| Metrica | Valor |
|---------|-------|
| Categorias V2 | 10 |
| Carpetas Legacy Purgadas | 12 |
| Documentos Migrados | 150+ |
| Estado de Integracion | 100% |

---

**Actualizado:** 2026-02-03
**Sistema:** Workspace V2 Standard
**Nota:** Este mapa reemplaza al mapa faseado anterior.