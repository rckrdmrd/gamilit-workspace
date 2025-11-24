# DELEGACIÓN DE TAREAS GAPS P2

**Fecha:** 2025-11-23
**Origen:** Architecture-Analyst
**Referencia:** REPORTE-COHERENCIA-DOCUMENTACION-CODIGO-2025-11-23.md
**Prioridad:** P2 - MEJORAS (2-4 semanas)

---

## 🎯 RESUMEN

Se delegan 2 tareas de mejora (P2) que requieren investigación y documentación técnica:

### Tareas Delegadas

1. **GAP-6:** Validar 48 tablas sin entity (4 hrs) → Database-Developer + Backend-Developer
2. **GAP-8:** Documentar estándares operacionales (8 hrs) → Tech Lead + DevOps

**Tiempo total:** 12 horas
**Impacto:** Claridad en inventarios + Documentación operativa completa

---

## 📋 TAREA 1: GAP-6 - VALIDAR 48 TABLAS SIN ENTITY

### Información General

**Responsables:** Database-Developer (lead) + Backend-Developer (colaborador)
**Severidad:** 🟢 BAJA (pero importante para claridad)
**Tiempo estimado:** 4 horas
**Prioridad:** P2 (próximas 2-4 semanas)

---

### Contexto del Problema

**Fuente:** DATABASE_INVENTORY.yml (línea ~419, fuera del límite leído en validación)

**Mención original:**
> "48 tables have DDL but no backend entity (47% gap)"

**Pregunta sin responder:**
¿Estas 48 tablas son realmente un "gap" o son casos legítimos?

**Casos posibles:**
1. ✅ **Tablas auxiliares legítimas** que NO requieren entity:
   - Tablas de configuración (solo datos estáticos)
   - Tablas de lookup (enumeraciones extendidas)
   - Tablas de auditoría (solo escritura, nunca lectura en app)
   - Tablas técnicas (migraciones, metadata)

2. ⏳ **Tablas pendientes de implementar** (backlog legítimo):
   - Features fase 2 o 3 con DDL preparado
   - Módulos parcialmente implementados

3. ❌ **Tablas obsoletas** que deben eliminarse:
   - DDL legacy que ya no se usa
   - Experimentos descartados
   - Cambios de diseño que dejaron tablas huérfanas

---

### Objetivo de la Tarea

**Clasificar las 48 tablas** en una de las 3 categorías anteriores y documentar la decisión.

**Entregable:**
```
orchestration/agentes/database/validation/REPORTE-VALIDACION-TABLAS-SIN-ENTITY-2025-11-XX.md
```

---

### Paso 1: Identificar las 48 Tablas

**Método:**

```bash
# Generar lista de tablas con DDL
find apps/database/ddl -name "*.sql" -type f | while read file; do
  grep -o "CREATE TABLE [a-z_]*\.[a-z_]*" "$file" | awk '{print $3}'
done | sort -u > /tmp/tables-with-ddl.txt

# Generar lista de entities en backend
find apps/backend/src -name "*.entity.ts" -type f | while read file; do
  # Extraer nombre de tabla del decorador @Entity
  grep -o "@Entity(['\"][a-z_]*['\"])" "$file" | sed "s/@Entity(['\"]//;s/['\"])$//"
done | sort -u > /tmp/tables-with-entity.txt

# Diff para encontrar tablas sin entity
comm -23 /tmp/tables-with-ddl.txt /tmp/tables-with-entity.txt > /tmp/tables-sin-entity.txt

# Contar
wc -l /tmp/tables-sin-entity.txt
# Debería ser ~48
```

**Validación:**
Si el número no es exactamente 48, investigar por qué (puede haber cambiado desde la última validación de DATABASE_INVENTORY.yml).

---

### Paso 2: Clasificar Cada Tabla

**Para CADA tabla en la lista:**

1. **Leer el DDL** (`apps/database/ddl/schemas/[schema]/tables/[tabla].sql`)
2. **Analizar el propósito** (comentarios, columnas, constraints)
3. **Buscar referencias** en código:
   ```bash
   # Buscar referencias en backend
   grep -r "tabla_nombre" apps/backend/src --include="*.ts"

   # Buscar referencias en queries SQL
   grep -r "tabla_nombre" apps/database --include="*.sql"
   ```

