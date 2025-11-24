# REPORTE DE DESALINEACIÓN - Referencias de Proyecto

**Fecha:** 2025-11-23
**Agente:** Workspace-Manager
**Tipo:** Validación de Alineación de Referencias
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa

---

## 🎯 RESUMEN EJECUTIVO

Se detectaron **múltiples referencias incorrectas** a otros proyectos en la carpeta `orchestration/`. El análisis identificó 43+ ocurrencias de referencias al proyecto **"MVP Sistema Administración de Obra e INFONAVIT"** (proyecto inmobiliario) y referencias a rutas externas del workspace inmobiliaria.

### Severidad: 🔴 **CRÍTICA**

**Impacto:**
- ❌ Documentación desalineada con el proyecto actual (GAMILIT)
- ❌ Directivas y prompts de agentes con contexto incorrecto
- ❌ Referencias a rutas externas inexistentes o incorrectas
- ❌ Ejemplos de dominio no aplicables (construcción/INFONAVIT vs gamificación educativa)
- ❌ Confusión para agentes que lean estas directivas

**Causa raíz:**
- Documentación copiada desde proyecto `workspace-erp-inmobiliaria` sin adaptación completa
- Reorganización de orchestration/ el 2025-11-23 que importó archivos base sin actualizar referencias

---

## 📊 ESTADÍSTICAS

```yaml
total_referencias_encontradas: 43+
archivos_afectados: 18
categorias_afectadas:
  - directivas: 9 archivos
  - prompts: 3 archivos
  - trazas: 2 archivos
  - reportes_agentes: 4 archivos

proyectos_referenciados_incorrectamente:
  - "MVP Sistema Administración de Obra e INFONAVIT"
  - "GLIT Platform"
  - "workspace-erp-inmobiliaria"
  - "worskpace-inmobiliaria" (typo incluido)

proyecto_correcto: "GAMILIT - Sistema de Gamificación Educativa"
```

---

## 🔍 DESALINEACIONES IDENTIFICADAS

### DES-REF-001: Directivas con Proyecto Incorrecto
**Severidad:** 🔴 Crítica
**Área:** orchestration/directivas/

#### Archivos Afectados (9):

1. **DIRECTIVA-CALIDAD-CODIGO.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`
   - Archivo: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/directivas/DIRECTIVA-CALIDAD-CODIGO.md`

2. **DIRECTIVA-CONTROL-VERSIONES.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

3. **DIRECTIVA-DISENO-BASE-DATOS.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`
   - **Adicional:** Ejemplos de schemas con dominio inmobiliario:
     - `infonavit_management`
     - `project_management` (proyectos de construcción)
     - `construction_management`
     - `purchasing_management`
   - **Acción requerida:** Reemplazar ejemplos con dominio educativo/gamificación

4. **DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`
   - **Adicional:** Ejemplo de tarea "[DB-005] Crear Módulo de Proyectos y Obras"
   - **Acción requerida:** Reemplazar con ejemplos de GAMILIT

5. **DIRECTIVA-VALIDACION-SUBAGENTES.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

6. **ESTANDARES-NOMENCLATURA.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`
   - **Adicional:** Ejemplo de schema: `infonavit_management -- INFONAVIT cumplimiento`
   - **Acción requerida:** Reemplazar con ejemplos de GAMILIT (ej: `gamification_system`, `academic_management`)

7. **GUIA-NOMENCLATURA-COMPLETA.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

8. **PROTOCOLO-ESCALAMIENTO-PO.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

9. **SISTEMA-RETROALIMENTACION-MEJORA-CONTINUA.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

**Impacto:**
- Agentes que lean estas directivas recibirán contexto incorrecto
- Ejemplos de código no aplicables al dominio educativo/gamificación
- Confusión en nomenclatura de schemas/tablas

**Acción correctiva:**
- [ ] Actualizar header de proyecto en todos los archivos
- [ ] Reemplazar ejemplos de dominio inmobiliario con ejemplos GAMILIT
- [ ] Validar que no haya otros ejemplos de dominio incorrecto

---

### DES-REF-002: Prompts de Agentes con Proyecto Incorrecto
**Severidad:** 🔴 Crítica
**Área:** orchestration/prompts/

#### Archivos Afectados (3):

1. **PROMPT-REQUIREMENTS-ANALYST.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Línea 151: `**Fuente principal:** /home/isem/workspace/worskpace-inmobiliaria/docs/00-overview/MVP-APP.md`
   - **CRÍTICO:** Referencia a ruta externa de otro proyecto
   - Debe ser:
     - Header: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`
     - Fuente: `docs/00-overview/` o documentación GAMILIT apropiada

