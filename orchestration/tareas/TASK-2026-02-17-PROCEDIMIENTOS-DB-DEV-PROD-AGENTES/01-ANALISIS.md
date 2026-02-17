# TASK-2026-02-17-PROCEDIMIENTOS-DB-DEV-PROD-AGENTES - Analisis

## Objetivo

Definir procedimientos ejecutables y no ambiguos para agentes en DEV (WSL) y PROD (Linux server), alineados a directivas DDL-first.

## Hallazgos

1. Contradiccion detectada: deploy prod mencionaba migraciones incrementales.
2. Inconsistencia de rutas productivas en perfil deploy.
3. Faltaba perfil operativo dedicado para recreacion DB en DEV WSL.

## Evidencias

- `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md`
- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
