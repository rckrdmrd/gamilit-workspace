# SIMCO: VALIDAR

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente antes de marcar una tarea como completada
**Prioridad:** OBLIGATORIA - NO SE PUEDE OMITIR

---

## RESUMEN EJECUTIVO

> **NINGUNA tarea se marca como completada sin pasar TODAS las validaciones.**
> **Si una validación falla, la tarea NO está completa.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  BUILD PASA + LINT PASA + TESTS PASAN = TAREA PUEDE COMPLETARSE     ║
║  CUALQUIER FALLO = TAREA NO COMPLETADA                               ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CHECKLIST UNIVERSAL DE VALIDACIÓN

```
VALIDACIONES TÉCNICAS (OBLIGATORIAS)
├── [ ] 1. Build compila sin errores
├── [ ] 2. Lint pasa sin errores críticos
├── [ ] 3. Tests pasan (si existen)
└── [ ] 4. Aplicación inicia correctamente

VALIDACIONES DE COHERENCIA
├── [ ] 5. Código alineado con documentación
├── [ ] 6. Sin duplicados creados
├── [ ] 7. Convenciones seguidas
└── [ ] 8. Inventarios actualizados

VALIDACIONES DE INTEGRACIÓN
├── [ ] 9. Coherencia entre capas (DB↔BE↔FE)
└── [ ] 10. APIs funcionan correctamente
```

---

## VALIDACIONES POR CAPA

> **Definiciones canónicas disponibles:**
> - @DEF_VAL_BE → `_definitions/validations/VALIDATION-BACKEND.md`
> - @DEF_VAL_FE → `_definitions/validations/VALIDATION-FRONTEND.md`
> - @DEF_VAL_DDL → `_definitions/validations/VALIDATION-DDL.md`
> - @DEF_VAL_DEVOPS → `_definitions/validations/VALIDATION-DEVOPS.md`

### Database (DDL)

> **Definición canónica:** @DEF_VAL_DDL

**Comando obligatorio:**
```bash
# Carga limpia COMPLETA
cd @DB_SCRIPTS
./{RECREATE_CMD}
```

**Criterios de éxito:**
```
✅ Script ejecuta sin errores
✅ Todas las tablas se crean
✅ Todos los índices se crean
✅ Constraints se aplican
✅ Seeds se cargan (si existen)
✅ Integridad referencial OK
```

**Verificación post-creación:**
```bash
# Verificar tablas
psql -d {DB_NAME} -c "\dt {schema}.*"

# Verificar índices
psql -d {DB_NAME} -c "\di {schema}.*"

# Verificar estructura
psql -d {DB_NAME} -c "\d {schema}.{tabla}"

# Test de insert
psql -d {DB_NAME} -c "INSERT INTO {schema}.{tabla} (...) VALUES (...);"
```

**Si falla:**
```
🛑 NO marcar como completada
1. Identificar error en DDL
2. Corregir archivo DDL (NO fix manual en BD)
3. Re-ejecutar carga limpia
4. Solo entonces continuar
```

---

### Backend (NestJS/TypeScript)

> **Definición canónica:** @DEF_VAL_BE

**Comandos obligatorios:**
```bash
cd @BACKEND_ROOT

# 1. Build (OBLIGATORIO)
npm run build
# ✅ Debe completar sin errores

# 2. Lint (OBLIGATORIO)
npm run lint
# ✅ Debe pasar o corregir errores

# 3. Tests (si existen)
npm run test
# ✅ Deben pasar

# 4. Iniciar aplicación
npm run start:dev
# ✅ Debe iniciar sin errores de runtime
```

**Criterios de éxito:**
```
✅ TypeScript compila sin errores
✅ ESLint sin errores (warnings aceptables)
✅ Tests unitarios pasan
✅ Aplicación inicia
✅ Endpoints responden
```

**Verificación de endpoints:**
```bash
# Verificar health
curl http://localhost:3000/api/health

# Verificar endpoint creado
curl http://localhost:3000/api/{recurso}

# Verificar Swagger
curl http://localhost:3000/api/docs
```

**Si falla:**
```
🛑 NO marcar como completada
1. Revisar errores de TypeScript
2. Corregir código
3. Re-ejecutar build + lint
4. Solo entonces continuar
```

---

### Frontend (React/TypeScript)

> **Definición canónica:** @DEF_VAL_FE

**Comandos obligatorios:**
```bash
cd @FRONTEND_ROOT

# 1. Build (OBLIGATORIO)
npm run build
# ✅ Debe completar sin errores

# 2. Lint (OBLIGATORIO)
npm run lint
# ✅ Debe pasar o corregir errores

# 3. Type check
npm run typecheck  # o tsc --noEmit
# ✅ Debe pasar

# 4. Iniciar aplicación
npm run dev
# ✅ Debe iniciar sin errores
```

**Criterios de éxito:**
```
✅ TypeScript compila sin errores
✅ ESLint sin errores críticos
✅ Aplicación renderiza correctamente
✅ Sin errores en consola del navegador
✅ Componentes funcionan según diseño
```

**Si falla:**
```
🛑 NO marcar como completada
1. Revisar errores de TypeScript/React
2. Corregir código
3. Re-ejecutar build + lint
4. Solo entonces continuar
```

---

## VALIDACIÓN DE COHERENCIA

### Coherencia Documentación ↔ Código

**Verificar:**
```markdown
- [ ] Lo implementado coincide con docs/
- [ ] No hay features documentadas sin implementar
- [ ] No hay código sin documentación correspondiente
- [ ] ADRs actualizados si hay decisiones nuevas
```

