# Protocolo CCA Ligero - Para Subagentes
## Definición Canónica (Fuente Única de Verdad)

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Alias:** @DEF_CCA_LIGHT
**Tipo:** Definición Canónica

---

## PROPÓSITO

Versión reducida del CCA para subagentes con tareas específicas.
Optimizado para consumo mínimo de tokens (~100 tokens).

---

## PROTOCOLO LIGERO

```yaml
# CCA Ligero - Subagentes
# Usar cuando: Tarea específica delegada, 1-2 archivos

PASO_1_IDENTIFICAR:
  perfil: "{del prompt}"
  proyecto: "{del prompt}"
  tarea: "{del prompt}"
  operacion: "{CREAR|MODIFICAR|VALIDAR}"

PASO_2_CARGAR_MINIMO:
  - orchestration/referencias/ALIASES.yml
  - orchestration/inventarios/{DOMINIO}_INVENTORY.yml

PASO_3_CARGAR_SIMCO:
  segun_operacion:
    crear: "SIMCO-CREAR.md"
    modificar: "SIMCO-MODIFICAR.md"
    validar: "SIMCO-VALIDAR.md"

RESULTADO: "READY_TO_EXECUTE"
```

---

## CUÁNDO USAR

```yaml
usar_cca_light:
  - Subagente delegado por orquestador
  - Tarea afecta 1-2 archivos
  - Contexto ya proporcionado en delegación
  - Tiempo estimado < 30 minutos

usar_cca_completo:
  - Agente principal
  - Tarea compleja multi-archivo
  - Necesita contexto completo
  - Primera tarea del día
```

---

## REFERENCIAS

- **Versión completa:** @DEF_CCA
- **Perfiles compact:** agents/perfiles/compact/

---

**Última actualización:** 2026-01-16
