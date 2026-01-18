# Validacion Backend - NestJS/TypeScript
## Definicion Canonica

**Alias:** @DEF_VAL_BE
**Dominio:** Backend NestJS/TypeScript
**Fecha:** 2026-01-18
**Propagado desde:** workspace-v2/orchestration/_definitions/validations/VALIDATION-BACKEND.md

---

## COMANDOS OBLIGATORIOS

```bash
# ANTES de marcar tarea como completada:
npm run build    # DEBE pasar sin errores
npm run lint     # DEBE pasar sin errores
npm run test     # Si existen tests, DEBEN pasar
```

## CRITERIOS DE ACEPTACION

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
  nuevos_tests: "Crear para codigo nuevo"
```

## VALIDACIONES ADICIONALES

```yaml
entities:
  - "Alineadas con DDL (nombres, tipos)"
  - "Relaciones correctamente definidas"
  - "Decoradores TypeORM correctos"

services:
  - "Inyeccion de dependencias correcta"
  - "Manejo de errores implementado"
  - "Transacciones donde aplique"

controllers:
  - "Decoradores Swagger completos"
  - "Validacion de DTOs"
  - "Guards aplicados"

dtos:
  - "class-validator decoradores"
  - "Tipos correctos"
  - "Documentacion Swagger"
```

## RUTAS ESPECIFICAS GAMILIT

```yaml
backend_path: "backend/src/"
entities_path: "backend/src/entities/"
services_path: "backend/src/services/"
controllers_path: "backend/src/controllers/"
dtos_path: "backend/src/dtos/"
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
  causa: "Modulos se importan mutuamente"
  solucion: "Extraer a modulo compartido o forwardRef"
```

---

**Referencia:** orchestration/agentes/, orchestration/directivas/
**Propagado desde:** workspace-v2
