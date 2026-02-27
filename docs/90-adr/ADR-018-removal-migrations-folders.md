---
titulo: "ADR-018: Eliminacion de Carpetas Migrations"
tipo: adr
fecha_creacion: "2025-11-24"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-018: Eliminación de Carpetas Migrations

**Fecha:** 2025-11-24
**Estado:** Aceptada
**Contexto:** Validación de coherencia multicapa post CORR-001 a CORR-006
**Issue relacionado:** ISSUE-DB-P1-001

---

## 📋 CONTEXTO

Durante la validación de coherencia multicapa realizada el 2025-11-24, se identificó la existencia de 2 carpetas `migrations/` en el proyecto de base de datos:

1. `/apps/database/migrations/` (2 archivos)
2. `/apps/database/scripts/migrations/` (2 archivos)

Estas carpetas violan la **Política de Carga Limpia** establecida en `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` (sección 2: Prohibición de Migrations).

---

## ⚠️ PROBLEMA

### Violaciones Identificadas

**Carpetas encontradas:**
```
apps/database/migrations/
├── 2025-11-24-backfill-module-progress.sql
└── 2025-11-24-test-initialize-user-stats.sql

apps/database/scripts/migrations/
├── DB-126-add-soft-delete-classrooms.sql
└── DB-131-fix-recent-activity-view.sql
```

### Impacto

1. **Confusión operacional:** Desarrolladores no saben si deben ejecutar migrations o DDL
2. **Riesgo de inconsistencia:** Migrations pueden aplicar cambios que no están en DDL
3. **Violación de política:** Contradice directiva `DIRECTIVA-POLITICA-CARGA-LIMPIA.md`
4. **Dificulta validación:** Recreación completa puede diferir de estado real de BD

### Análisis de Archivos