4. **Clasificar según criterios:**

**Criterio para "Tabla Auxiliar Legítima" (✅):**
- Tabla de configuración con pocos registros estáticos
- Tabla de lookup (ejemplo: `difficulty_criteria`, `config_options`)
- Tabla de auditoría pura (solo INSERT, nunca SELECT en app)
- Tabla técnica (migraciones, metadata de sistema)

**Criterio para "Pendiente Backlog" (⏳):**
- Pertenece a épica parcialmente implementada
- DDL existe pero feature no desarrollado aún
- Referenciado en documentación de fase futura

**Criterio para "Obsoleta" (❌):**
- No hay referencias en código ni docs
- Comentarios indican "deprecated" o "legacy"
- Funcionalidad fue reemplazada por otra tabla

5. **Documentar decisión** en tabla de clasificación

---

### Paso 3: Generar Reporte

**Formato del reporte:**

```markdown
# REPORTE: VALIDACIÓN TABLAS SIN ENTITY

**Fecha:** 2025-11-XX
**Responsable:** Database-Developer
**Colaborador:** Backend-Developer
**Total tablas analizadas:** 48

---

## RESUMEN EJECUTIVO

| Categoría | Cantidad | % del Total | Acción Requerida |
|-----------|----------|-------------|------------------|
| ✅ Auxiliares Legítimas | XX | XX% | Ninguna (documentar en inventario) |
| ⏳ Backlog Pendiente | XX | XX% | Crear issues de implementación |
| ❌ Obsoletas | XX | XX% | Eliminar DDL |

---

## TABLAS AUXILIARES LEGÍTIMAS (✅)

### [Schema].[tabla_1]

**Propósito:** Tabla de configuración estática para [funcionalidad]

**Razón NO requiere entity:**
- Solo contiene datos de configuración leídos una vez al inicio
- Backend accede vía query directa en startup
- No hay operaciones CRUD desde la aplicación

**Evidencia:**
- DDL: `apps/database/ddl/schemas/[schema]/tables/[tabla].sql`
- Referencias: `apps/backend/src/config/[archivo].ts:42`

**Decisión:** Mantener sin entity. Documentar en DATABASE_INVENTORY.yml como "tabla auxiliar".

---

### [Schema].[tabla_2]

[Repetir para cada tabla ✅]

---

## TABLAS BACKLOG PENDIENTE (⏳)

### [Schema].[tabla_X]

**Propósito:** Tabla para feature [nombre_feature] (épica [EXT-XXX])

**Estado de implementación:**
- DDL: ✅ Creado (fase preparatoria)
- Seeds: ⏳ Pendiente
- Entity: ❌ No creado
- Service: ❌ No creado
- Controller: ❌ No creado

**Épica relacionada:** EXT-XXX (estado: backlog)

**Decisión:** Crear issue para implementar entity + service cuando se priorice épica.

**Issue sugerido:**
```
Title: [Backend] Implementar Entity y Service para [tabla]
Epic: EXT-XXX
Estimation: 3 story points
Priority: Low (backlog)
Description:
- Crear [Tabla]Entity en apps/backend/src/modules/[modulo]/entities/
- Crear [Tabla]Service con CRUD básico
- Agregar a [Modulo]Module
- Tests unitarios (coverage ≥ 70%)
```

---

### [Schema].[tabla_Y]

[Repetir para cada tabla ⏳]

---

## TABLAS OBSOLETAS (❌)

### [Schema].[tabla_Z]

**Propósito original:** [Descripción]

**Razón obsoleta:**
- Feature descartado en [fecha/decisión]
- Reemplazado por [nueva_tabla] en [fecha]
- Sin referencias en código desde [fecha]

**Evidencia:**
- Sin referencias en `apps/backend/`
- Sin referencias en `apps/frontend/`
- No mencionado en documentación actual

**Decisión:** **Eliminar DDL**

**Acción:**
1. Verificar que tabla NO existe en DB producción:
   ```sql
   SELECT COUNT(*) FROM [schema].[tabla];
   -- Si no existe o está vacía, safe to delete DDL
   ```

2. Si existe en prod con datos:
   - Crear migration de DROP (con backup previo)
   - Coordinar con DevOps para backup manual pre-drop
   - Ejecutar en ventana de mantenimiento

3. Eliminar archivo DDL:
   ```bash
   rm apps/database/ddl/schemas/[schema]/tables/[tabla].sql
   ```

4. Actualizar DATABASE_INVENTORY.yml (remover entrada)

---

### [Schema].[tabla_W]

[Repetir para cada tabla ❌]

---

## ACCIONES REQUERIDAS

### Inmediatas (Esta Semana)

- [ ] Actualizar DATABASE_INVENTORY.yml con clasificación:
  ```yaml
  tables:
    - name: [tabla_auxiliar]
      has_entity: false
      reason: "Configuration table, no entity required"
      category: auxiliary
  ```

### Corto Plazo (Próximas 2 Semanas)

- [ ] Crear issues de GitHub para tablas ⏳ backlog (XX issues)
- [ ] Eliminar DDL de tablas ❌ obsoletas (XX archivos)
- [ ] Actualizar documentación con decisiones

### Validación

- [ ] Backend-Developer revisa clasificación
- [ ] Tech Lead aprueba decisiones de eliminación
- [ ] Architecture-Analyst valida coherencia inventario

---

## MÉTRICAS FINALES

**Antes:**
- Total tablas: 121
- Tablas con DDL: 121
- Tablas con entity: 73
- Gap: 48 tablas (47%)

**Después:**
- Total tablas: 121 - XX (obsoletas eliminadas) = YY
- Tablas con entity: 73
- Tablas auxiliares sin entity (legítimo): XX
- Tablas backlog pendiente: XX
- Gap real: XX tablas (YY%)

**Conclusión:** Gap inicial de 47% era inflado. Gap real es YY%.

---

**FIN DEL REPORTE**
```

