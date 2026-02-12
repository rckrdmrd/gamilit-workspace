# SIMCO-PRE-POST-VALIDATION.md

**Sistema:** SIMCO v4.0.0
**Version:** 1.0.0
**Fecha:** 2026-01-24
**Mejora:** M-008 del Plan de Integracion

---

## 1. Proposito

Esta directiva establece las fases de validacion PRE y POST para toda tarea.
Las validaciones se ejecutan automaticamente en puntos clave del ciclo CAPVED.

---

## 2. Arquitectura de Validacion

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CICLO CAPVED CON VALIDACIONES                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [C] Contexto                                                       │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────┐                                       │
│  │ PRE-VALIDATION          │  ← Antes de analizar                  │
│  │ • Documentation-Valid.  │                                       │
│  │ • Context-Validator     │                                       │
│  └─────────────────────────┘                                       │
│       │                                                             │
│       ▼                                                             │
│  [A] Analisis → [P] Plan → [V] Validacion Gate                     │
│       │                                                             │
│       ▼                                                             │
│  [E] Ejecucion                                                      │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────┐                                       │
│  │ POST-VALIDATION         │  ← Despues de ejecutar                │
│  │ • Code-Validator        │                                       │
│  │ • Database-Auditor      │                                       │
│  │ • Integration-Validator │                                       │
│  │ • Placeholder-Checker   │  ← INT-001: validate-no-placeholders  │
│  └─────────────────────────┘                                       │
│       │                                                             │
│       ▼                                                             │
│  [D] Documentacion                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Validadores PRE (Antes de Ejecucion)

### 3.1 Documentation-Validator

**Cuando:** Al inicio de FASE C (Contexto)
**Proposito:** Verificar que la documentacion necesaria existe y es valida.

**Checklist:**
```
□ PROJECT-CONTEXT.md existe y es reciente (<30 dias)
□ Inventarios del dominio existen
□ PROXIMA-ACCION.md refleja estado actual
□ No hay tareas bloqueadas sin resolver
```

**Comando:**
```bash
# Verificar existencia de archivos criticos
ls -la projects/{proyecto}/orchestration/00-guidelines/PROJECT-CONTEXT.md
ls -la projects/{proyecto}/orchestration/inventarios/MASTER_INVENTORY.yml
```

### 3.2 Context-Validator

**Cuando:** Antes de FASE A (Analisis)
**Proposito:** Verificar que el contexto cargado es correcto para la tarea.

**Checklist:**
```
□ Proyecto correcto identificado
□ Dominio correcto cargado (DDL/Backend/Frontend)
□ Presupuesto de tokens respetado
□ No hay contexto obsoleto cargado
```

---

## 4. Validadores POST (Despues de Ejecucion)

### 4.1 Code-Validator

**Cuando:** Despues de FASE E (Ejecucion) con cambios de codigo
**Proposito:** Verificar calidad del codigo generado/modificado.

**Checklist:**
```
□ Build pasa sin errores
□ Lint pasa sin errores
□ Tests existentes pasan
□ Tipos correctos (TypeScript)
```

**Comandos:**
```bash
# Backend (NestJS)
cd projects/{proyecto}/backend
npm run build
npm run lint
npm run test

# Frontend (React)
cd projects/{proyecto}/frontend
npm run build
npm run lint
npm run typecheck
```

### 4.2 Placeholder-Checker (INT-001)

**Cuando:** Despues de CUALQUIER edicion de codigo
**Proposito:** Detectar placeholders prohibidos que destruyen codigo.

**Script:** `@VALIDAR-PLACEHOLDERS` (scripts/validation/validate-no-placeholders.sh)

**Uso:**
```bash
# Verificar archivo especifico
./scripts/validation/validate-no-placeholders.sh archivo.ts

# Verificar todos los archivos modificados
git diff --name-only | xargs -I {} ./scripts/validation/validate-no-placeholders.sh {}
```

**Patrones Detectados:**
```
// ... resto del código
// ... existing code ...
/* ... */
// TODO: implementar (sin implementacion)
// [código anterior]
```

**Si falla:** BLOQUEAR commit hasta corregir.

### 4.3 Database-Auditor

**Cuando:** Despues de FASE E con cambios DDL
**Proposito:** Verificar coherencia de cambios de base de datos.

**Checklist:**
```
□ DDL ejecuta sin errores
□ Coherencia con entities existentes
□ Constraints validos
□ Indices apropiados
□ No hay datos perdidos
```