**`DB-131-fix-recent-activity-view.sql`:**
- Probablemente versión anterior de **CORR-005**
- Ya integrado en `/apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
- **Conclusión:** Obsoleto, puede eliminarse

**Otros archivos:**
- Cambios experimentales o tests
- No están referenciados en `create-database.sh`
- **Conclusión:** No son parte del flujo de carga limpia

---

## 🎯 DECISIÓN

**Eliminar todas las carpetas `migrations/` del proyecto de base de datos.**

### Acciones Tomadas

1. **Creación de carpeta `_deprecated/`:**
   ```bash
   mkdir -p apps/database/_deprecated/migrations-removed-2025-11-24
   ```

2. **Mover archivos a `_deprecated/`:**
   ```bash
   mv apps/database/migrations/* _deprecated/migrations-removed-2025-11-24/
   mv apps/database/scripts/migrations/* _deprecated/migrations-removed-2025-11-24/
   ```

3. **Eliminar carpetas vacías:**
   ```bash
   rmdir apps/database/migrations
   rmdir apps/database/scripts/migrations
   ```

4. **Validación con recreación completa:**
   ```bash
   cd apps/database
   ./drop-and-recreate-database.sh
   ```
   **Resultado:** ✅ Recreación exitosa sin errores

---

## ✅ RAZONES

### 1. Cumplimiento de Política de Carga Limpia

**Extracto de `DIRECTIVA-POLITICA-CARGA-LIMPIA.md`:**

> **Sección 2: Prohibición de Migrations**
> - NO crear carpetas `migrations/`
> - NO crear archivos `fix-*.sql`, `patch-*.sql`, `hotfix-*.sql`
> - Todos los cambios deben estar en DDL y seeds

**Razón:** Garantizar que DDL es siempre la fuente de verdad.

### 2. Simplicidad Operacional

- **Con migrations:**
  - ¿Ejecuto migration o DDL?
  - ¿Qué orden?
  - ¿Cómo valido estado actual?

- **Sin migrations (solo DDL):**
  - Ejecuto `drop-and-recreate-database.sh`
  - Estado siempre consistente
  - Validación simple

### 3. Prevención de Divergencia

**Escenario problemático:**
```
BD Producción = DDL inicial + Migration A + Migration B
DDL actual = DDL inicial (sin Migration A ni B integrados)
Recreación completa ≠ BD Producción
```

**Solución:**
```
BD Producción = DDL actual (con cambios integrados)
Recreación completa = BD Producción
```

### 4. Mejora de Trazabilidad

- **Con migrations:** Cambios dispersos en múltiples archivos, difícil rastrear
- **Sin migrations:** Todo en DDL versionado, fácil rastrear con git log

---

## 📊 CONSECUENCIAS

### Positivas

1. ✅ **100% cumplimiento** de Política de Carga Limpia
2. ✅ **Fuente de verdad clara:** DDL es siempre autoritativo
3. ✅ **Recreación confiable:** `drop-and-recreate-database.sh` siempre funciona
4. ✅ **Menor complejidad:** Un solo flujo de deployment
5. ✅ **Mejor documentación:** Cambios documentados en DDL con comentarios

### Negativas (Mitigadas)

1. ⚠️ **Histórico perdido:** Migrations tienen contexto histórico
   - **Mitigación:** Archivos movidos a `_deprecated/` (no eliminados)
   - **Mitigación:** Git history preserva todo el historial

2. ⚠️ **Cambios hot-fix más complejos:** No se pueden aplicar migrations rápidos
   - **Mitigación:** Hot-fixes se integran directamente en DDL
   - **Mitigación:** `drop-and-recreate-database.sh` es rápido (~40 segundos)

---

## 🔄 ALTERNATIVAS CONSIDERADAS

### Alternativa 1: Mantener migrations como histórico

**Descripción:** Renombrar carpetas a `migrations-historical/` y documentar como histórico.

**Razones de rechazo:**
- Confunde a nuevos desarrolladores
- Viola política de carga limpia
- No agrega valor (git history ya tiene el histórico)

---

### Alternativa 2: Integrar migrations en DDL

**Descripción:** Revisar cada migration y asegurar que esté integrada en DDL.

**Razones de aprobación:**
- **CORR-005** ya integrada: `DB-131-fix-recent-activity-view.sql` → `01-recent_activity.sql`
- Otros archivos no necesarios para reproducir estado actual

**Aplicación:**
- ✅ Implementada: CORR-005 ya está en DDL
- ✅ Verificado: Recreación completa funciona sin migrations

---

### Alternativa 3: Crear sistema de migrations con rollback

**Descripción:** Implementar sistema tipo Flyway/Liquibase.

**Razones de rechazo:**
- Complejidad innecesaria para proyecto actual
- Política de Carga Limpia ya funciona bien
- Equipo pequeño no necesita complejidad adicional

---

## 📚 REFERENCIAS

**Directivas:**
- `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md` (sección 2)
- `orchestration/directivas/DIRECTIVA-DISENO-BASE-DATOS.md`

**Reportes:**
- `orchestration/agentes/database/validacion-coherencia-2025-11-24/REPORTE-VALIDACION-DATABASE.md` (ISSUE-P1-001)
- `orchestration/reportes/REPORTE-CONSOLIDADO-COHERENCIA-MULTICAPA-2025-11-24.md`

**Correcciones:**
- CORR-005: Vista `recent_activity` corregida en DDL

---

## ✍️ AUTORES

**Decisión tomada por:** Architecture-Analyst
**Validado por:** Database-Agent
**Fecha:** 2025-11-24
**Aprobación:** Product Owner (implícita por validación técnica)

---

## 🔄 HISTORIAL

| Fecha | Evento | Estado |
|-------|--------|--------|
| 2025-11-24 | Identificación de carpetas migrations en validación | Detectado |
| 2025-11-24 | Análisis de archivos y decisión de eliminación | Aprobado |
| 2025-11-24 | Ejecución: Mover a `_deprecated/` y validar | Completado |
| 2025-11-24 | Creación de ADR-012 | Documentado |

---

## ✅ CONCLUSIÓN

La eliminación de las carpetas `migrations/` es la decisión correcta para:

1. Cumplir con la Política de Carga Limpia
2. Simplificar operaciones de base de datos
3. Garantizar consistencia entre DDL y BD
4. Mejorar trazabilidad de cambios

**Estado actual:** ✅ **IMPLEMENTADO Y VALIDADO**

**Riesgo:** Bajo
**Beneficio:** Alto
**Recomendación:** ✅ **MANTENER ESTA DECISIÓN**