---

### Validación de la Tarea

**Checklist de completitud:**

- [ ] 48 tablas identificadas y listadas
- [ ] Cada tabla clasificada en ✅/⏳/❌
- [ ] Decisión documentada para cada tabla
- [ ] Evidencia incluida (rutas, referencias)
- [ ] Issues creados para tablas ⏳
- [ ] DDL eliminado para tablas ❌
- [ ] DATABASE_INVENTORY.yml actualizado
- [ ] Reporte generado y revisado

---

## 📋 TAREA 2: GAP-8 - DOCUMENTAR ESTÁNDARES OPERACIONALES

### Información General

**Responsables:** Tech Lead (lead) + DevOps (colaborador)
**Severidad:** 🟢 BAJA (pero importante para operación)
**Tiempo estimado:** 8 horas
**Prioridad:** P2 (próximas 2-4 semanas)

---

### Contexto del Problema

**Fuente:** Exploration Report y validaciones del Architecture-Analyst

**Gaps identificados:**
- ❌ Falta de runbooks para incidentes comunes
- ❌ Falta de plan de disaster recovery documentado
- ❌ Falta de documentación de monitoring y alertas
- ❌ Falta de procedimientos de despliegue estándar

**Impacto:**
- Respuesta lenta a incidentes (no hay procedimientos)
- Riesgo de pérdida de datos (sin DR documentado)
- Alertas ignoradas (no hay contexto documentado)
- Despliegues inconsistentes (cada dev lo hace diferente)

---

### Objetivo de la Tarea

**Crear 4 documentos operacionales** en `docs/90-transversal/operaciones/`:

1. RUNBOOK-INCIDENTES.md (2 hrs)
2. DISASTER-RECOVERY-PLAN.md (2 hrs)
3. MONITORING-ALERTAS.md (2 hrs)
4. PROCEDIMIENTO-DESPLIEGUE.md (2 hrs)

---

### Documento 1: RUNBOOK-INCIDENTES.md (2 hrs)

**Ubicación:** `docs/90-transversal/operaciones/RUNBOOK-INCIDENTES.md`

**Contenido esperado:**

