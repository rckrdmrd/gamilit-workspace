# MODE-QUICK: Ejecucion Rapida

**ID:** MODE-QUICK
**Version:** 1.0.0
**Alias:** `@QUICK`
**Estado:** Activo

---

## Descripcion

Modo de ejecucion simplificado para cambios menores que no requieren analisis
exhaustivo ni validacion de dependencias. Solo ejecuta las fases E (Ejecucion)
y D (Documentacion) del ciclo CAPVED.

---

## Fases de Ejecucion

### Fase E: EJECUCION (Unica fase de trabajo)
```yaml
objetivo: Aplicar cambio directo sin analisis previo
actividades:
  - Identificar archivo(s) a modificar
  - Aplicar cambio directamente
  - Ejecutar validacion basica (build + lint)

output:
  - Archivo(s) modificado(s)
  - Validacion basica pasada
```

### Fase D: DOCUMENTACION (Registro minimo)
```yaml
objetivo: Registrar el cambio realizado
actividades:
  - Registrar en traza correspondiente
  - Actualizar PROXIMA-ACCION.md si aplica

output:
  - Traza actualizada
```

---

## Triggers Automaticos

### Solo Validacion Basica
```yaml
cuando: Fase E completada
accion:
  - npm run build (debe pasar)
  - npm run lint (debe pasar)
  - Si falla: escalar a MODE-FULL
```

---

## Validaciones Minimas

```bash
# Siempre requerido
npm run build     # DEBE pasar
npm run lint      # DEBE pasar
```

**IMPORTANTE:** Si build o lint fallan, el cambio puede tener impacto mayor
del esperado. En ese caso, escalar a MODE-FULL para analisis completo.

---

## Cuando Usar Este Modo

### SI Usar MODE-QUICK
- Correccion de typos en documentacion
- Fixes menores en comentarios
- Actualizacion de versiones de dependencias
- Cambios de configuracion simples (env, configs)
- Ajustes de estilos CSS menores
- Renombrado de variables locales
- Actualizacion de textos/labels UI

### NO Usar MODE-QUICK
- Cualquier cambio de logica de negocio -> MODE-FULL
- Cambios en base de datos -> MODE-FULL
- Nuevos archivos -> MODE-FULL
- Cambios que afectan multiples archivos -> MODE-FULL
- Cualquier cosa que pueda tener dependientes -> MODE-FULL

---

## Criterios de Elegibilidad

Para usar MODE-QUICK, el cambio debe cumplir TODOS estos criterios:

```yaml
criterios:
  - impacto: "Minimo"
  - archivos_afectados: "1-2 maximo"
  - tipo_cambio: "Cosmetico o configuracion"
  - dependientes: "Ninguno o triviales"
  - riesgo: "Bajo"
  - reversible: "Facilmente"
```

Si alguno no se cumple, usar MODE-FULL.

---

## Ejemplo de Ejecucion

```
Usuario: @QUICK Corregir typo "recibir" -> "recibir" en README de erp-core

Sistema:
== FASE E: EJECUCION ==
- Archivo: projects/erp-core/README.md
- Cambio: "recivir" -> "recibir"
- Validacion: npm run lint... OK

== FASE D: DOCUMENTACION ==
- Traza: Registrado en TRAZA-TAREAS-DOCS.md
- Commit: "fix(docs): corregir typo en README"

COMPLETADO en 1 fase activa.
```

---

## Escalamiento a MODE-FULL

Si durante MODE-QUICK se detecta alguno de estos casos, escalar automaticamente:

```yaml
escalar_si:
  - build_falla: true
  - lint_falla: true
  - cambio_afecta_mas_archivos: true
  - se_detecta_dependiente: true
  - cambio_requiere_test: true
```

Al escalar:
1. Informar al usuario del escalamiento
2. Iniciar MODE-FULL desde Fase C
3. Documentar razon del escalamiento

---

*MODE-QUICK v1.0.0 - Sistema SAAD*