2. **PROMPT-AGENTES-PRINCIPALES-OLD.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Referencia: `**Documento maestro:** /home/isem/workspace/worskpace-inmobiliaria/docs/00-overview/MVP-APP.md`
   - **CRÍTICO:** Referencia a ruta externa de otro proyecto
   - **Nota:** Archivo marcado como OLD, podría archivarse

3. **PROMPT-SUBAGENTES.md**
   - Línea header: `**Proyecto:** MVP Sistema Administración de Obra e INFONAVIT`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

**Impacto:**
- Requirements-Analyst buscará documentación en rutas incorrectas
- Agentes leerán contexto de proyecto incorrecto
- Decisiones de diseño basadas en dominio erróneo

**Acción correctiva:**
- [ ] Actualizar PROMPT-REQUIREMENTS-ANALYST.md con rutas GAMILIT
- [ ] Archivar PROMPT-AGENTES-PRINCIPALES-OLD.md (marcado como obsoleto)
- [ ] Actualizar PROMPT-SUBAGENTES.md con proyecto correcto

---

### DES-REF-003: Referencias a "GLIT Platform"
**Severidad:** 🟡 Media
**Área:** orchestration/agentes/backend/subagentes/

#### Archivo Afectado:

1. **SA-BACKEND-005-docs-vs-codigo.md**
   - Línea 3: `**Proyecto:** GLIT Platform`
   - Debe ser: `**Proyecto:** GAMILIT - Sistema de Gamificación Educativa`

**Impacto:**
- Desalineación menor en documentación de subagente
- Posible confusión de nomenclatura

**Acción correctiva:**
- [ ] Actualizar referencia a proyecto correcto

---

### DES-REF-004: Referencias a Proyecto Inmobiliaria en Documentación Histórica
**Severidad:** 🟢 Baja (Informativo)
**Área:** orchestration/README.md, orchestration/trazas/, orchestration/agentes/workspace-manager/

#### Archivos Afectados (contexto histórico):

1. **orchestration/README.md**
   - Referencia: `Sistema Inmobiliaria (referencia): /home/isem/workspace/worskpace-inmobiliaria/orchestration`
   - Contexto: Documentación de reorganización, menciona fuente
   - **Estado:** ✅ Aceptable (contexto histórico)

2. **TRAZA-ANALISIS-ARQUITECTURA.md**
   - Referencia: Análisis del proyecto `workspace-erp-inmobiliaria`
   - Contexto: Análisis de mejores prácticas heredadas
   - **Estado:** ✅ Aceptable (contexto de aprendizaje)

