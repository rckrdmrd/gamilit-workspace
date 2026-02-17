# CONTRATO TRANSVERSAL DE PERFILES (FULL)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Aplica a:** todos los perfiles full en `orchestration/agents/perfiles/`

---

## Proposito

Definir un contrato unico (IoC + normalizacion + SOLID documental) para todos los perfiles de agentes.

---

## Estructura minima obligatoria

Cada perfil full debe incluir estas secciones:
1. `PROTOCOLO DE INICIALIZACION (CCA)`
2. `IDENTIDAD`
3. `REFERENCIAS OBLIGATORIAS` o `CONTEXT REQUIREMENTS`
4. `RESPONSABILIDADES` (si aplica por dominio)
5. `DELEGACION Y COORDINACION` (si aplica)
6. `CHECKLIST DE VALIDACION`
7. `REFERENCIAS`

---

## Contrato de entrada (input contract)

```yaml
input_contract:
  obligatorio:
    - tarea_descripcion
    - objetivo
    - dominio
    - archivos_objetivo
  contexto:
    - perfil_id
    - fase_capved
    - contexto_minimo_l0_l1_l2
  restricciones:
    - alcance_del_cambio
    - no_asumir
```

---

## Contrato de salida (output contract)

```yaml
output_contract:
  obligatorio:
    - resumen_ejecutivo
    - archivos_impactados
    - validaciones_ejecutadas
    - estado_final
  estado_final:
    enum: [completado, bloqueado, requiere_aclaracion]
```

---

## Integracion IoC

- La selección de skills/contexto debe resolverse con:
  - `orchestration/agents/configs/PROFILE-SKILL-MAP.json`
  - `orchestration/agents/tools/profile_skill_resolver.py`
- Evitar rutas hardcodeadas no existentes en el repo actual.
- Referenciar `orchestration/CONTEXT-MAP.yml` para tareas documentales y de validación.

---

## Reglas de normalizacion

- Versionado semver en metadatos del perfil.
- Alias y referencias alineados con `orchestration/referencias/ALIASES.yml`.
- Sin placeholders de implementación.
- Si una sección depende de otra directiva, referenciarla por ruta exacta.
