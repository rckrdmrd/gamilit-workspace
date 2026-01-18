# Validacion Frontend - React/TypeScript
## Definicion Canonica

**Alias:** @DEF_VAL_FE
**Dominio:** Frontend React/TypeScript
**Fecha:** 2026-01-18
**Propagado desde:** workspace-v2/orchestration/_definitions/validations/VALIDATION-FRONTEND.md

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:
npm run build      # DEBE pasar sin errores
npm run lint       # DEBE pasar sin errores
npm run typecheck  # DEBE pasar sin errores (tsc --noEmit)
```

## CRITERIOS DE ACEPTACION

```yaml
build:
  resultado: "Build de produccion exitoso"
  sin_warnings_criticos: true
  bundle_size: "Monitorear incrementos grandes"

lint:
  resultado: "0 errores de ESLint"
  reglas_react:
    - "react-hooks/rules-of-hooks"
    - "react-hooks/exhaustive-deps"

typecheck:
  resultado: "0 errores de TypeScript"
  strict_mode: true
  no_any_implicito: true
```

## VALIDACIONES ADICIONALES

```yaml
componentes:
  - "Props tipadas correctamente"
  - "Keys unicas en listas"
  - "Manejo de loading/error states"
  - "Accesibilidad basica (aria labels)"

hooks:
  - "Dependencias completas en useEffect"
  - "Cleanup en useEffect si necesario"
  - "useMemo/useCallback donde aplique"

estado:
  - "Estado minimo necesario"
  - "Derivar datos cuando posible"
  - "Zustand/Context correctamente usado"

api:
  - "Manejo de errores de red"
  - "Estados de carga"
  - "Cancelacion de requests"
```

## RUTAS ESPECIFICAS GAMILIT

```yaml
# Portales de gamilit
student_portal_path: "apps/student-portal/src/"
teacher_portal_path: "apps/teacher-portal/src/"
admin_portal_path: "apps/admin-portal/src/"

# Componentes compartidos
shared_components: "packages/shared-components/src/"
```

## ERRORES COMUNES

```yaml
- error: "React Hook useEffect has missing dependency"
  causa: "Dependencia no incluida en array"
  solucion: "Agregar dependencia o usar useCallback"

- error: "Cannot read property of undefined"
  causa: "Datos async no disponibles"
  solucion: "Optional chaining o loading state"

- error: "Each child should have unique key"
  causa: "Key faltante o duplicada en map()"
  solucion: "Usar ID unico como key"
```

---

**Referencia:** orchestration/agentes/, orchestration/directivas/
**Propagado desde:** workspace-v2
