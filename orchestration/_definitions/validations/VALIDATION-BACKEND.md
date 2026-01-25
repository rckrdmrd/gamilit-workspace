# Validación Backend - NestJS/TypeScript
## Definición Canónica

**Alias:** @DEF_VAL_BE
**Dominio:** Backend NestJS/TypeScript

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:
npm run build    # DEBE pasar sin errores
npm run lint     # DEBE pasar sin errores
npm run test     # Si existen tests, DEBEN pasar
```

## CRITERIOS DE ACEPTACIÓN

```yaml
build:
  resultado: "Compila sin errores"
  archivos_generados: "dist/"
  sin_warnings_criticos: true

lint:
  resultado: "0 errores de ESLint"
  warnings_permitidos: "Solo menores"
  reglas_obligatorias:
    - "@typescript-eslint/no-explicit-any"
    - "@typescript-eslint/no-unused-vars"

test:
  resultado: "100% tests pasan"
  coverage_minimo: "70% (si configurado)"
  nuevos_tests: "Crear para código nuevo"
```

## VALIDACIONES ADICIONALES

```yaml
entities:
  - "Alineadas con DDL (nombres, tipos)"
  - "Relaciones correctamente definidas"
  - "Decoradores TypeORM correctos"

services:
  - "Inyección de dependencias correcta"
  - "Manejo de errores implementado"
  - "Transacciones donde aplique"

controllers:
  - "Decoradores Swagger completos"
  - "Validación de DTOs"
  - "Guards aplicados"

dtos:
  - "class-validator decoradores"
  - "Tipos correctos"
  - "Documentación Swagger"
```

## ERRORES COMUNES

```yaml
- error: "Cannot find module"
  causa: "Import incorrecto o dependencia faltante"
  solucion: "Verificar rutas y npm install"

- error: "Type X is not assignable to type Y"
  causa: "Tipos incompatibles"
  solucion: "Alinear tipos con DDL/interfaces"

- error: "Circular dependency"
  causa: "Módulos se importan mutuamente"
  solucion: "Extraer a módulo compartido o forwardRef"
```

---

**Referencia:** @PERFIL_BACKEND, @SIMCO_BACKEND
