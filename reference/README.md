# 📚 REFERENCE - Código de Referencia

**Propósito:** Esta carpeta contiene proyectos y código de referencia para análisis, comparación y mejora del desarrollo actual.

---

## 🎯 USO

### Para Architecture-Analyst
- Analizar implementaciones de referencia
- Comparar patrones arquitectónicos
- Documentar mejores prácticas observadas
- Proponer mejoras basadas en referencias

### Para Agentes de Desarrollo
- Consultar implementaciones de funcionalidades similares
- Comparar enfoques de diseño
- Reutilizar patrones probados
- Entender mejores prácticas

### Para Claude Code Cloud
- Acceso a código de referencia desde cualquier instancia
- Comparaciones automáticas con código actual
- Análisis de implementaciones

---

## 📂 ESTRUCTURA

```
reference/
├── README.md                  # Este archivo
├── proyecto-ejemplo-1/        # Proyecto de referencia
│   ├── src/                   # Solo código fuente
│   ├── package.json           # Dependencias
│   └── README.md              # Descripción del proyecto
├── proyecto-ejemplo-2/
└── implementaciones/          # Implementaciones específicas
    ├── auth-patterns/         # Patrones de autenticación
    ├── multi-tenant/          # Implementaciones multi-tenant
    └── gamification/          # Sistemas de gamificación
```

---

## ⚠️ IMPORTANTE - Qué Versionar

### ✅ SÍ versionar (INCLUIR):
- Código fuente (.ts, .tsx, .js, .jsx, .vue, etc.)
- Archivos de configuración (package.json, tsconfig.json, etc.)
- Documentación (.md files)
- Esquemas de base de datos (.sql files)
- Archivos de tipos (.d.ts)
- README y documentación

### ❌ NO versionar (IGNORADO automáticamente):
- node_modules/
- dist/
- build/
- .next/
- .nuxt/
- coverage/
- .turbo/
- .nx/
- out/
- *.log
- *.tmp
- *.cache
- .DS_Store

**Razón:** Solo versionamos código fuente. Las dependencias y builds se pueden regenerar con `npm install` / `npm run build`.

---

## 📋 DIRECTRICES

### Al Agregar Proyectos de Referencia

1. **Limpiar antes de agregar:**
   ```bash
   # Eliminar node_modules y builds
   cd reference/nuevo-proyecto
   rm -rf node_modules dist build .next coverage
   ```

2. **Verificar que está limpio:**
   ```bash
   # No debe mostrar carpetas de build/dependencias
   du -sh reference/nuevo-proyecto/*
   ```

3. **Agregar README del proyecto:**
   ```markdown
   # Proyecto: {nombre}

   **Fuente:** {URL o descripción}
   **Propósito:** ¿Por qué se incluye como referencia?
   **Aspectos relevantes:** ¿Qué podemos aprender?

   ## Instalación (para probar localmente)
   ```bash
   npm install
   npm run dev
   ```

   ## Aspectos destacables
   - Feature 1: Descripción
   - Pattern 2: Descripción
   ```

4. **Commit con mensaje descriptivo:**
   ```bash
   git add reference/nuevo-proyecto
   git commit -m "ref: agregar proyecto {nombre} como referencia para {propósito}"
   ```

---

## 🔍 VALIDACIÓN

### Verificar que reference/ está en el repo:
```bash
# Debe devolver vacío (no ignorado)
git check-ignore reference/

# Debe mostrar archivos de reference/
git ls-files reference/
```

### Verificar que node_modules está ignorado dentro de reference/:
```bash
# Debe devolver: reference/proyecto/node_modules/
git check-ignore reference/proyecto/node_modules/
```

### Ejecutar validación automática:
```bash
bash orchestration/scripts/validate-gitignore.sh
```

Debe mostrar:
```
✅ reference/ NO está ignorado (correcto)
✅ reference/**/node_modules/ está ignorado (correcto)
✅ reference/**/dist/ está ignorado (correcto)
```

---

## 📊 TAMAÑO RECOMENDADO

**Máximo recomendado:** ~100MB por proyecto (solo código fuente)

Si un proyecto excede este tamaño:
- Considerar incluir solo las partes relevantes
- Crear subcarpeta con implementaciones específicas
- Documentar ubicación del proyecto completo (URL)

---

## 🎓 EJEMPLOS DE USO

### Ejemplo 1: Analizar Patrón de Autenticación

```markdown
**Tarea:** Implementar autenticación multi-tenant

**Agente:** Architecture-Analyst

**Proceso:**
1. Revisar `reference/proyecto-multi-tenant/src/auth/`
2. Analizar implementación de RLS y context
3. Comparar con implementación actual
4. Documentar mejoras en `docs/adr/ADR-XXX.md`
```

### Ejemplo 2: Implementar Feature Similar

```markdown
**Tarea:** Implementar sistema de gamificación

**Agente:** Backend-Agent

**Proceso:**
1. Consultar `reference/gamification-system/`
2. Revisar modelos de datos y APIs
3. Adaptar patrones al proyecto actual
4. Implementar con mejores prácticas observadas
```

### Ejemplo 3: Comparar Arquitectura

```markdown
**Tarea:** Refactorizar estructura de módulos

**Agente:** Architecture-Analyst

**Proceso:**
1. Analizar `reference/best-practices-nestjs/`
2. Comparar con estructura actual
3. Proponer mejoras arquitectónicas
4. Crear plan de refactorización
```

---

## 📚 REFERENCIAS

- [DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md](../orchestration/directivas/DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md) - Sección 1.5
- [PROMPT-ARCHITECTURE-ANALYST.md](../orchestration/prompts/PROMPT-ARCHITECTURE-ANALYST.md)
- `.gitignore` - Líneas 201-217

---

## ✅ CHECKLIST ANTES DE COMMIT

Antes de agregar un nuevo proyecto de referencia:

- [ ] Eliminar node_modules/, dist/, build/, .next/, etc.
- [ ] Verificar que solo hay código fuente
- [ ] Agregar README del proyecto explicando propósito
- [ ] Verificar tamaño total (< 100MB recomendado)
- [ ] Documentar aspectos relevantes del proyecto
- [ ] Commit con mensaje descriptivo

---

**Última actualización:** 2025-11-23
**Mantenido por:** Architecture-Analyst, Workspace-Manager
**Directiva:** DIRECTIVA-GESTION-BACKUPS-GITIGNORE.md sección 1.5
