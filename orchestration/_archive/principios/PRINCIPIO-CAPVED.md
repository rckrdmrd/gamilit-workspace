# PRINCIPIO-CAPVED - ARCHIVO DE REFERENCIA

> Este archivo es una REFERENCIA al documento normativo en el workspace padre.
> NO modificar este archivo - modificar el SSOT en el workspace.

---

## Ubicacion del Documento Real (SSOT)

```
/home/isem/workspace-v2/orchestration/directivas/principios/PRINCIPIO-CAPVED.md
```

## Alias para Acceso Rapido

- `@CAPVED` - Invoca el principio completo
- `@PRINCIPIO-CAPVED` - Alias alternativo

## Por que no hay copia completa aqui

Segun el modelo de herencia del workspace (`orchestration/INHERITANCE-MODEL.yml`):

1. Los **principios fundamentales** son recursos del nivel WORKSPACE
2. Los proyectos **heredan** estos principios, no los duplican
3. Esto evita desincronizacion cuando se actualiza el principio
4. La version del workspace es mas completa (incluye Gate de Cierre)

## Contenido del Principio (Resumen)

**CAPVED** = Ciclo de vida obligatorio para toda tarea:

```
C - Contexto:   Clasificar y vincular tarea
A - Analisis:   Mapear impacto y dependencias
P - Planeacion: Definir subtareas y plan
V - Validacion: Gate de coherencia antes de ejecutar
E - Ejecucion:  Implementar cambios
D - Documentacion: Actualizar inventarios y trazas
```

## Como Usar

Para leer el principio completo:

```bash
# Desde cualquier ubicacion en el workspace:
cat /home/isem/workspace-v2/orchestration/directivas/principios/PRINCIPIO-CAPVED.md

# O usar alias en sesion de agente:
@CAPVED
```

## Referencia de Herencia

```yaml
# Definido en: orchestration/_inheritance.yml
principios_heredados:
  source: "workspace"
  path: "/orchestration/directivas/principios/"
  politica: "REFERENCIAR_NO_COPIAR"
```

---

*Archivo de referencia creado: 2026-01-16*
*SSOT: orchestration/directivas/principios/PRINCIPIO-CAPVED.md*