**Comandos:**
```bash
# Ejecutar DDL en BD de prueba
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database}_test -f '/mnt/c/path/to/ddl.sql'

# Verificar schema
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database} -c "\d+ {table}"
```

### 4.4 Integration-Validator

**Cuando:** Despues de merge o cambios multi-capa
**Proposito:** Verificar integracion entre capas.

**Checklist:**
```
□ DDL ↔ Entity coherentes
□ Entity ↔ DTO coherentes
□ Endpoints documentados
□ Frontend consume endpoints correctamente
□ No hay referencias rotas
```

**Referencia:** `@TRIGGER_COHERENCIA` - orchestration/directivas/triggers/TRIGGER-COHERENCIA-CAPAS.md

---

## 5. Matriz de Validacion por Tipo de Tarea

| Tipo Tarea | PRE Validators | POST Validators |
|------------|----------------|-----------------|
| DDL | Doc, Context | Code, DB-Auditor, Placeholder |
| Backend | Doc, Context | Code, Integration, Placeholder |
| Frontend | Doc, Context | Code, Placeholder |
| Docs | Doc | - |
| Bug Fix | Doc, Context | Code, Placeholder |
| Refactor | Doc, Context | Code, Integration, Placeholder |

---

## 6. Flujo de Validacion

### 6.1 Validacion Exitosa

```
PRE-VALIDATION
     │
     ├── Documentation-Validator: ✓ PASS
     ├── Context-Validator: ✓ PASS
     │
     ▼
EJECUCION
     │
     ▼
POST-VALIDATION
     │
     ├── Code-Validator: ✓ PASS
     ├── Placeholder-Checker: ✓ PASS
     ├── Database-Auditor: ✓ PASS (si aplica)
     ├── Integration-Validator: ✓ PASS (si aplica)
     │
     ▼
DOCUMENTACION → COMPLETADA
```

### 6.2 Validacion Fallida

```
POST-VALIDATION
     │
     ├── Code-Validator: ✓ PASS
     ├── Placeholder-Checker: ✗ FAIL
     │      └── Detectado: "// ... resto del código"
     │
     ▼
BLOQUEO
     │
     ├── NO commitear
     ├── Corregir codigo
     └── Re-ejecutar validacion
```

---

## 7. Integracion con Agentes

### 7.1 Claude Code (Orquestador)

```
Responsabilidad: Ejecutar TODAS las validaciones
Accion en fallo: Corregir o delegar correccion
```

### 7.2 Gemini CLI / Trae

```
Responsabilidad: Reportar si detecta problemas
Accion en fallo: Notificar a orquestador
```

### 7.3 Windsurf

```
Responsabilidad: Ejecutar Placeholder-Checker post-edicion
Accion en fallo: DETENER y reportar
```

---

## 8. Automatizacion

### 8.1 Pre-commit Hook (Opcional)

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Ejecutar Placeholder-Checker en archivos staged
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')
for file in $files; do
    ./scripts/validation/validate-no-placeholders.sh "$file"
    if [ $? -ne 0 ]; then
        echo "ERROR: Placeholder detectado en $file"
        exit 1
    fi
done
```

### 8.2 CI/CD Integration

```yaml
# .github/workflows/validate.yml
validate:
  steps:
    - name: Placeholder Check
      run: |
        ./scripts/validation/validate-no-placeholders.sh $(git diff --name-only HEAD~1)

    - name: Build Check
      run: npm run build

    - name: Lint Check
      run: npm run lint
```

---

## 9. Checklist Rapido

### PRE-VALIDATION (Antes de empezar)
- [ ] Documentacion existe y es valida
- [ ] Contexto correcto cargado
- [ ] Presupuesto de tokens OK

### POST-VALIDATION (Antes de commit)
- [ ] `npm run build` pasa
- [ ] `npm run lint` pasa
- [ ] `@VALIDAR-PLACEHOLDERS` pasa
- [ ] Coherencia entre capas verificada
- [ ] Inventarios actualizados

---

## 10. Referencias

- `@VALIDAR-PLACEHOLDERS` - scripts/validation/validate-no-placeholders.sh
- `@TRIGGER_COHERENCIA` - TRIGGER-COHERENCIA-CAPAS.md
- `@DEF_CHK_POST` - CHECKLIST-POST-TASK.md
- `@EDICION-SEGURA` - SIMCO-EDICION-SEGURA.md

---

*SIMCO-PRE-POST-VALIDATION.md - Fases de Validacion*
*Integra INT-001: validate-no-placeholders.sh*
