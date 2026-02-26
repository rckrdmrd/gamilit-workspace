# QUICK-REFERENCE.md - GAMILIT

> **Versión:** 1.0.0
> **Fecha:** 2026-01-24
> **Sistema:** SIMCO v4.0.0 + NEXUS v4.1

---

## 1. ESTRUCTURA RÁPIDA

```
projects/gamilit/
├── apps/
│   ├── backend/        # NestJS 11 - 23 módulos, 912 endpoints
│   ├── frontend/       # React 19 - 590 componentes, 70 páginas
│   └── database/ddl/   # PostgreSQL 15 - 18 schemas, 173 tablas
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
| `DATABASE_INVENTORY.yml` | 173 tablas, 18 schemas |
| `BACKEND_INVENTORY.yml` | 23 módulos, 912 endpoints |
| `FRONTEND_INVENTORY.yml` | 590 componentes, 70 páginas |
| `MASTER_INVENTORY.yml` | Totales consolidados |
| `SEEDS_INVENTORY.yml` | Datos semilla |

---

## 6. SCHEMAS DE BD

```
auth                  # Usuarios base (auth.users)
auth_management       # Perfiles, roles, tenants, sesiones
educational_content   # Modulos, ejercicios, rubrics, assignments
progress_tracking     # Progreso, submissions, learning sessions
gamification_system   # XP, rangos maya, achievements, ML coins, tienda
social_features       # Escuelas, aulas, equipos, amigos, challenges
notification_system   # Notificaciones, templates, queue, devices
admin_dashboard       # Reportes admin, operaciones bulk, metricas
audit_logging         # Logs auditoria, alertas sistema, actividad
lti_integration       # Consumidores LTI, sesiones, grade passback
communication         # Mensajes, conversaciones, participantes
parent_portal         # Cuentas padres, vinculacion estudiantes
data_warehouse        # Dimensiones, facts, ETL, ML (16 tablas)
ml_analytics          # Modelos ML, predicciones (placeholder)
content_moderation    # Moderacion contenido (placeholder)
public                # Schema publico PostgreSQL
extensions            # Extensiones PostgreSQL (uuid-ossp, etc.)
gamilit               # Funciones utilitarias globales
```

---

## 7. PORTALES

| Portal | Ruta | Estado |
|--------|------|--------|
| Student Portal | `/student/*` | 100% |
| Teacher Portal | `/teacher/*` | 95% |
| Admin Portal | `/admin/*` | 92% |
| Parent Portal | `/parent/*` | 100% |

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

GAMILIT es standalone. La base normativa local es:
1. `orchestration/directivas/` (SIMCO)
2. `orchestration/_inheritance.yml` (modelo de herencia local)

Ver: `orchestration/templates/04-globales/HERENCIA-SIMCO.md`

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
