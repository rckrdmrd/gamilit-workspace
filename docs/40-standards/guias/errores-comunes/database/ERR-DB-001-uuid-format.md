# ERR-DB-001: Formato UUID Incorrecto en Seeds

## Descripcion
Los archivos de seeds contienen UUIDs con formato incorrecto o duplicados, causando errores de insercion o violaciones de constraints.

## Sintomas
- Error: `invalid input syntax for type uuid`
- Error: `duplicate key value violates unique constraint`
- Seeds no se ejecutan completamente
- Datos de referencia faltantes en aplicacion

## Causa Raiz
1. UUIDs generados manualmente sin verificar formato
2. Copy-paste de UUIDs entre archivos sin cambiarlos
3. Uso de UUIDs de prueba (ej: `00000000-0000-0000-0000-000000000001`)
4. Falta de validacion antes de commit

## Solucion

### 1. Validar formato UUID
Un UUID v4 valido tiene el formato:
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```
Donde `y` es 8, 9, a, o b.

### 2. Generar UUIDs correctamente
```bash
# En terminal
uuidgen

# En PostgreSQL
SELECT gen_random_uuid();

# En JavaScript
crypto.randomUUID()
```

### 3. Script de validacion
```bash
# Validar UUIDs en seeds
grep -rE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" \
  apps/database/seeds/ --include="*.sql" | \
  while read line; do
    uuid=$(echo "$line" | grep -oE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
    if [[ ! "$uuid" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ ]]; then
      echo "UUID invalido o no v4: $uuid in $line"
    fi
  done
```

### 4. Corregir UUID existente
```sql
-- Antes (incorrecto)
INSERT INTO tabla (id, ...) VALUES ('12345678-1234-1234-1234-123456789012', ...);

-- Despues (correcto - generar nuevo)
INSERT INTO tabla (id, ...) VALUES ('a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5', ...);
```

## Prevencion

1. **Usar generadores**: Nunca escribir UUIDs manualmente
2. **Revisar PRs**: Validar UUIDs en archivos de seeds
3. **Pre-commit hook**: Agregar validacion de formato UUID
4. **CI/CD**: Incluir validacion de seeds en pipeline

### Formato UUID valido (v4):
```
Posicion 13: siempre "4" (version)
Posicion 17: "8", "9", "a", o "b" (variante)
```

## Ocurrencias

| Fecha | Archivo | Commit | Estado |
|-------|---------|--------|--------|
| 2025-12-27 | seeds/dev/auth/01-demo-users.sql | - | Resuelto |
| 2025-12-26 | seeds/prod/auth_management/03-profiles.sql | - | Resuelto |
| 2025-11-24 | Multiples seeds | - | Resuelto |

## Referencias

- **Documentacion seeds:** `apps/database/seeds/README.md`
- **Validacion script:** `apps/database/scripts/validate-seeds.sh`
- **UUID RFC:** https://www.rfc-editor.org/rfc/rfc4122

---

**Severidad:** Alta
**Frecuencia:** 3+ ocurrencias
**Tiempo de resolucion:** 10-20 min
**Ultimo update:** 2025-12-28