```markdown
# RUNBOOK: INCIDENTES Y RESOLUCIÓN

## Incidentes Comunes

### INC-001: Base de Datos Inaccesible

**Síntomas:**
- Aplicación retorna error 500
- Logs muestran "Connection refused to PostgreSQL"
- Health check `/health` falla

**Diagnóstico:**
```bash
# Verificar estado PostgreSQL
sudo systemctl status postgresql

# Verificar conexiones
psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT 1"

# Ver logs PostgreSQL
tail -100 /var/log/postgresql/postgresql-14-main.log
```

**Resolución:**
1. Reiniciar PostgreSQL: `sudo systemctl restart postgresql`
2. Verificar health check: `curl http://localhost:3000/health`
3. Si persiste, verificar disk space: `df -h`
4. Escalar a DevOps si disk full

**Tiempo estimado:** 5 minutos

---

### INC-002: Backend No Responde

[Similar para 10-15 incidentes comunes]

---

## Contactos de Escalamiento

- **Tech Lead:** [nombre] - [email] - [teléfono]
- **DevOps:** [nombre] - [email] - [teléfono]
- **On-call:** Rotación semanal (ver calendario)

---

## Post-Mortem Template

[Template para documentar incidentes]
```

---

### Documento 2: DISASTER-RECOVERY-PLAN.md (2 hrs)

**Ubicación:** `docs/90-transversal/operaciones/DISASTER-RECOVERY-PLAN.md`

**Contenido esperado:**

```markdown
# PLAN DE DISASTER RECOVERY

## RTO y RPO

**RTO (Recovery Time Objective):** 4 horas
**RPO (Recovery Point Objective):** 1 hora

## Backups

### Base de Datos

**Frecuencia:** Diaria (2 AM)
**Retención:** 30 días
**Ubicación:** AWS S3 bucket `gamilit-backups/`

**Comando de backup manual:**
```bash
pg_dump -h localhost -U gamilit_user gamilit_platform | \
  gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

**Comando de restauración:**
```bash
gunzip < backup-YYYYMMDD-HHMMSS.sql.gz | \
  psql -h localhost -U gamilit_user gamilit_platform
```

---

### Archivos de Aplicación

**Frecuencia:** Continua (Git)
**Ubicación:** GitHub repository

---

## Procedimiento de Recuperación

### Escenario 1: Pérdida Total de Base de Datos

1. Provisionar nueva instancia PostgreSQL
2. Restaurar desde backup más reciente
3. Verificar integridad de datos
4. Actualizar connection string en aplicación
5. Smoke tests completos

**Tiempo estimado:** 2 horas

---

### Escenario 2: Pérdida Total de Servidor

[Similar para otros escenarios]

---

## Tests de DR

**Frecuencia:** Trimestral
**Responsable:** DevOps + Tech Lead
**Última ejecución:** [fecha]
**Próxima ejecución:** [fecha]
```

---

### Documento 3: MONITORING-ALERTAS.md (2 hrs)

**Ubicación:** `docs/90-transversal/operaciones/MONITORING-ALERTAS.md`

**Contenido esperado:**

```markdown
# MONITORING Y ALERTAS

## Herramientas

- **APM:** [New Relic / Datadog / etc]
- **Logs:** [CloudWatch / Elasticsearch / etc]
- **Uptime:** [Pingdom / UptimeRobot / etc]

## Métricas Monitoreadas

### Aplicación

| Métrica | Umbral Warning | Umbral Critical | Acción |
|---------|----------------|-----------------|--------|
| Response time | > 1s | > 3s | Investigar performance |
| Error rate | > 1% | > 5% | Check logs, rollback si necesario |
| CPU usage | > 70% | > 90% | Scale up |
| Memory usage | > 75% | > 90% | Check memory leaks |

---

### Base de Datos

| Métrica | Umbral Warning | Umbral Critical | Acción |
|---------|----------------|-----------------|--------|
| Connections | > 80 | > 95 | Investigate connection pool |
| Disk space | > 80% | > 90% | Cleanup / expand disk |
| Query time | > 500ms | > 2s | Optimize queries |

---

## Alertas Configuradas

### ALERT-001: High Error Rate

**Condición:** Error rate > 5% durante 5 minutos

**Severidad:** CRITICAL

**Canal:** PagerDuty → On-call engineer

**Runbook:** Ver INC-003 en RUNBOOK-INCIDENTES.md

---

### ALERT-002: Database Down

[Similar para 10-15 alertas]

---

## On-Call Rotation

**Turno:** Semanal (Lunes 9 AM - Lunes 9 AM)
**Calendario:** [Link a Google Calendar]
**Compensación:** [Política de compensación]
```

