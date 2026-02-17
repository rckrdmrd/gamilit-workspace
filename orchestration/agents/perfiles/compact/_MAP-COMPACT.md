---
version: "1.0.0"
tipo: indice
proposito: "Mapa de perfiles compactos para subagentes"
---

# MAPA DE PERFILES COMPACTOS

## CUANDO USAR

Usar perfiles compactos cuando:
- Agente opera como **subagente** (recibe delegacion)
- Se necesita optimizar tokens
- Tarea es especifica (1-2 archivos)

**Contrato obligatorio:** `PERFIL-CONTRATO-COMPACT.md`

## PERFILES DISPONIBLES

| Perfil | Dominio | Tokens | Uso |
|--------|---------|--------|-----|
| PERFIL-BACKEND-COMPACT.md | NestJS/TypeScript | ~250 | Entities, Services, Controllers |
| PERFIL-FRONTEND-COMPACT.md | React/TypeScript | ~250 | Componentes, Hooks, Types |
| PERFIL-DATABASE-COMPACT.md | PostgreSQL DDL | ~250 | Tablas, Indices, Seeds |
| PERFIL-DEVOPS-COMPACT.md | Docker/CI/CD | ~250 | Dockerfiles, Pipelines |
| PERFIL-ML-COMPACT.md | Python/ML | ~250 | Modelos, Features |
| PERFIL-DOCUMENTATION-COMPACT.md | Documentacion | ~250 | Specs, ADRs, Inventarios |
| PERFIL-TESTING-COMPACT.md | Testing | ~250 | Unit, Integration, E2E tests |
| PERFIL-SECURITY-COMPACT.md | Seguridad | ~250 | Auditoria, OWASP, RLS |
| PERFIL-QA-COMPACT.md | QA/Validacion | ~250 | Checklists, Validacion calidad |
| PERFIL-ARCHITECTURE-ANALYST-COMPACT.md | Arquitectura | ~250 | Analisis, ADRs, Trade-offs |
| PERFIL-INTEGRATION-VALIDATOR-COMPACT.md | Integracion | ~250 | Coherencia entre capas |
| PERFIL-DATABASE-AUDITOR-COMPACT.md | Auditoria BD | ~250 | RLS, Policies, Constraints |
| PERFIL-CODE-REVIEWER-COMPACT.md | Code Review | ~250 | PRs, Estandares, Calidad |
| PERFIL-REQUIREMENTS-ANALYST-COMPACT.md | Requerimientos | ~250 | HUs, Epics, Criterios |
| PERFIL-GENERIC-SUBAGENT.md | Cualquier | ~200 | Tareas sin perfil especifico |

## COMPARATIVA CON PERFILES COMPLETOS

| Aspecto | Perfil Completo | Perfil Compact |
|---------|-----------------|----------------|
| Tokens | ~800 | ~250 |
| Uso | Agente principal | Subagente |
| CCA | Completo (4 fases) | Ligero (2 fases) |
| Contenido | Todo | Esencial |

## SELECCION DE PERFIL

```yaml
SEGUN_TAREA:
  crear_tabla: "PERFIL-DATABASE-COMPACT.md"
  crear_entity: "PERFIL-BACKEND-COMPACT.md"
  crear_service: "PERFIL-BACKEND-COMPACT.md"
  crear_controller: "PERFIL-BACKEND-COMPACT.md"
  crear_componente: "PERFIL-FRONTEND-COMPACT.md"
  crear_hook: "PERFIL-FRONTEND-COMPACT.md"
  crear_dockerfile: "PERFIL-DEVOPS-COMPACT.md"
  crear_modelo_ml: "PERFIL-ML-COMPACT.md"
  escribir_test: "PERFIL-TESTING-COMPACT.md"
  documentar: "PERFIL-DOCUMENTATION-COMPACT.md"
  revisar_codigo: "PERFIL-CODE-REVIEWER-COMPACT.md"
  auditar_seguridad: "PERFIL-SECURITY-COMPACT.md"
  auditar_bd: "PERFIL-DATABASE-AUDITOR-COMPACT.md"
  analizar_arquitectura: "PERFIL-ARCHITECTURE-ANALYST-COMPACT.md"
  validar_integracion: "PERFIL-INTEGRATION-VALIDATOR-COMPACT.md"
  analizar_requerimientos: "PERFIL-REQUIREMENTS-ANALYST-COMPACT.md"
  validar_calidad: "PERFIL-QA-COMPACT.md"
  otro: "PERFIL-GENERIC-SUBAGENT.md"
```

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `../` | Perfiles completos |
| `PERFIL-CONTRATO-COMPACT.md` | Contrato estandar de entrada/salida para compact |
| `SIMCO-SUBAGENTE.md` | Protocolo de subagente |
| `SIMCO-SUBAGENTE.md` | Protocolo de subagente (CCA incluido) |

---

**Ubicacion:** orchestration/agents/perfiles/compact/
