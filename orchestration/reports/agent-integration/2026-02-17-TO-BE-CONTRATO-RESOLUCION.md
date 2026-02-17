# Contrato To-Be: Resolucion Automatica de Perfil/Skills

## Entrada

- `task_description` (string): descripcion libre de la tarea.
- `task_type` (opcional): `backend | frontend | database | devops | docs | multi`.
- `enable_vercel_deploy` (opcional): habilita skill de deploy Vercel para tareas DevOps.

## Salida

```json
{
  "primary_profile_id": "backend_nestjs",
  "primary_alias": "@PERFIL_BACKEND",
  "secondary_profile_ids": ["orquestador"],
  "confidence": 0.82,
  "matched_keywords": ["endpoint", "nestjs", "dto"],
  "principles": ["..."],
  "directives": ["..."],
  "skills": ["simco-task-execution", "simco-safe-edit", "simco-apply-standard"],
  "context_files": ["..."],
  "feature_flags": {
    "vercel_dev": true,
    "vercel_deploy": false
  }
}
```

## Reglas Deterministicas

1. Si existe `task_type`, se pondera primero con `task_type_to_profile_priority`.
2. Luego se suman coincidencias por `keywords` del SSOT.
3. Si no hay coincidencias, se usa `fallback_profile_id`.
4. Los principios siempre incluyen `principles_base` + `principles_extra` del perfil.
5. Las skills Vercel se aplican con feature flags:
   - `vercel-v0-dev`: permitido cuando `enable_vercel_dev_skills=true`.
   - `vercel-next-deploy`: solo si `enable_vercel_deploy_skill=true` o `enable_vercel_deploy`.

## SSOT tecnico

- Archivo canónico: `orchestration/agents/configs/PROFILE-SKILL-MAP.json`.
- Vista humana operativa: `orchestration/agents/perfiles/_MAP.md`.

## Compatibilidad de entorno actual

- Deploy base del proyecto se mantiene en PM2/Nginx.
- Integracion Vercel queda como capacidad opcional y aislada por flag.