---

### Documento 4: PROCEDIMIENTO-DESPLIEGUE.md (2 hrs)

**Ubicación:** `docs/90-transversal/operaciones/PROCEDIMIENTO-DESPLIEGUE.md`

**Contenido esperado:**

```markdown
# PROCEDIMIENTO DE DESPLIEGUE

## Ambientes

| Ambiente | URL | Branch | Deploy Automático |
|----------|-----|--------|-------------------|
| **Development** | dev.gamilit.com | develop | ✅ Sí (cada commit) |
| **Staging** | staging.gamilit.com | staging | ✅ Sí (cada PR merge) |
| **Production** | gamilit.com | main | ❌ No (manual) |

---

## Despliegue a Producción (Manual)

### Pre-requisitos

- [ ] Tests CI/CD passing (verde)
- [ ] Code review aprobado (2 approvals)
- [ ] QA testing completo en staging
- [ ] Changelog actualizado
- [ ] Backup de DB ejecutado
- [ ] Ventana de despliegue coordinada

---

### Paso 1: Preparación (15 min antes)

```bash
# Verificar estado actual
curl https://gamilit.com/health

# Notificar a usuarios (si aplicable)
# Mostrar banner de mantenimiento
```

---

### Paso 2: Despliegue (10 min)

```bash
# SSH a servidor de producción
ssh prod-server

# Pull latest code
cd /opt/gamilit
git fetch origin
git checkout main
git pull origin main

# Instalar dependencies
npm ci

# Build aplicación
npm run build

# Ejecutar migraciones (si aplica)
npm run migrate:prod

# Restart servicios
pm2 restart gamilit-api
pm2 restart gamilit-frontend
```

---

### Paso 3: Verificación (5 min)

```bash
# Health check
curl https://gamilit.com/health

# Smoke tests
npm run smoke-test:prod

# Verificar logs
pm2 logs gamilit-api --lines 50
```

---

### Paso 4: Monitoreo (30 min post-deploy)

- Monitorear dashboard de métricas
- Revisar logs por errores
- Verificar alertas no disparadas
- Confirmar con QA funcionamiento básico

---

## Rollback (Si algo falla)

```bash
# Git rollback
git checkout [commit-anterior]
npm run build
pm2 restart all

# DB rollback (si se ejecutó migración)
npm run migrate:rollback

# Verificar
curl https://gamilit.com/health
```

---

## Checklist de Despliegue

```markdown
## Pre-Deploy
- [ ] CI/CD verde
- [ ] Code review (2+ approvals)
- [ ] QA testing completo
- [ ] Changelog actualizado
- [ ] Backup DB ejecutado
- [ ] Ventana coordinada
- [ ] Stakeholders notificados

## Durante Deploy
- [ ] Health check pre-deploy OK
- [ ] Code pulled successfully
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Migraciones ejecutadas
- [ ] Servicios restarted
- [ ] Health check post-deploy OK
- [ ] Smoke tests passing

## Post-Deploy
- [ ] Logs sin errores críticos
- [ ] Métricas normales (30 min)
- [ ] QA smoke test en producción
- [ ] Stakeholders notificados (completado)
- [ ] Post-mortem si hubo issues
```

---

**FIN DEL DOCUMENTO**
```

---

### Validación de la Tarea

**Checklist de completitud:**

- [ ] RUNBOOK-INCIDENTES.md creado (10-15 incidentes documentados)
- [ ] DISASTER-RECOVERY-PLAN.md creado (RTO/RPO, backups, procedimientos)
- [ ] MONITORING-ALERTAS.md creado (métricas, alertas, on-call)
- [ ] PROCEDIMIENTO-DESPLIEGUE.md creado (paso a paso, checklist)
- [ ] Documentos revisados por DevOps
- [ ] Documentos aprobados por Tech Lead
- [ ] Links cruzados entre documentos funcionales

