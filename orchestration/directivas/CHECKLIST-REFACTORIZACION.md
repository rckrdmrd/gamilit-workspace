# CHECKLIST DE REFACTORIZACIÓN

**Versión:** 1.0.0
**Fecha creación:** 2025-11-23
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Estado:** Directiva Obligatoria

---

## 🎯 PROPÓSITO

Este checklist es **OBLIGATORIO** para toda refactorización de código en el proyecto GAMILIT. Su objetivo es prevenir bugs, imports rotos y regresiones.

**Problemas que previene:**
- ❌ Imports rotos que causan caída del frontend (BUG-FRONTEND-001)
- ❌ Rutas hard-coded incorrectas (BUG-FRONTEND-002)
- ❌ Refactorizaciones incompletas
- ❌ Breaking changes no detectados

---

## ✅ CHECKLIST COMPLETO

### FASE 1: PRE-REFACTORIZACIÓN (Planificación)

#### 1.1 Análisis de Dependencias

- [ ] **Identificar archivos a modificar/mover/eliminar**
  - Listar TODOS los archivos afectados
  - Incluir archivos de código, tests, docs, configs

- [ ] **Identificar dependencias**
  ```bash
  # Para archivos a mover/eliminar:
  grep -r "from.*nombre-archivo" apps/
  grep -r "import.*nombre-archivo" apps/
  ```
  - Listar TODOS los archivos que importan el código a refactorizar
  - Verificar imports relativos vs absolutos
  - Buscar dynamic imports (`import()`)

- [ ] **Analizar impacto**
  - ¿Cuántos archivos se verán afectados?
  - ¿Hay código crítico que depende de esto?
  - ¿Afecta a múltiples módulos/capas?

#### 1.2 Documentación del Plan

- [ ] **Crear documento de plan de refactorización**
  - Ubicación: `orchestration/agentes/{agente}/refactor-{nombre}-{fecha}/PLAN.md`
  - Incluir: objetivo, archivos afectados, estrategia, rollback plan

- [ ] **Estimar esfuerzo completo**
  - Tiempo de implementación de cambios
  - Tiempo de actualización de referencias
  - Tiempo de testing
  - Tiempo de documentación
  - **NO subestimar** (considerar TODO el trabajo, no solo el cambio principal)

- [ ] **Definir criterios de éxito**
  - ¿Cómo validar que refactorización fue exitosa?
  - ¿Qué tests deben pasar?
  - ¿Qué funcionalidades deben seguir funcionando?

#### 1.3 Preparación del Entorno

- [ ] **Crear rama nueva**
  ```bash
  git checkout -b refactor/nombre-descriptivo
  ```

- [ ] **Asegurar que código actual funciona**
  ```bash
  npm run build
  npm run test
  npm run dev  # Validar que servidor inicia
  ```
  - ✅ Build exitoso
  - ✅ Tests pasando
  - ✅ Servidor inicia sin errores

- [ ] **Commit inicial (snapshot)**
  ```bash
  git add .
  git commit -m "chore: snapshot before refactor {nombre}"
  ```

---

### FASE 2: DURANTE REFACTORIZACIÓN (Implementación)

#### 2.1 Implementación de Cambios

- [ ] **Mover/crear archivos nuevos**
  - Usar herramientas de refactorización del IDE cuando sea posible
  - Copiar primero, eliminar después (mantener versión anterior temporalmente)

- [ ] **Actualizar TODOS los imports**
  - Usar búsqueda global para encontrar ALL references
  - Actualizar imports en archivos de código
  - Actualizar imports en tests
  - Actualizar dynamic imports
  - Actualizar re-exports (`index.ts`)

- [ ] **Verificar imports con búsqueda global**
  ```bash
  # Verificar que NO queden referencias al archivo antiguo
  grep -r "from.*nombre-archivo-antiguo" apps/
  grep -r "import.*nombre-archivo-antiguo" apps/

  # Debe devolver 0 matches
  ```

- [ ] **Actualizar configuraciones**
  - tsconfig paths (si aplica)
  - Jest config (mocks, setup files)
  - ESLint ignores
  - Webpack/Vite aliases

#### 2.2 Commits Incrementales

- [ ] **Hacer commits pequeños y frecuentes**
  ```bash
  git add .
  git commit -m "refactor: move {file} to {new-location}"
  git commit -m "refactor: update imports in {module}"
  git commit -m "refactor: update tests"
  ```
  - Commits atómicos (un tipo de cambio por commit)
  - Mensajes descriptivos

---

### FASE 3: POST-REFACTORIZACIÓN (Validación)

#### 3.1 Validación de Código

- [ ] **Verificar compilación**
  ```bash
  npm run type-check  # TypeScript check
  npm run build       # Build completo
  ```
  - ✅ 0 TypeScript errors
  - ✅ Build exitoso