### Coherencia Entre Capas (3-Tier)

**Database ↔ Backend:**
```markdown
- [ ] Entity mapea correctamente a tabla
- [ ] Tipos de columnas coinciden
- [ ] Relaciones (FK) correctas
- [ ] Nombres de campos alineados
```

**Backend ↔ Frontend:**
```markdown
- [ ] DTOs coinciden con types del frontend
- [ ] Endpoints documentados en Swagger
- [ ] Respuestas API coinciden con interfaces FE
- [ ] Errores manejados consistentemente
```

### Anti-Duplicación

**Verificar después de crear:**
```bash
# Buscar objetos con nombre similar
grep -rn "{nombre}" @INVENTORY

# No debe haber entradas duplicadas
# Si hay duplicados → ERROR → Corregir
```

---

## MATRIZ DE VALIDACIONES POR TIPO DE TAREA

| Tipo de Tarea | Build | Lint | Tests | Carga Limpia | Coherencia 3-Tier |
|---------------|-------|------|-------|--------------|-------------------|
| Nueva tabla | - | - | - | ✅ OBLIGATORIO | ✅ |
| Nueva entity | ✅ BE | ✅ BE | ✅ BE | - | ✅ |
| Nuevo service | ✅ BE | ✅ BE | ✅ BE | - | - |
| Nuevo controller | ✅ BE | ✅ BE | ✅ BE | - | ✅ |
| Nuevo componente | ✅ FE | ✅ FE | ✅ FE | - | ✅ |
| Nueva página | ✅ FE | ✅ FE | ✅ FE | - | ✅ |
| Bug fix | ✅ Afectado | ✅ Afectado | ✅ Afectado | Si DDL | - |
| Refactor | ✅ TODO | ✅ TODO | ✅ TODO | Si DDL | ✅ |

---

## PROTOCOLO DE FALLA

### Si Build Falla

```markdown
## ❌ Build Fallido

**Error:**
{copiar error completo}

**Archivo(s) afectado(s):**
- {lista de archivos}

**Análisis:**
{descripción del problema}

**Acción:**
1. Corregir {archivo} línea {N}
2. Re-ejecutar build
3. Continuar solo si pasa
```

### Si Lint Falla (Errores Críticos)

```markdown
## ❌ Lint Fallido

**Errores críticos:**
{lista de errores}

**Acción:**
1. Corregir cada error
2. Re-ejecutar lint
3. Warnings son aceptables
4. Errores NO son aceptables
```

### Si Tests Fallan

```markdown
## ❌ Tests Fallidos

**Tests que fallan:**
- {test 1}: {razón}
- {test 2}: {razón}

**Acción:**
1. Analizar si es error de código o de test
2. Si error de código → Corregir código
3. Si test desactualizado → Actualizar test
4. Re-ejecutar tests
```

### Si Carga Limpia Falla

```markdown
## ❌ Carga Limpia Fallida

**Error:**
{error de PostgreSQL}

**Archivo DDL problemático:**
{archivo.sql}

**Acción:**
1. NO ejecutar fix manual en BD
2. Corregir archivo DDL
3. Re-ejecutar carga limpia completa
4. Repetir hasta éxito
```

---

## REPORTE DE VALIDACIÓN

**Incluir en cada entrega:**

```markdown
## Validaciones Ejecutadas

### Build
- Backend: ✅ Pasa | ❌ Falla
- Frontend: ✅ Pasa | ❌ Falla | ⏭️ N/A

### Lint
- Backend: ✅ Pasa | ❌ Falla
- Frontend: ✅ Pasa | ❌ Falla | ⏭️ N/A

### Tests
- Backend: ✅ Pasa | ❌ Falla | ⏭️ N/A
- Frontend: ✅ Pasa | ❌ Falla | ⏭️ N/A

### Carga Limpia (DDL)
- Database: ✅ Pasa | ❌ Falla | ⏭️ N/A

### Coherencia
- Docs ↔ Código: ✅ OK | ❌ Discrepancia
- DB ↔ BE: ✅ OK | ❌ Discrepancia | ⏭️ N/A
- BE ↔ FE: ✅ OK | ❌ Discrepancia | ⏭️ N/A

### Estado Final
✅ TODAS LAS VALIDACIONES PASAN → Tarea completable
❌ ALGUNA VALIDACIÓN FALLA → Tarea NO completable
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Reportar sin validar | Prisa por entregar | SIEMPRE ejecutar validaciones |
| Fix manual en BD | Carga limpia falla | Corregir DDL, no BD directamente |
| Ignorar warnings de lint | Parecer inofensivos | Revisar si son errores disfrazados |
| Saltar tests | "No hay tiempo" | Tests son OBLIGATORIOS |
| No verificar coherencia | Asumir que está bien | Verificar SIEMPRE entre capas |

---

## REFERENCIAS

- **Ciclo de vida de tareas:** @CAPVED (PRINCIPIO-CAPVED.md) - Fase V y E
- **Punto de entrada HU:** @TAREA (SIMCO-TAREA.md)
- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Documentar:** @DOCUMENTAR (SIMCO-DOCUMENTAR.md)
- **Directiva completa de validación:** @DIRECTIVAS/PROCESO-VALIDACION.md

---

**Versión:** 1.1.0 | **Sistema:** SIMCO + CAPVED | **Mantenido por:** Tech Lead
