# QUICK-REFERENCE.md - GAMILIT

> **Versión:** 1.0.0
> **Fecha:** 2026-01-24
> **Sistema:** SIMCO v4.0.0 + NEXUS v4.1

---

## 1. ESTRUCTURA RÁPIDA

```
projects/gamilit/
├── apps/
│   ├── backend/        # NestJS 11 - 17 módulos, 612 endpoints
│   ├── frontend/       # React 18 - 327 componentes, 74 páginas
│   └── database/ddl/   # PostgreSQL 16 - 16 schemas, 137 tablas
├── orchestration/      # Documentación operacional
├── docs/               # Documentación de usuario
├── .claude/            # Config Claude Code
├── .trae/              # Config Trae IDE
├── .windsurf/          # Config Windsurf IDE
└── .gemini/            # Config Gemini CLI
```

---

## 2. CREDENCIALES

| Recurso | Valor |
|---------|-------|
| Database | `gamilit_platform` |
| User | `gamilit_user` |
| Password | `gamilit_dev_2026` |
| Port | `5432` |
| Redis DB | `0` |

---

## 3. COMANDOS FRECUENTES

### Backend
```bash
cd projects/gamilit/apps/backend
npm run build       # Compilar
npm run lint        # Lintear
npm run test        # Tests
npm run start:dev   # Desarrollo
```

### Frontend
```bash
cd projects/gamilit/apps/frontend
npm run build       # Compilar
npm run lint        # Lintear
npm run dev         # Desarrollo
```

### Base de Datos (WSL)
```powershell
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform
```

---

## 4. ALIASES LOCALES

| Alias | Descripción |
|-------|-------------|
| `@GAMILIT` | Este proyecto |
| `@GAMILIT_BACKEND` | apps/backend/ |
| `@GAMILIT_FRONTEND` | apps/frontend/ |
| `@GAMILIT_DDL` | apps/database/ddl/ |
| `@GAMILIT_ORCHESTRATION` | orchestration/ |

---

## 5. INVENTARIOS

| Archivo | Contenido |
|---------|-----------|
| `DATABASE_INVENTORY.yml` | 137 tablas, 16 schemas |
| `BACKEND_INVENTORY.yml` | 17 módulos, 612 endpoints |
| `FRONTEND_INVENTORY.yml` | 327 componentes, 74 páginas |
| `MASTER_INVENTORY.yml` | Totales consolidados |
| `SEEDS_INVENTORY.yml` | Datos semilla |

---

## 6. SCHEMAS DE BD

```
01_users        # Usuarios y autenticación
02_institutions # Instituciones educativas
03_courses      # Cursos y curriculas
04_enrollments  # Matrículas
05_assessments  # Evaluaciones
06_gamification # Gamificación (XP, badges, leaderboards)
07_content      # Contenido educativo
08_notifications# Notificaciones
09_payments     # Pagos
10_analytics    # Analíticas
11_support      # Soporte
12_integrations # Integraciones
13_audit        # Auditoría
14_config       # Configuración
15_calendar     # Calendario
16_reports      # Reportes
```

---

## 7. PORTALES

| Portal | Ruta | Estado |
|--------|------|--------|
| Student Portal | `/student/*` | 90% |
| Teacher Portal | `/teacher/*` | 85% |
| Admin Portal | `/admin/*` | 80% |
| Public Website | `/` | 75% |

---

## 8. CHECKPOINTS (NEXUS v4.1)

### Triggers Automáticos
- **70% tokens:** Alerta amarilla
- **85% tokens:** Checkpoint automático
- **30 min:** Checkpoint periódico

### Archivos
```
orchestration/trazas/CHECKPOINT-{YYYY-MM-DD-HHmm}.yml
orchestration/PROXIMA-ACCION.md
orchestration/trazas/DECISIONES-SESION.yml
```

---

## 9. HERENCIA

GAMILIT hereda de:
1. `workspace-v2/CLAUDE.md` (reglas workspace)
2. `workspace-v2/orchestration/directivas/` (SIMCO)

Ver: `orchestration/00-guidelines/HERENCIA-SIMCO.md`

---

## 10. VALIDACIONES OBLIGATORIAS

Antes de marcar tarea completada:

```bash
# Backend
npm run build && npm run lint

# Frontend
npm run build && npm run lint

# Git
git status  # Debe estar limpio
```

---

## 11. DOCUMENTACIÓN

| Ubicación | Contenido |
|-----------|-----------|
| `docs/` | Documentación de usuario |
| `orchestration/` | Documentación operacional |
| `orchestration/00-guidelines/` | Directivas y herencia |
| `orchestration/inventarios/` | Inventarios |
| `orchestration/trazas/` | Trazas y checkpoints |

---

## 12. FLUJO DE 4 FASES

```
Fase 1: Claude Code → Análisis + Plan alto nivel
Fase 2: Trae       → Plan atómico detallado
Fase 3: Windsurf   → Ejecución de tareas
Fase 4: Claude/Trae→ Validación
```

---

## 13. CONTACTOS

| Rol | Archivo |
|-----|---------|
| Orquestador | `orchestration/agents/perfiles/PERFIL-ORQUESTADOR.md` |
| Backend | `orchestration/agents/perfiles/PERFIL-BACKEND.md` |
| Frontend | `orchestration/agents/perfiles/PERFIL-FRONTEND.md` |
| Database | `orchestration/agents/perfiles/PERFIL-DATABASE.md` |

---

*GAMILIT Quick Reference - NEXUS v4.1*
