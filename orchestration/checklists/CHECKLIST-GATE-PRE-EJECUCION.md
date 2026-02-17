# Checklist Gate Pre-Ejecución

## Objetivo

Validar que una tarea está lista para ejecución sin romper estándares, trazabilidad ni coherencia entre capas.

## Criterios obligatorios

- [ ] La tarea tiene objetivo, alcance y prioridad definidos.
- [ ] Se identificó el tipo de tarea (`feature`, `fix`, `refactor`, `doc-only`, etc.).
- [ ] Se mapearon objetos impactados por capa (DB/BE/FE/docs).
- [ ] Existe relación explícita con épica/US (si aplica).
- [ ] Se asignó perfil responsable según `MATRIZ-PERFIL-DIRECTIVAS`.
- [ ] Se revisaron estándares aplicables por dominio.
- [ ] Se documentaron riesgos y dependencias.
- [ ] El plan cubre todos los hallazgos del análisis.

## Criterios técnicos de entrada

- [ ] Build base en estado saludable (sin bloqueos conocidos).
- [ ] Lint base en estado saludable o con deuda controlada.
- [ ] La tarea define validación técnica esperada (build/lint/tests).
- [ ] La tarea define evidencia documental de salida.

## Regla de bloqueo

Si falta cualquier criterio obligatorio, la tarea **no debe** pasar a ejecución.
