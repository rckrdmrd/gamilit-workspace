---
name: vercel-next-deploy
description: "Pipeline opcional de despliegue en Vercel para frontends Next.js"
version: 1.0.0
simco_source: docs/40-standards/ESTANDAR-SKILLS.md
category: community
priority: P1
capved_required: true
agents_compatible:
  - claude-code
  - gemini-cli
dependencies:
  - simco-task-execution
  - simco-safe-edit
triggers:
  - on_optional_vercel_deploy
internal: false
estimated_tokens: 1200
tags:
  - vercel
  - deploy
  - nextjs
input_schema:
  required:
    - deploy_target
    - release_scope
  optional:
    - smoke_tests
output_schema:
  success:
    - deployment_url
    - smoke_test_results
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# vercel-next-deploy

## Proposito
Habilitar un flujo opcional de deploy en Vercel cuando el entorno de trabajo lo requiera, sin reemplazar el pipeline base PM2/Nginx.

## Cuando Usar
- Proyectos o ramas que habiliten `enable_vercel_deploy_skill`.
- Escenarios de preview y validacion de frontends Next.js.

## Cuando NO Usar
- Cuando el entorno oficial es solo PM2/Nginx.
- Si no existe token/configuracion Vercel aprobada.

## Prerequisitos
- Feature flag activa para deploy Vercel.
- Variables seguras de Vercel definidas en CI/CD.

## Instrucciones
### Paso 1: Validar feature flag y alcance
Confirmar que la tarea solicita explicitamente deploy Vercel opcional.

### Paso 2: Preparar configuracion de deploy
Verificar parametros de proyecto y entorno objetivo (preview o production).

### Paso 3: Ejecutar despliegue controlado
Lanzar deploy y recolectar URL/resultados para evidencia.

### Paso 4: Ejecutar smoke tests
Validar que rutas y funcionalidades criticas respondan en el entorno desplegado.

## Checklist de Validacion
- [ ] Feature flag validada.
- [ ] Credenciales y entorno revisados.
- [ ] Deploy completado con evidencia.
- [ ] Smoke tests minimos ejecutados.

## Referencias
- `docs/40-standards/ESTANDAR-SKILLS.md`
- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`
- `.github/workflows/deploy-production.yml`
