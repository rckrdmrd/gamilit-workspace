# Mapa de Navegacion - Errores Comunes Backend

## Descripcion
Documentacion de errores comunes encontrados en el desarrollo del backend de Gamilit y sus soluciones. Cada error esta catalogado con severidad, frecuencia y pasos de resolucion verificados.

## Contenido

| Archivo | Descripcion | Severidad | Estado |
|---------|-------------|-----------|--------|
| [ERR-BE-001-endpoints-prefijo-duplicado.md](./ERR-BE-001-endpoints-prefijo-duplicado.md) | Error de prefijos duplicados en endpoints (doble `/api/v1`) | Critica | Completo |
| [ERR-BE-002-queries-n-plus-1.md](./ERR-BE-002-queries-n-plus-1.md) | Queries N+1 en TypeORM por lazy loading de relaciones | Alta | Completo |
| [ERR-BE-003-validacion-dtos-faltante.md](./ERR-BE-003-validacion-dtos-faltante.md) | DTOs sin decoradores class-validator permiten datos invalidos | Alta | Completo |
| [ERR-BE-004-datasource-entity-path.md](./ERR-BE-004-datasource-entity-path.md) | Entity no incluido en array entities del datasource correcto en app.module.ts | Critica | Completo |
| [ERR-BE-005-modulo-huerfano.md](./ERR-BE-005-modulo-huerfano.md) | Modulo sin .module.ts o no importado en AppModule | Alta | Completo |
| [ERR-BE-006-circular-dependency.md](./ERR-BE-006-circular-dependency.md) | Dependencia circular entre modulos NestJS (imports mutuos) | Alta | Completo |
| [ERR-BE-007-guard-decorator-order.md](./ERR-BE-007-guard-decorator-order.md) | Orden incorrecto de @UseGuards (JwtAuthGuard debe ir antes que RolesGuard) | Alta | Completo |
| [ERR-BE-008-barrel-export-roto.md](./ERR-BE-008-barrel-export-roto.md) | Barrel index.ts re-exporta archivo eliminado o renombrado | Critica | Completo |

## Clasificacion por Severidad

### Critica (bloqueador)
- **ERR-BE-001:** Prefijo duplicado - endpoints inaccesibles (404)
- **ERR-BE-004:** Datasource entity path - aplicacion no arranca
- **ERR-BE-008:** Barrel export roto - build falla completamente

### Alta (funcionalidad afectada)
- **ERR-BE-002:** N+1 queries - degradacion de performance
- **ERR-BE-003:** Validacion DTOs - datos invalidos en BD, errores 500
- **ERR-BE-005:** Modulo huerfano - funcionalidad completa inaccesible
- **ERR-BE-006:** Circular dependency - arranque falla o bugs silenciosos
- **ERR-BE-007:** Guard order - rutas desprotegidas o inaccesibles

## Comandos de Verificacion Rapida

```bash
# Verificar todos los errores comunes de una vez
echo "=== ERR-BE-001: Prefijos duplicados ==="
grep -r "@Controller.*api/v1" apps/backend/src --include="*.ts"

echo "=== ERR-BE-004: FIX-BE patches en datasources ==="
grep -c "FIX-BE-" apps/backend/src/app.module.ts

echo "=== ERR-BE-006: Dependencias circulares (forwardRef) ==="
grep -rl "forwardRef" apps/backend/src --include="*.ts" | wc -l

echo "=== ERR-BE-007: Patrones de UseGuards ==="
grep -rn "UseGuards(RolesGuard" apps/backend/src --include="*.ts"

echo "=== ERR-BE-008: Build check ==="
cd apps/backend && npm run build 2>&1 | tail -5
```

## Referencias
- [Directorio padre](../_MAP.md)
- [Backend Standards](../../../../40-standards/backend-profesional/)
- [app.module.ts](../../../../../apps/backend/src/app.module.ts)

---
*Ultima actualizacion: 2026-02-13*
