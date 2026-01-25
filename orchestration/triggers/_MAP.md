# Mapa de Contenidos: triggers

**Carpeta:** orchestration/triggers/
**Archivos:** 6
**Ultima actualizacion:** 2026-01-24

---

## Estructura

```
triggers/
├── _MAP.md                                 # [ESTE ARCHIVO]
├── TRIGGER-CIERRE-TAREA-OBLIGATORIO.md     # Cierre de tareas
├── TRIGGER-COHERENCIA-CAPAS.md             # Coherencia DDL-Backend-Frontend
├── TRIGGER-COHERENCIA-ENUMS.md             # Sincronizacion de ENUMs
├── TRIGGER-CREDENCIALES-SINCRONIZADAS.md   # Credenciales BD
├── TRIGGER-SINCRONIZACION-REFERENCIAS.md   # Sincronizacion de referencias
└── TRIGGER-TYPEORM-CROSS-DATASOURCE.md     # TypeORM multi-datasource
```

---

## Triggers Locales de Gamilit

| Trigger | Proposito | Aplica |
|---------|-----------|--------|
| TRIGGER-CIERRE-TAREA-OBLIGATORIO | Validaciones antes de cerrar tarea | Todas las tareas |
| TRIGGER-COHERENCIA-CAPAS | Verificar coherencia DDL↔Backend↔Frontend | Tareas multi-capa |
| TRIGGER-COHERENCIA-ENUMS | Sincronizar ENUMs entre capas | Cambios en ENUMs |
| TRIGGER-CREDENCIALES-SINCRONIZADAS | Verificar credenciales BD correctas | Operaciones BD |
| TRIGGER-SINCRONIZACION-REFERENCIAS | Sincronizar referencias entre archivos | Documentacion |
| TRIGGER-TYPEORM-CROSS-DATASOURCE | Evitar errores de datasource en TypeORM | Backend |

---

## Herencia

Los triggers del workspace (`workspace-v2/orchestration/directivas/triggers/`)
tambien aplican. Estos son triggers **adicionales** especificos de gamilit.

---

*Consolidado desde directivas/triggers/ y directivas/proyecto-triggers/ el 2026-01-24*
*Estandar: SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
