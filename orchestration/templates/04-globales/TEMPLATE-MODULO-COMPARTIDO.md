# {NOMBRE_MODULO}

**Modulo:** shared/modules/{nombre_modulo}/
**Version:** {VERSION}
**Fecha:** {FECHA}
**Owner:** {AGENTE_OWNER}
**Estado:** {production-ready | beta | desarrollo}

---

## Descripcion

{Descripcion breve del modulo y su proposito. 2-3 oraciones.}

---

## Instalacion

### Prerequisitos

```bash
# Dependencias npm requeridas (si las hay)
npm install {dependencia1} {dependencia2}
```

### Configuracion de Paths

Agregar en `tsconfig.json` del proyecto consumidor:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/modules/*": ["../../shared/modules/*"]
    }
  }
}
```

---

## API Publica

### Funciones Exportadas

| Funcion | Descripcion | Parametros | Retorno |
|---------|-------------|------------|---------|
| `{funcion1}` | {descripcion} | `{params}` | `{tipo}` |
| `{funcion2}` | {descripcion} | `{params}` | `{tipo}` |
| `{funcion3}` | {descripcion} | `{params}` | `{tipo}` |

### Tipos Exportados

```typescript
// Tipos disponibles para importar
export type {Tipo1} = {...};
export interface {Interface1} {...}
```

---

## Ejemplos de Uso

### Ejemplo 1: {Caso de uso basico}

```typescript
import { {funcion1} } from '@shared/modules/{nombre_modulo}';

// Ejemplo de uso
const resultado = {funcion1}(parametros);
console.log(resultado);
```

### Ejemplo 2: {Caso de uso avanzado}

```typescript
import { {funcion1}, {funcion2} } from '@shared/modules/{nombre_modulo}';

// Ejemplo combinado
const paso1 = {funcion1}(datos);
const paso2 = {funcion2}(paso1);
```

---

## Detalle de Funciones

### `{funcion1}(params): ReturnType`

**Proposito:** {Descripcion detallada de que hace la funcion}

**Parametros:**
- `param1` (tipo): {descripcion}
- `param2` (tipo, opcional): {descripcion}

**Retorno:** `{tipo}` - {descripcion del valor retornado}

**Excepciones:**
- `{ErrorType}`: {cuando se lanza}

**Ejemplo:**
```typescript
const resultado = {funcion1}('valor1', { opcion: true });
// resultado: {ejemplo de output}
```

---

## Dependencias

### Internas (otros modulos de core/)

| Modulo | Uso |
|--------|-----|
| `@shared/modules/{otro}` | {para que se usa} |

### Externas (npm)

| Paquete | Version | Uso |
|---------|---------|-----|
| `{paquete}` | `^{version}` | {para que se usa} |

---

## Proyectos Consumidores

| Proyecto | Desde Version | Funciones Usadas |
|----------|---------------|------------------|
| {proyecto1} | {version} | `{funcion1}`, `{funcion2}` |
| {proyecto2} | {version} | `{funcion3}` |

---

## Testing

### Ejecutar Tests

```bash
cd shared/modules/{nombre_modulo}
npm test
```

### Cobertura

| Archivo | Lineas | Funciones | Branches |
|---------|--------|-----------|----------|
| {archivo}.ts | {%} | {%} | {%} |

---

## Changelog

### v{VERSION} ({FECHA})
- {Cambio 1}
- {Cambio 2}

### v{VERSION_ANTERIOR} ({FECHA_ANTERIOR})
- {Cambio historico}

---

## Contribuir

### Proceso

1. Crear branch desde `main`
2. Implementar cambios con tests
3. Ejecutar `npm run build` y `npm test`
4. Crear PR hacia `main`
5. Solicitar review del owner ({AGENTE_OWNER})

### Reglas

- Mantener retrocompatibilidad (o versionar como major)
- Agregar tests para funcionalidad nueva
- Actualizar este README
- Notificar a proyectos consumidores si hay breaking changes

---

## Checklist de Completitud

```markdown
- [ ] Descripcion clara del modulo
- [ ] Instalacion documentada
- [ ] API publica completa con tipos
- [ ] Ejemplos de uso funcionales
- [ ] Dependencias listadas
- [ ] Proyectos consumidores documentados
- [ ] Tests existentes y pasando
- [ ] Changelog actualizado
```

---

**Modulo:** shared/modules/{nombre_modulo}/ | **Owner:** {AGENTE_OWNER}
