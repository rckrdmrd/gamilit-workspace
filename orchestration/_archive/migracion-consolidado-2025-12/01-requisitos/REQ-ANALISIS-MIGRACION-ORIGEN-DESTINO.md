# Análisis de Requerimientos: Migración ORIGEN → DESTINO

**Fecha:** 2025-12-18
**Analista:** Requirements-Analyst
**Proyecto:** GAMILIT

---

## 1. IDENTIFICACIÓN DE WORKSPACES

| Aspecto | ORIGEN (Viejo) | DESTINO (Nuevo) |
|---------|----------------|-----------------|
| **Path** | `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit` | `/home/isem/workspace/projects/gamilit` |
| **Propósito** | Producción/Desarrollo activo | Desarrollo nuevo |
| **Prioridad** | Contiene desarrollos más recientes | Destino de migración |

---

## 2. RESUMEN EJECUTIVO DE DIFERENCIAS

### 2.1 Estadísticas Generales

| Componente | ORIGEN | DESTINO | Diferencia |
|------------|--------|---------|------------|
| Backend (.ts) | 845 archivos | 845 archivos | **IDÉNTICO** |
| Frontend (.ts/.tsx) | 935 archivos | 917 archivos | **+18 en ORIGEN** |
| Database (.sql) | 562 archivos | 562 archivos | **IDÉNTICO** |
| Docs (.md) | 431 archivos | 435 archivos | **+4 en DESTINO** |

### 2.2 Archivos Críticos Raíz

| Archivo | Estado |
|---------|--------|
| `package.json` | IDÉNTICO |
| `package-lock.json` | IDÉNTICO |
| `ecosystem.config.js` | IDÉNTICO |
| `tsconfig.json` | IDÉNTICO |
| `README.md` | IDÉNTICO |

---

## 3. DETALLE DE DIFERENCIAS

### 3.1 Frontend - 18 Archivos SOLO en ORIGEN

**Mecánicas Auxiliares:**
```
features/mechanics/auxiliar/CallToAction/
├── callToActionMockData.ts
├── callToActionSchemas.ts
└── callToActionTypes.ts

features/mechanics/auxiliar/CollagePrensa/
├── collagePrensaMockData.ts
├── collagePrensaSchemas.ts
└── collagePrensaTypes.ts

features/mechanics/auxiliar/ComprensiónAuditiva/
├── comprensionAuditivaMockData.ts
├── comprensionAuditivaSchemas.ts
└── comprensionAuditivaTypes.ts

features/mechanics/auxiliar/TextoEnMovimiento/
├── textoEnMovimientoMockData.ts
├── textoEnMovimientoSchemas.ts
└── textoEnMovimientoTypes.ts
```

**Módulo 2 - Mecánicas:**
```
features/mechanics/module2/ConstruccionHipotesis/
├── causaEfectoMockData.ts
└── causaEfectoSchemas.ts

features/mechanics/module2/LecturaInferencial/
├── lecturaInferencialMockData.ts
└── lecturaInferencialSchemas.ts

features/mechanics/module2/PrediccionNarrativa/
└── prediccionNarrativaSchemas.ts

features/mechanics/module2/PuzzleContexto/
└── puzzleContextoSchemas.ts
```

### 3.2 Database Seeds - Diferencias de Estructura

**Directorios con diferencias:**
- `dev/auth_management/`
- `dev/educational_content/`
- `dev/notifications/`
- `prod/auth/`
- `prod/auth_management/`

### 3.3 Documentación - Archivos SOLO en DESTINO

**En docs/90-transversal/arquitectura/especificaciones/:**
```
ET-WS-001-websocket.md
ET-TSK-001-cron-jobs.md
ET-HLT-001-health-checks.md
ET-AUD-001-sistema-auditoria.md
```

### 3.4 Orchestration - Directorios SOLO en DESTINO

```
analisis-migracion-2025-12-18/
analisis-homologacion-database-2025-12-18/
analisis-backend-2025-12-18/
analisis-frontend-validacion/
reportes/
```

---

## 4. PLAN DE MIGRACIÓN PROPUESTO

### FASE 1: Frontend (PRIORIDAD ALTA)
**Acción:** Copiar 18 archivos faltantes de mecánicas

```bash
# Ejecutar desde workspace raíz
ORIGEN="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit"
DESTINO="/home/isem/workspace/projects/gamilit"

# Copiar mecánicas auxiliares
rsync -av "$ORIGEN/apps/frontend/src/features/mechanics/auxiliar/" \
          "$DESTINO/apps/frontend/src/features/mechanics/auxiliar/"

# Copiar mecánicas módulo 2 faltantes
rsync -av "$ORIGEN/apps/frontend/src/features/mechanics/module2/" \
          "$DESTINO/apps/frontend/src/features/mechanics/module2/"
```

### FASE 2: Database Seeds (PRIORIDAD MEDIA)
**Acción:** Sincronizar seeds (revisar cambios antes)

```bash
# Revisar diferencias primero
diff -rq "$ORIGEN/apps/database/seeds/" "$DESTINO/apps/database/seeds/"

# Sincronizar si es apropiado
rsync -av "$ORIGEN/apps/database/seeds/" "$DESTINO/apps/database/seeds/"
```

### FASE 3: Documentación (DECISIÓN REQUERIDA)
**Opciones:**

| Opción | Descripción | Recomendación |
|--------|-------------|---------------|
| A | Mantener docs del DESTINO (más completo) | **RECOMENDADO** |
| B | Sobrescribir con ORIGEN | No recomendado |
| C | Merge manual selectivo | Si hay conflictos |

### FASE 4: Orchestration (DECISIÓN REQUERIDA)
**Los siguientes directorios existen SOLO en DESTINO:**

- `analisis-migracion-2025-12-18/`
- `analisis-homologacion-database-2025-12-18/`
- `analisis-backend-2025-12-18/`
- `analisis-frontend-validacion/`
- `reportes/`

**Recomendación:** MANTENER estos análisis en el destino (son documentación de auditoría).

---

## 5. VALIDACIONES POST-MIGRACIÓN

```bash
# 1. Verificar build frontend
cd $DESTINO/apps/frontend && npm run build

# 2. Verificar build backend
cd $DESTINO/apps/backend && npm run build

# 3. Ejecutar tests
cd $DESTINO && npm run test

# 4. Validar API contract
npm run validate:api-contract

# 5. Verificar seeds cargando BD
cd $DESTINO/apps/database && ./drop-and-recreate-database.sh
```

---

## 6. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflictos en seeds | Media | Alto | Revisar diff antes de merge |
| Pérdida de docs del destino | Baja | Medio | Backup previo |
| Build failures post-migración | Media | Alto | Tests antes de commit |

---

## 7. RECOMENDACIONES FINALES

1. **Crear backup del DESTINO antes de migrar**
2. **Priorizar FASE 1** (18 archivos frontend críticos)
3. **Mantener documentación del DESTINO** (más completa)
4. **Validar builds después de cada fase**
5. **Commit después de cada fase exitosa**

---

*Generado por Requirements-Analyst | SIMCO v1.4.0*
