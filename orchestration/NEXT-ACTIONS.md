# NEXT ACTIONS - GAMILIT

> Backlog operativo inmediato desacoplado de `PROXIMA-ACCION.md`.

## Bloqueantes Produccion (BLQ — servidor 74.208.126.102)

- **BLQ-01:** Reemplazar `CHANGE_ME_IN_PRODUCTION` en `.env.production` del servidor (DB_PASSWORD, JWT_SECRET, SESSION_SECRET) — Estado: PENDIENTE
- **BLQ-02:** Agregar `JWT_REFRESH_SECRET` (>=32 chars) a `.env.production` del servidor — Sin este secreto, `main.ts` ejecuta `process.exit(1)` — Estado: PENDIENTE
- **BLQ-03:** Crear `apps/frontend/.env.production` en servidor a partir del `.env.production.example` — Sin esto, `vite build` usa localhost y el validador rechaza — Estado: PENDIENTE
- **BLQ-04:** Cambiar password de `admin@gamilit.com` en BD de produccion — `UPDATE auth.users SET encrypted_password = crypt('<nuevo>', gen_salt('bf',10)) WHERE email = 'admin@gamilit.com'` — Estado: PENDIENTE

> Origen: TASK-2026-02-19-ANALISIS-DEPLOY-PROD (ver ARCHIVE-DIGEST.md)

## Prioridad alta

- Corregir `env.validation.ts` para tipado numerico de puertos.
- Resolver deduplicacion de funciones/triggers en `communication`.
- Alinear multiplicadores frontend con SSOT de rangos.

## Prioridad media

- Normalizacion continua de documentacion en `orchestration/`.
- Cierre de backlog P3 documental y de referencias.

## Estado del plan de normalizacion documental

- Plan de normalizacion `docs/` + `orchestration/`: **COMPLETADO**.
- Cierre consolidado: Lotes 1-3 + Olas 1-8.
- Auditoria global final: `BROKEN_GLOBAL_TOTAL=0`.
- Evidencia de cierre: `orchestration/referencias/BACKLOG-NORMALIZACION-FASE2.md`.

## Referencias

- [PROXIMA-ACCION.md](./PROXIMA-ACCION.md)
- [ARCHIVE-DIGEST.md](./tareas/ARCHIVE-DIGEST.md)
- Historial de tareas: `orchestration/tareas/ARCHIVE-DIGEST.md`