3. **orchestration/agentes/workspace-manager/reorganization-analysis/**
   - Múltiples archivos documentan reorganización basada en inmobiliaria
   - Contexto: Trazabilidad de decisión de reorganización
   - **Estado:** ✅ Aceptable (documentación histórica)

4. **orchestration/agentes/workspace-manager/gitignore-analysis-20251123/REPORTE-VALIDACION-WORKSPACE-INMOBILIARIA.md**
   - Archivo de reporte de otro proyecto
   - **Estado:** ⚠️ Revisar si debe estar en este workspace

**Impacto:**
- Bajo, son referencias históricas/contextuales

**Acción correctiva:**
- [ ] Validar si REPORTE-VALIDACION-WORKSPACE-INMOBILIARIA.md debe estar aquí
- [ ] Considerar archivar análisis de reorganización si ya no es relevante

---

### DES-REF-005: Referencias a Rutas Externas
**Severidad:** 🔴 Crítica
**Tipo:** Rutas hardcoded a otro workspace

#### Referencias Encontradas:

1. **Ruta:** `/home/isem/workspace/worskpace-inmobiliaria/docs/00-overview/MVP-APP.md`
   - **Aparece en:**
     - PROMPT-REQUIREMENTS-ANALYST.md (línea 151)
     - PROMPT-AGENTES-PRINCIPALES-OLD.md
   - **Problema:** Ruta absoluta a otro proyecto, no portable
   - **Typo detectado:** "worskpace" (debe ser "workspace")

2. **Ruta:** `/home/isem/workspace/worskpace-inmobiliaria/orchestration`
   - **Aparece en:**
     - orchestration/README.md
   - **Contexto:** Referencia histórica a fuente de reorganización

**Impacto:**
- Agentes no podrán acceder a documentación referenciada
- Rutas no portables entre entornos
- Dependencia externa no documentada

**Acción correctiva:**
- [ ] Eliminar o reemplazar rutas externas en prompts activos
- [ ] Documentar si hay dependencias reales con proyecto inmobiliaria
- [ ] Archivar archivos OLD que referencian rutas externas

---

## 📋 PLAN DE ACCIÓN

### Prioridad P0 - Inmediata (Hoy)

#### 1. Actualizar Headers de Proyecto en Directivas (9 archivos)
```bash
# Archivos a actualizar:
- DIRECTIVA-CALIDAD-CODIGO.md
- DIRECTIVA-CONTROL-VERSIONES.md
- DIRECTIVA-DISENO-BASE-DATOS.md
- DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- DIRECTIVA-VALIDACION-SUBAGENTES.md
- ESTANDARES-NOMENCLATURA.md
- GUIA-NOMENCLATURA-COMPLETA.md
- PROTOCOLO-ESCALAMIENTO-PO.md
- SISTEMA-RETROALIMENTACION-MEJORA-CONTINUA.md

# Cambio:
Buscar: **Proyecto:** MVP Sistema Administración de Obra e INFONAVIT
Reemplazar: **Proyecto:** GAMILIT - Sistema de Gamificación Educativa
```

**Responsable:** Workspace-Manager (puedo ejecutar con aprobación)
**Estimación:** 15 minutos
**Método:** Edición masiva con sed o edición individual

#### 2. Actualizar Prompts de Agentes (2 archivos activos)
```bash
# Archivos a actualizar:
- PROMPT-REQUIREMENTS-ANALYST.md
- PROMPT-SUBAGENTES.md

# Cambios:
1. Actualizar header de proyecto
2. CRÍTICO en PROMPT-REQUIREMENTS-ANALYST.md:
   - Eliminar o reemplazar ruta externa línea 151
   - Definir fuente correcta de documentación GAMILIT
```

**Responsable:** Workspace-Manager + Requirements-Analyst (validación)
**Estimación:** 20 minutos
**Requiere:** Definir ruta correcta de documentación maestro GAMILIT

#### 3. Archivar Archivo Obsoleto
```bash
# Archivo:
- PROMPT-AGENTES-PRINCIPALES-OLD.md (ya marcado como OLD)

# Acción:
mv orchestration/prompts/PROMPT-AGENTES-PRINCIPALES-OLD.md \
   orchestration/.archive/prompts-obsoletos/
```

**Responsable:** Workspace-Manager
**Estimación:** 2 minutos

---

### Prioridad P1 - Corto Plazo (Esta Semana)

#### 4. Reemplazar Ejemplos de Dominio Inmobiliario

**Archivos:**
- DIRECTIVA-DISENO-BASE-DATOS.md
- DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md
- ESTANDARES-NOMENCLATURA.md

**Ejemplos a reemplazar:**

| Actual (Inmobiliaria) | Reemplazar con (GAMILIT) |
|---|---|
| `infonavit_management` | `gamification_system` |
| `project_management` | `academic_management` |
| `construction_management` | `exercise_management` |
| `purchasing_management` | `reward_management` |
| `quality_management` | `progress_tracking` |
| "Módulo de Proyectos y Obras" | "Módulo de Ejercicios y Desafíos" |
| "[DB-005] Crear Módulo de Proyectos" | "[DB-XXX] Crear Módulo de Gamificación" |

**Responsable:** Architecture-Analyst (diseño) + Workspace-Manager (actualización)
**Estimación:** 1-2 horas

#### 5. Actualizar SA-BACKEND-005
```bash
# Archivo:
- agentes/backend/subagentes/SA-BACKEND-005-docs-vs-codigo.md

# Cambio:
Línea 3: **Proyecto:** GLIT Platform
Reemplazar: **Proyecto:** GAMILIT - Sistema de Gamificación Educativa
```

**Responsable:** Backend-Agent o Workspace-Manager
**Estimación:** 2 minutos

---

### Prioridad P2 - Mediano Plazo (Próximas 2 Semanas)

#### 6. Revisar y Limpiar Referencias Históricas

**Archivos a revisar:**
- `orchestration/agentes/workspace-manager/gitignore-analysis-20251123/REPORTE-VALIDACION-WORKSPACE-INMOBILIARIA.md`
  - ¿Debe estar en este workspace?
  - Si no, mover a .archive/

- `orchestration/agentes/workspace-manager/reorganization-analysis/`
  - Documentación de reorganización ya completada
  - Considerar archivar si ya no es referencia activa

**Responsable:** Workspace-Manager
**Estimación:** 30 minutos

#### 7. Validación Post-Corrección

**Actividades:**
```bash
# 1. Buscar referencias residuales
grep -r "MVP Sistema Administración de Obra\|INFONAVIT\|inmobiliaria" \
  orchestration/ --include="*.md" --exclude-dir=".archive"

# 2. Validar ejemplos de dominio
grep -r "infonavit_management\|construction_management\|project_management" \
  orchestration/directivas/ --include="*.md"

# 3. Buscar rutas externas
grep -r "worskpace-inmobiliaria\|workspace-erp-inmobiliaria" \
  orchestration/ --include="*.md" --exclude-dir=".archive"

# 4. Validar consistencia de headers
grep -r "^\*\*Proyecto:\*\*" orchestration/ --include="*.md" | \
  grep -v "GAMILIT"
```

**Responsable:** Workspace-Manager + Policy-Auditor
**Estimación:** 45 minutos

---

## ✅ CHECKLIST DE CORRECCIÓN

### Directivas (9 archivos)
- [ ] DIRECTIVA-CALIDAD-CODIGO.md - Actualizar header
- [ ] DIRECTIVA-CONTROL-VERSIONES.md - Actualizar header
- [ ] DIRECTIVA-DISENO-BASE-DATOS.md - Actualizar header + ejemplos
- [ ] DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md - Actualizar header + ejemplos
- [ ] DIRECTIVA-VALIDACION-SUBAGENTES.md - Actualizar header
- [ ] ESTANDARES-NOMENCLATURA.md - Actualizar header + ejemplos
- [ ] GUIA-NOMENCLATURA-COMPLETA.md - Actualizar header
- [ ] PROTOCOLO-ESCALAMIENTO-PO.md - Actualizar header
- [ ] SISTEMA-RETROALIMENTACION-MEJORA-CONTINUA.md - Actualizar header

### Prompts (3 archivos)
- [ ] PROMPT-REQUIREMENTS-ANALYST.md - Actualizar header + eliminar ruta externa
- [ ] PROMPT-SUBAGENTES.md - Actualizar header
- [ ] PROMPT-AGENTES-PRINCIPALES-OLD.md - Archivar

### Agentes (1 archivo)
- [ ] SA-BACKEND-005-docs-vs-codigo.md - Actualizar "GLIT Platform"

### Validación Final
- [ ] Ejecutar búsquedas de referencias residuales
- [ ] Validar ejemplos de dominio reemplazados
- [ ] Confirmar no hay rutas externas activas
- [ ] Actualizar TRAZA-WORKSPACE-MANAGEMENT.md

---

## 📊 MÉTRICAS DE CORRECCIÓN

```yaml
archivos_totales_afectados: 18
archivos_criticos: 12
archivos_informativos: 6

esfuerzo_estimado:
  P0_inmediato: "40 minutos"
  P1_corto_plazo: "2-3 horas"
  P2_mediano_plazo: "1-2 horas"
  total: "4-6 horas"

beneficio:
  - Documentación alineada 100% con GAMILIT
  - Ejemplos de dominio correctos
  - No más referencias externas
  - Agentes con contexto correcto
  - Trazabilidad mejorada
```

---

## 🔧 COMANDO RÁPIDO DE CORRECCIÓN (P0)

### Actualización Masiva de Headers

```bash
# ⚠️ EJECUTAR CON PRECAUCIÓN - Crear backup primero

# Backup
tar -czf orchestration-backup-$(date +%Y%m%d-%H%M%S).tar.gz orchestration/

# Actualizar directivas (9 archivos)
for file in orchestration/directivas/*.md; do
  sed -i 's/\*\*Proyecto:\*\* MVP Sistema Administración de Obra e INFONAVIT/**Proyecto:** GAMILIT - Sistema de Gamificación Educativa/g' "$file"
done

# Actualizar prompts (manualmente por rutas externas)
# PROMPT-REQUIREMENTS-ANALYST.md requiere revisión manual línea 151
# PROMPT-SUBAGENTES.md
sed -i 's/\*\*Proyecto:\*\* MVP Sistema Administración de Obra e INFONAVIT/**Proyecto:** GAMILIT - Sistema de Gamificación Educativa/g' \
  orchestration/prompts/PROMPT-SUBAGENTES.md

# Actualizar SA-BACKEND-005
sed -i 's/\*\*Proyecto:\*\* GLIT Platform/**Proyecto:** GAMILIT - Sistema de Gamificación Educativa/g' \
  orchestration/agentes/backend/subagentes/SA-BACKEND-005-docs-vs-codigo.md

# Validar
grep -r "MVP Sistema Administración de Obra" orchestration/ --include="*.md"
```

---

## 📝 NOTAS IMPORTANTES

1. **PROMPT-REQUIREMENTS-ANALYST.md requiere atención especial:**
   - Línea 151 tiene ruta externa hardcoded
   - Necesita definirse cuál es la documentación maestro de GAMILIT
   - Posibles opciones:
     - `docs/00-overview/` (si existe)
     - `README.md` del proyecto
     - Documentación en orchestration/

2. **Ejemplos de dominio:**
   - Reemplazar con ejemplos reales de GAMILIT
   - Consultar con Architecture-Analyst sobre schemas existentes
   - Usar ejemplos de `apps/database/ddl/schemas/` como referencia

3. **Archivos históricos:**
   - No eliminar documentación de trazabilidad
   - Mantener análisis de reorganización en .archive/ si ya no es relevante
   - Preservar aprendizajes del proyecto inmobiliaria

4. **Typo detectado:**
   - "worskpace-inmobiliaria" (debe ser "workspace")
   - Corregir en referencias históricas si se mantienen

---

## 🎯 RESULTADO ESPERADO

Después de ejecutar este plan de acción:

✅ **0** referencias a "MVP Sistema Administración de Obra e INFONAVIT"
✅ **0** rutas externas hardcoded a otros workspaces
✅ **100%** de headers con proyecto correcto
✅ Ejemplos de dominio alineados con GAMILIT
✅ Documentación consistente y trazable

---

**Generado por:** Workspace-Manager
**Fecha:** 2025-11-23
**Versión:** 1.0.0
**Próxima revisión:** Después de implementar correcciones P0+P1
