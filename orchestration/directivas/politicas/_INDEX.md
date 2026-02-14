# Indice de Politicas de Excepcion

**Carpeta:** `orchestration/directivas/politicas/`
**Proposito:** Documentar excepciones temporales a las reglas estandar del workspace

---

## Politicas Vigentes

| Documento | Estado | Fecha | Descripcion |
|-----------|--------|-------|-------------|
| [POLITICA-ENV-COMPARTIDO.md](POLITICA-ENV-COMPARTIDO.md) | VIGENTE | 2026-01-20 | Archivos .env en Git por ambiente multi-entorno |
| [POLITICA-SSOT-GAMILIT.md](POLITICA-SSOT-GAMILIT.md) | VIGENTE | 2026-01-30 | Windows como SSOT de codigo e inventarios |
| [POLITICA-SUPPLY-CHAIN.md](POLITICA-SUPPLY-CHAIN.md) | VIGENTE | 2026-02-13 | Seguridad de cadena de suministro (dependencias, CI/CD) |

---

## Cuando Crear una Politica

Crear una politica de excepcion cuando:

1. **Desviacion justificada** - Hay razon valida para no seguir el estandar
2. **Temporal y revisable** - Tiene condiciones claras de revision
3. **Documentada** - Explica el contexto, riesgos y mitigaciones
4. **Aprobada** - Usuario/admin ha autorizado la excepcion

---

## Estructura de Politica

```markdown
# POLITICA: [Nombre]

**Version:** X.Y.Z
**Estado:** VIGENTE | DEPRECADA | EN REVISION
**Revision:** [Condicion de revision]

## Contexto
[Por que existe esta excepcion]

## Decision
[Que se permite/prohibe]

## Riesgos Aceptados
[Tabla de riesgos y mitigaciones]

## Condiciones de Revision
[Cuando se debe revisar/eliminar]
```

---

## Alias de Acceso

- `@POLITICA-ENV` - Politica de .env compartidos
- `@POLITICA-SSOT` - Politica SSOT para Gamilit
- `@POLITICA-SUPPLY-CHAIN` - Politica de seguridad supply chain

---

**Ultima actualizacion:** 2026-02-14