- [ ] **Ejecutar linter**
  ```bash
  npm run lint
  ```
  - ✅ 0 lint errors
  - Resolver warnings si son relevantes

- [ ] **Ejecutar tests**
  ```bash
  npm run test           # Unit tests
  npm run test:e2e       # E2E tests (si aplica)
  npm run test:coverage  # Coverage (si aplica)
  ```
  - ✅ TODOS los tests pasando
  - ✅ Sin regresiones en cobertura

#### 3.2 Validación Funcional

- [ ] **Iniciar servidor de desarrollo**
  ```bash
  npm run dev
  ```
  - ✅ Servidor inicia sin errores
  - ✅ Sin warnings críticos en console

- [ ] **Validar funcionalidad en browser**
  - Abrir aplicación en browser
  - Verificar console (NO debe haber errores)
  - Navegar páginas afectadas
  - Probar funcionalidades relacionadas
  - Verificar que todo funciona como antes

- [ ] **Validar hot reload / HMR**
  - Hacer cambio menor en archivo refactorizado
  - Verificar que hot reload funciona
  - Sin errores en console

#### 3.3 Validación de Búsquedas

- [ ] **Verificar NO quedan referencias al código antiguo**
  ```bash
  # Buscar nombre de archivo antiguo
  grep -r "nombre-archivo-antiguo" apps/

  # Buscar ruta antigua
  grep -r "ruta/antigua" apps/

  # Debe devolver 0 matches (o solo comentarios/docs)
  ```

- [ ] **Verificar imports correctos**
  ```bash
  # Buscar nuevo path
  grep -r "nueva/ruta" apps/

  # Verificar que todos usan nueva ruta
  ```

#### 3.4 Limpieza

- [ ] **Eliminar archivos antiguos**
  ```bash
  git rm ruta/antigua/archivo-antiguo.ts
  ```
  - Solo después de confirmar que NADA lo usa

- [ ] **Eliminar código comentado (dead code)**
  - NO dejar código antiguo comentado "por las dudas"
  - Git history mantiene el código si se necesita después

- [ ] **Eliminar imports no usados**
  - ESLint debería detectarlos
  - Usar herramienta del IDE para organizar imports

---

### FASE 4: DOCUMENTACIÓN

#### 4.1 Actualizar Documentación

- [ ] **Actualizar documentación afectada**
  - README.md (si aplica)
  - docs/architecture/ (si cambió arquitectura)
  - docs/97-adr/ (crear ADR si decisión arquitectónica)
  - orchestration/inventarios/ (si cambió inventario)

- [ ] **Documentar cambios en CHANGELOG**
  - Tipo de cambio (refactor)
  - Qué se movió/cambió
  - Impacto en otros desarrolladores

- [ ] **Actualizar comentarios de código**
  - Actualizar JSDoc si paths cambiaron
  - Actualizar ejemplos en comentarios

#### 4.2 Crear Traza

- [ ] **Crear reporte de refactorización**
  - Ubicación: `orchestration/agentes/{agente}/refactor-{nombre}-{fecha}/REPORTE.md`
  - Incluir:
    - Objetivo de la refactorización
    - Archivos modificados
    - Validaciones realizadas
    - Problemas encontrados y soluciones
    - Lecciones aprendidas

---

### FASE 5: CODE REVIEW

#### 5.1 Preparación para PR

- [ ] **Self-review**
  - Revisar TODOS los cambios en diff
  - Verificar que NO hay cambios no relacionados
  - Verificar que NO hay console.logs olvidados
  - Verificar formateo consistente

- [ ] **Crear PR con contexto completo**
  ```markdown
  ## Tipo de Cambio
  - [ ] Refactorización

  ## Objetivo
  {Descripción clara del objetivo de la refactorización}

  ## Cambios Principales
  - Movido {archivo A} → {ubicación B}
  - Actualizado {N} imports en {módulos}
  - ...

  ## Archivos Afectados
  - {número} archivos modificados
  - {número} archivos movidos
  - {número} archivos eliminados

  ## Validaciones Realizadas
  - ✅ Build exitoso
  - ✅ Tests pasando (X/X)
  - ✅ Servidor inicia correctamente
  - ✅ Funcionalidad validada en browser
  - ✅ 0 imports rotos

  ## Checklist de Refactorización
  - ✅ Pre-refactorización completada
  - ✅ Durante refactorización completada
  - ✅ Post-refactorización completada
  - ✅ Documentación actualizada
  ```

#### 5.2 Responder a Code Review

- [ ] **Atender comentarios de reviewers**
  - Responder TODOS los comentarios
  - Implementar cambios solicitados
  - Re-validar después de cambios

- [ ] **Re-ejecutar validaciones después de cambios**
  - Build, tests, servidor funcionando
  - No romper lo que ya funcionaba

