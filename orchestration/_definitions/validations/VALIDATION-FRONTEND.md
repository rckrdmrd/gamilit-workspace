# Validación Frontend - React/TypeScript
## Definición Canónica

**Alias:** @DEF_VAL_FE
**Dominio:** Frontend React/TypeScript

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:
npm run build      # DEBE pasar sin errores
npm run lint       # DEBE pasar sin errores
npm run typecheck  # DEBE pasar sin errores (tsc --noEmit)
```

## CRITERIOS DE ACEPTACIÓN

```yaml
build:
  resultado: "Build de producción exitoso"
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
  - "Keys únicas en listas"
  - "Manejo de loading/error states"
  - "Accesibilidad básica (aria labels)"

hooks:
  - "Dependencias completas en useEffect"
  - "Cleanup en useEffect si necesario"
  - "useMemo/useCallback donde aplique"

estado:
  - "Estado mínimo necesario"
  - "Derivar datos cuando posible"
  - "Zustand/Context correctamente usado"

api:
  - "Manejo de errores de red"
  - "Estados de carga"
  - "Cancelación de requests"
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
  solucion: "Usar ID único como key"
```

---

**Referencia:** @PERFIL_FRONTEND, @SIMCO_FRONTEND
