# Checklist Gate Post-Ejecución

## Objetivo

Verificar que la ejecución quedó consistente técnica y documentalmente antes de cerrar la tarea.

## Validación técnica

- [ ] Cambios implementados según alcance acordado.
- [ ] Build ejecutado y sin errores bloqueantes.
- [ ] Lint ejecutado y sin errores nuevos bloqueantes.
- [ ] Tests ejecutados según alcance y sin regresiones críticas.
- [ ] No se introdujeron secretos ni configuraciones inseguras.

## Coherencia entre capas

- [ ] Si hubo DDL, existe alineación con backend.
- [ ] Si hubo backend, existe contrato consumible por frontend (si aplica).
- [ ] Si hubo frontend, existe correspondencia con endpoint/contrato.
- [ ] Flujos impactados mantienen trazabilidad funcional.

## Evidencia y documentación

- [ ] Se actualizó evidencia de archivos modificados.
- [ ] Se actualizó trazabilidad task -> código -> validación.
- [ ] Se actualizaron documentos técnicos impactados.
- [ ] Se registraron pendientes residuales (si existen).

## Regla de cierre

No cerrar la tarea mientras exista un criterio obligatorio sin marcar.