---

## 📊 IMPACTO ESPERADO

### Después de GAP-6

**Inventario de Base de Datos:**
- Claridad en tablas sin entity: 100%
- Gap real documentado (no inflado)
- Issues de backlog priorizados
- DDL obsoleto eliminado

**Beneficios:**
- Backend devs saben qué implementar
- Database devs saben qué mantener
- Inventarios reflejan realidad

---

### Después de GAP-8

**Documentación Operacional:**
- Runbooks para incidentes comunes
- Plan de DR documentado y testeable
- Monitoring y alertas claras
- Procedimientos de despliegue consistentes

**Beneficios:**
- Respuesta a incidentes 50% más rápida
- Confianza en recuperación de desastres
- Menos despliegues fallidos
- Onboarding operacional más rápido

---

## ✅ CHECKLIST DE DELEGACIÓN

### Para Database-Developer + Backend-Developer (GAP-6)

- [ ] Leer especificación completa de GAP-6
- [ ] Ejecutar script de identificación de tablas
- [ ] Clasificar 48 tablas (✅/⏳/❌)
- [ ] Generar reporte completo
- [ ] Crear issues para tablas ⏳
- [ ] Eliminar DDL para tablas ❌
- [ ] Actualizar DATABASE_INVENTORY.yml
- [ ] Notificar a Architecture-Analyst

**Deadline sugerido:** 2 semanas (2025-12-07)

---

### Para Tech Lead + DevOps (GAP-8)

- [ ] Leer especificación completa de GAP-8
- [ ] Crear RUNBOOK-INCIDENTES.md
- [ ] Crear DISASTER-RECOVERY-PLAN.md
- [ ] Crear MONITORING-ALERTAS.md
- [ ] Crear PROCEDIMIENTO-DESPLIEGUE.md
- [ ] Revisar documentos en equipo
- [ ] Validar procedimientos con test de DR
- [ ] Notificar a Architecture-Analyst

**Deadline sugerido:** 3 semanas (2025-12-14)

---

## 🔄 SEGUIMIENTO

**Responsable:** Architecture-Analyst

**Check-ins:**
- Semana 1: ¿Iniciado? ¿Bloqueadores?
- Semana 2: ¿50% completado? ¿Ajustes necesarios?
- Semana 3-4: ¿Completado? ¿Validación OK?

**Reportar completitud con:**

```markdown
✅ GAP-6 y GAP-8 completados

**GAP-6 (Tablas sin Entity):**
- ✅ 48 tablas clasificadas
- ✅ XX tablas auxiliares (mantener)
- ✅ XX tablas backlog (XX issues creados)
- ✅ XX tablas obsoletas (DDL eliminado)
- ✅ DATABASE_INVENTORY.yml actualizado
- ✅ Reporte generado

**GAP-8 (Estándares Operacionales):**
- ✅ RUNBOOK-INCIDENTES.md (15 incidentes)
- ✅ DISASTER-RECOVERY-PLAN.md (3 escenarios)
- ✅ MONITORING-ALERTAS.md (12 alertas)
- ✅ PROCEDIMIENTO-DESPLIEGUE.md (checklist completo)
- ✅ Revisión DevOps aprobada
- ✅ Test de DR ejecutado

**Archivos generados:**
- orchestration/agentes/database/validation/REPORTE-VALIDACION-TABLAS-SIN-ENTITY-2025-XX-XX.md
- docs/90-transversal/operaciones/RUNBOOK-INCIDENTES.md
- docs/90-transversal/operaciones/DISASTER-RECOVERY-PLAN.md
- docs/90-transversal/operaciones/MONITORING-ALERTAS.md
- docs/90-transversal/operaciones/PROCEDIMIENTO-DESPLIEGUE.md
```

---

**Versión:** 1.0
**Generado por:** Architecture-Analyst
**Estado:** ACTIVO - DELEGACIÓN EN CURSO
**Fecha:** 2025-11-23

---

**FIN DE DELEGACIÓN GAPS P2**
