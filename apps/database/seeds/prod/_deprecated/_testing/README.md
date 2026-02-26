# Seeds de Testing

**Directorio:** `seeds/dev/_testing/`
**Creado:** 2025-12-27 (P0-002)

## Propósito

Este directorio contiene scripts SQL que son para testing/validación manual y NO deben ejecutarse durante la inicialización normal de la BD.

## Archivos

| Archivo | Propósito |
|---------|-----------|
| `CREAR-USUARIOS-TESTING.sql` | Script de emergencia para crear usuarios de testing manualmente |
| `01-test-exercises-validation.sql` | Validación de ejercicios (testing) |
| `02-test-nuevos-validadores-DB-117.sql` | Tests del ticket DB-117 |
| `10-test-nuevos-validadores-FE-059.sql` | Tests del ticket FE-059 |

## Uso

Estos scripts se ejecutan manualmente cuando se necesita:

```bash
# Ejemplo: Ejecutar script de testing
psql -h localhost -U postgres -d gamilit_platform -f seeds/dev/_testing/CREAR-USUARIOS-TESTING.sql
```

## NO incluir en init-database.sh

Estos archivos fueron movidos aquí intencionalmente para evitar conflictos durante la inicialización normal de la base de datos.
