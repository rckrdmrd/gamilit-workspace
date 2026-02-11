# Plan de Tareas -- EPIC-GAM-F3-LTI
Estado: PLANIFICADO | US: 4 | SP Total: 40 | Impl: 40%

## Tareas Planificadas

| # | Tarea | Area | US Relacionadas | SP Est. | Prioridad |
|---|-------|------|-----------------|---------|-----------|
| 1 | OIDC login flow: endpoints /lti/login + /lti/callback | Backend | US-LTI-001 | 4 | P0 |
| 2 | Validacion JWT RSA-256 + cache JWKS + state/nonce en Redis | Backend | US-LTI-001 | 3 | P0 |
| 3 | Provision automatica usuarios desde LTI claims (crear/actualizar) | Backend | US-LTI-001 | 2 | P0 |
| 4 | Landing page LTI (/lti/loading) + pagina error OIDC | Frontend | US-LTI-001 | 1 | P0 |
| 5 | Grade passback AGS: envio scores al LMS, sync bidireccional | Backend | US-LTI-002 | 4 | P1 |
| 6 | Mapeo scoring GAMILIT (0-100) a escala LMS + retry en errores red | Backend | US-LTI-002 | 2 | P1 |
| 7 | Deep linking: content selection UI + JWT response firmado | Fullstack | US-LTI-003 | 4 | P2 |
| 8 | Launch con custom params (exercise_id, module_id) redirige a player | Backend | US-LTI-003 | 2 | P2 |
| 9 | Admin UI: registro plataformas LMS, key management, multi-tenant | Fullstack | US-LTI-004 | 4 | P1 |
| 10 | Testing con Canvas sandbox + Moodle sandbox + LTI Advantage Validator | Testing | Todas | 3 | P1 |
| 11 | Seguridad: audit logging, HTTPS only, token expiration, tenant isolation | Backend | Todas | 2 | P1 |

## Dependencias
- Requiere: EAI-001 (auth base), EAI-002 (mecanicas educativas), entities LTI existentes (65%)
- Bloquea: EXT-002 (admin extendido con LTI), EXT-005 (metricas integracion LTI)