---

### FASE 6: DEPLOYMENT

#### 6.1 Pre-merge

- [ ] **Merge/rebase con main/master**
  ```bash
  git checkout main
  git pull
  git checkout refactor/nombre-descriptivo
  git rebase main  # o merge, según política del proyecto
  ```

- [ ] **Resolver conflictos (si los hay)**
  - Resolver con cuidado
  - Re-ejecutar TODAS las validaciones después de resolver

- [ ] **Validación final**
  ```bash
  npm run build
  npm run test
  npm run dev
  ```
  - ✅ Todo funciona después de merge/rebase

#### 6.2 Post-merge

- [ ] **Merge a main/master**
  - Usar squash merge si muchos commits pequeños
  - O mantener commits si son significativos

- [ ] **Validar en CI/CD**
  - Esperar que pipeline pase
  - Si falla, investigar inmediatamente

- [ ] **Monitorear después del merge**
  - Revisar logs de errores
  - Monitorear alerts/monitoring
  - Estar disponible para hotfixes

---

## 🚨 SIGNALS DE ALERTA

### Cuando DETENER y Re-planificar

- 🚨 **Refactorización toma >2x el tiempo estimado**
  → Pausar, re-evaluar estrategia

- 🚨 **Encontraste >10 archivos no planeados que dependen del código**
  → Pausar, actualizar plan

- 🚨 **Tests empiezan a fallar en módulos no relacionados**
  → Rollback, investigar

- 🚨 **Build roto después de múltiples intentos**
  → Rollback, pedir ayuda

---

## 📊 MÉTRICAS DE ÉXITO

### Refactorización Exitosa

- ✅ 0 imports rotos
- ✅ 0 regresiones funcionales
- ✅ 100% tests pasando
- ✅ Build exitoso en < mismo tiempo que antes
- ✅ Código más limpio/mantenible que antes

### Refactorización Fallida (Requiere Mejora)

- ❌ Imports rotos encontrados después de merge
- ❌ Bugs introducidos por la refactorización
- ❌ Tests fallando
- ❌ Performance degradada

---

## 🔧 HERRAMIENTAS ÚTILES

### Búsqueda Global

```bash
# Encontrar TODAS las referencias
grep -r "nombre-busqueda" apps/
rg "nombre-busqueda" apps/  # (ripgrep, más rápido)

# Con contexto (3 líneas antes/después)
grep -r -C 3 "nombre-busqueda" apps/

# Solo nombres de archivo
grep -r -l "nombre-busqueda" apps/

# Excluir node_modules, dist, build
grep -r "nombre-busqueda" apps/ --exclude-dir={node_modules,dist,build}
```

### Refactorización en IDE

**VS Code:**
- `F2` → Rename symbol (actualiza imports automáticamente)
- `Ctrl+Shift+H` → Find and replace in files
- Command Palette → "Organize Imports"

**WebStorm:**
- `Shift+F6` → Rename
- `Ctrl+Alt+Shift+T` → Refactor menu
- `Ctrl+Alt+O` → Optimize imports

### Git

```bash
# Ver archivos modificados
git status

# Ver diff detallado
git diff

# Commit parcial (stage por partes)
git add -p

# Revert cambio específico
git checkout -- ruta/archivo.ts
```

---

## 📚 REFERENCIAS

### Documentos Relacionados

- [Directiva de Calidad de Código](DIRECTIVA-CALIDAD-CODIGO.md)
- [Estándares de Nomenclatura](ESTANDARES-NOMENCLATURA.md)
- [Documentación Obligatoria](DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md)
- [Frontend API Architecture](../../docs/frontend/api-architecture.md)

### Ejemplos de Refactorizaciones

- [BUG-FRONTEND-001](../agentes/architecture-analyst/frontend-api-broken-imports-2025-11-23/) - Imports rotos por refactorización incompleta
- [BUG-FRONTEND-002](../agentes/architecture-analyst/frontend-api-routes-404-2025-11-23/) - Rutas hard-coded incorrectas

---

## ✅ RESUMEN: GOLDEN RULES

1. **NUNCA** elimines un archivo sin verificar que NADA lo usa
2. **SIEMPRE** actualiza TODOS los imports (usa búsqueda global)
3. **SIEMPRE** valida que servidor/tests funcionan DESPUÉS del cambio
4. **NUNCA** hagas múltiples refactorizaciones en el mismo PR
5. **SIEMPRE** documenta en CHANGELOG/traza lo que hiciste
6. **SIEMPRE** haz commits pequeños y frecuentes
7. **NUNCA** merges código que no has validado localmente
8. **SIEMPRE** pide code review para refactorizaciones no triviales

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-23
**Estado:** Directiva Obligatoria
**Proyecto:** GAMILIT
**Mantenido por:** Architecture Team
