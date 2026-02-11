# SIMCO-MULTI-WORKSPACE.md

**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0
**Fecha:** 2026-01-20
**Autor:** @PERFIL_INFRASTRUCTURE_MANAGER

---

## PROPOSITO

Esta directiva establece los principios y procedimientos para operar entre los
multiples workspaces del ecosistema ISEM:

- **workspace-v2**: Codigo fuente y proyectos (Windows + WSL mount)
- **workspace-bootstrap**: Automatizacion de onboarding (Windows)
- **workspace-infra**: Infraestructura y operaciones (WSL nativo)

---

## PRINCIPIOS FUNDAMENTALES

### 1. Single Source of Truth (SSOT)

Cada workspace es SSOT para un dominio especifico:

| Workspace | SSOT Para |
|-----------|-----------|
| workspace-v2 | Codigo fuente, documentacion de desarrollo, orchestration, inventarios |
| workspace-bootstrap | Scripts de automatizacion, templates de onboarding |
| workspace-infra | Scripts de BD, configuraciones de servicios, pipelines de deploy |

**REGLA:** No duplicar informacion entre workspaces. Si algo pertenece a un
workspace, referenciarlo desde los otros, no copiarlo.

### 2. Comunicacion por Referencia

Los workspaces se comunican mediante:

1. **Referencias de archivo** (paths documentados)
2. **Mirrors** (copias controladas de definiciones)
3. **Ejecucion remota** (scripts de un workspace ejecutados desde otro)

**NO mediante:**
- Copias manuales de archivos
- Duplicacion de codigo
- Sincronizacion bidireccional no controlada

### 3. Ubicaciones Fijas

| Workspace | Ubicacion Windows | Ubicacion WSL |
|-----------|-------------------|---------------|
| workspace-v2 | `C:\Empresas\ISEM\workspace-v2` | `/mnt/c/Empresas/ISEM/workspace-v2` |
| workspace-bootstrap | `C:\Empresas\ISEM\workspace-bootstrap` | `/mnt/c/Empresas/ISEM/workspace-bootstrap` |
| workspace-infra | N/A | `/home/developer/workspaces/workspace-infra` |

---

## OPERACIONES ENTRE WORKSPACES

### De workspace-v2 a workspace-infra

**Caso de uso:** Ejecutar scripts de base de datos

```powershell
# Desde Windows PowerShell (workspace-v2)
wsl -d Ubuntu-24.04 -u developer -- bash -c '
  cd /home/developer/workspaces/workspace-infra
  bash databases/scripts/recreate-db.sh gamilit_platform
'
```

**Caso de uso:** Cargar DDL desarrollado en v2

```powershell
# DDL esta en workspace-v2, se carga via psql en WSL
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql \
  -d gamilit_platform \
  -f '/mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit/database/ddl/01-schema.sql'
```

### De workspace-bootstrap a workspace-v2

**Caso de uso:** Registrar nueva estacion de trabajo

1. Bootstrap genera `WORKSTATION-REPORT.yml`
2. Contenido se agrega a `workspace-v2/orchestration/inventarios/WORKSTATIONS-INVENTORY.yml`
3. Commit y push en workspace-v2

### De workspace-v2 a workspace-bootstrap

**Caso de uso:** Actualizar templates de onboarding

1. Modificar documentacion en workspace-v2
2. Actualizar referencia en workspace-bootstrap si aplica
3. Commit en ambos repositorios

---

## PROTOCOLO DE SINCRONIZACION

### Para Definiciones (YAML)

1. Origen: workspace donde se define
2. Mirror: `shared/mirrors/{workspace}/definitions/`
3. Sincronizacion: Manual, validacion YAML
4. Frecuencia: Al modificar definiciones

### Para Documentacion

1. Origen: workspace-v2 (SSOT de documentacion)
2. Referencias: Otros workspaces referencian, no copian
3. Excepcion: READMEs locales de cada workspace

### Para Scripts

1. **NO se copian** entre workspaces
2. Se ejecutan remotamente via WSL
3. Se documentan en mirrors como referencia

---

## INVENTARIOS RELACIONADOS

| Inventario | Ubicacion | Proposito |
|------------|-----------|-----------|
| WORKSPACE-REGISTRY.yml | orchestration/inventarios/ | Registro central de workspaces |
| LOCAL-WSL-ENVIRONMENT.yml | orchestration/inventarios/ | Ambiente WSL local |
| CREDENTIALS-INVENTORY.yml | orchestration/inventarios/ | Ubicacion de credenciales |
| DEV-SERVERS-INVENTORY.yml | orchestration/inventarios/ | Servidores de desarrollo |
| WORKSTATIONS-INVENTORY.yml | orchestration/inventarios/ | Estaciones de trabajo |

---

## ALIASES DE INVOCACION

| Alias | Archivo | Uso |
|-------|---------|-----|
| `@MULTI-WORKSPACE` | Esta directiva | Operaciones entre workspaces |
| `@WORKSPACE-REGISTRY` | WORKSPACE-REGISTRY.yml | Consultar registro de workspaces |
| `@WSL-ENV` | LOCAL-WSL-ENVIRONMENT.yml | Ambiente WSL y credenciales dev |
| `@WSL-OPS` | SIMCO-LOCAL-WSL.md | Operaciones en WSL |
| `@CREDENTIALS` | CREDENTIALS-INVENTORY.yml | Ubicacion de credenciales |
| `@DEV-SERVERS` | DEV-SERVERS-INVENTORY.yml | Servidores de desarrollo |

---

## CHECKLIST PARA OPERACIONES MULTI-WORKSPACE

### Antes de Operar

- [ ] Identificar workspace origen (donde esta el recurso)
- [ ] Identificar workspace destino (donde se usara)
- [ ] Verificar SSOT (no duplicar, referenciar)
- [ ] Cargar directiva del workspace destino si aplica

### Al Ejecutar

- [ ] Usar rutas correctas segun plataforma (Windows vs WSL)
- [ ] Ejecutar comandos WSL con usuario correcto (`developer`)
- [ ] Validar que servicios esten corriendo si se requieren

### Despues de Operar

- [ ] Documentar cambios si modifican estado
- [ ] Actualizar inventarios si corresponde
- [ ] Commit y push en workspaces afectados

---

## ERRORES COMUNES

### Error: Ruta no encontrada

**Causa:** Usar ruta Windows en contexto WSL o viceversa.

**Solucion:**
- Windows: `C:\Empresas\ISEM\...`
- WSL accediendo a Windows: `/mnt/c/Empresas/ISEM/...`
- WSL nativo: `/home/developer/workspaces/...`

### Error: Permiso denegado en WSL

**Causa:** Ejecutar sin sudo cuando se requiere.

**Solucion:**
```bash
wsl -d Ubuntu-24.04 -u developer -- sudo <comando>
# Password: developer_wsl_2026
```

### Error: Servicio no disponible

**Causa:** PostgreSQL/Redis/Nginx no corriendo en WSL.

**Solucion:**
```bash
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl start postgresql
```

---

## REFERENCIAS

- `@WORKSPACE-REGISTRY` - Registro central de workspaces
- `@WSL-ENV` - Ambiente WSL local
- `@WSL-OPS` - Operaciones en WSL (SIMCO-LOCAL-WSL.md)
- `docs/_SSOT/TRACEABILITY-MASTER.yml` - Trazabilidad del workspace
- `shared/mirrors/workspace-infra/` - Mirror de workspace-infra

---

**Mantenido por:** @PERFIL_INFRASTRUCTURE_MANAGER
