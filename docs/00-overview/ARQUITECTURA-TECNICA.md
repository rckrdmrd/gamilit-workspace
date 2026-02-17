# Arquitectura Tecnica

> Resumen tecnico operativo del monorepo.

## Stack

- Backend: NestJS 11
- Frontend: React 19 + Vite
- Database: PostgreSQL 15 + TypeORM
- Cache/Realtime: Redis + Socket.IO

## Estructura

```text
gamilit-workspace/
|- apps/
|- docs/
`- orchestration/
```

## Ambientes y puertos

| Servicio | Dev | Produccion |
|----------|-----|------------|
| Frontend | 3005 | Nginx/HTTPS |
| Backend | 3006 | Nginx/HTTPS |
| PostgreSQL | 5432 | Interno |
| Redis | 6379 | Interno |

## Referencias

- [../20-architecture/README.md](../20-architecture/README.md)
- [../20-architecture/AMBIENTES-DEV-PROD.md](../20-architecture/AMBIENTES-DEV-PROD.md)
