# Paths de Documentación Bien Definidos

**Fecha:** 2025-11-02

---

## 📋 Reglas de Paths para Documentación

### 1. Análisis → `orchestration/01-analisis/{tipo}/`
- Tipos: features, bugs, refactoring, performance
- Formato: `YYYY-MM-DD-{nombre-descriptivo}.md`

### 2. Planes → `orchestration/02-planes/ciclo-{N}/`
- Por ciclo y microciclo
- Formato: `PLAN-MICRO-{X}-{Y}-{Z}.md`

### 3. Subagentes → `orchestration/03-subagentes/SA-{PERFIL}-{NUM}/`
- Carpeta por subagente
- Contiene: README.md, TRAZA.md, OUTPUT.md, artifacts/

### 4. Logs → `orchestration/04-logs/{perfil}/`
- Por perfil de agente
- Formato: `YYYY-MM-DD-micro-{X}-{Y}.md`

### 5. Validaciones → `orchestration/05-validaciones/{tipo}/`
- Tipos: tipos, integracion, documentacion
- Formato: `YYYY-MM-DD-validation-{nombre}.md`

### 6. Respaldos → `orchestration/06-respaldos/pre-{feature}/`
- Antes de cambios grandes
- Contiene snapshot de archivos afectados

---

**Creado:** 2025-11-02
