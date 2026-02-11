# SIMCO-MCP: Desarrollo de MCP Servers

**Version:** 1.0.0
**Fecha:** 2026-01-04
**Aplica a:** Agentes que desarrollan MCP Servers internos
**Prioridad:** OBLIGATORIA para desarrollo de MCP

---

## RESUMEN EJECUTIVO

> **MCP servers son repositorios independientes. Usar templates, documentar herramientas, registrar en _registry.yml.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════════╗
║  TEMPLATE → DESARROLLAR → DOCUMENTAR → REGISTRAR                         ║
║                                                                           ║
║  1. Usar TEMPLATE-MCP-INTERNO como base                                  ║
║  2. Desarrollar herramientas MCP con validacion                          ║
║  3. Documentar cada tool con ejemplos                                    ║
║  4. Registrar en _registry.yml                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## ESTRUCTURA OBLIGATORIA

Todo MCP server interno debe seguir esta estructura:

```
mcp-{nombre}/
├── README.md                    # Descripcion y uso
├── package.json                 # Dependencias
├── tsconfig.json                # Configuracion TypeScript
├── .env.example                 # Variables de entorno (plantilla)
├── .gitignore                   # Archivos ignorados
│
├── docs/                        # Documentacion
│   ├── ARCHITECTURE.md          # Arquitectura
│   ├── DEPLOYMENT.md            # Despliegue
│   ├── USAGE.md                 # Guia de uso
│   └── MCP-TOOLS-SPEC.md        # Especificacion de herramientas
│
├── orchestration/               # Contexto para agentes
│   └── 00-guidelines/
│       └── CONTEXTO-PROYECTO.md
│
├── src/                         # Codigo fuente
│   ├── index.ts                 # Entry point
│   ├── tools/                   # Herramientas MCP
│   │   ├── index.ts
│   │   └── {tool-name}.ts
│   ├── services/                # Logica de negocio
│   └── utils/                   # Utilidades
│
├── config/                      # Configuraciones
│   └── {config-files}.yml
│
└── tests/                       # Tests
    └── {tool-name}.test.ts
```

---

## PROCESO DE DESARROLLO

### 1. Inicializacion

```bash
# 1. Copiar template
cd /home/isem/workspace-v1/core/mcp-servers/templates
cp -r TEMPLATE-MCP-INTERNO /path/to/new-mcp-repo

# 2. Renombrar placeholders
# Reemplazar {nombre}, {NOMBRE}, {DESCRIPCION}, etc.

# 3. Inicializar repositorio
cd /path/to/new-mcp-repo
git init
npm install

# 4. Configurar .env
cp .env.example .env
# Editar .env con credenciales
```

### 2. Desarrollo de Herramientas

Cada herramienta MCP debe:

```typescript
// src/tools/{tool-name}.ts

/**
 * {tool_name} - {descripcion corta}
 *
 * @description {descripcion detallada}
 * @param {tipo} parametro - descripcion
 * @returns {tipo} descripcion del retorno
 *
 * @example
 * // Ejemplo de uso
 * const result = await tool_name({ param: value });
 */
export async function tool_name(params: ToolParams): Promise<ToolResult> {
  // 1. Validar entrada
  validateParams(params);

  // 2. Ejecutar logica
  const result = await executeLogic(params);

  // 3. Formatear salida
  return formatResult(result);
}

// Schema de parametros (para validacion y documentacion)
export const tool_name_schema = {
  name: "tool_name",
  description: "Descripcion para el agente",
  parameters: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Descripcion del parametro"
      }
    },
    required: ["param1"]
  }
};
```

### 3. Documentacion

Cada herramienta debe documentarse en `docs/MCP-TOOLS-SPEC.md`:

```markdown
## tool_name

### Descripcion
{descripcion detallada}

### Parametros
| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| param1 | string | Si | Descripcion |

### Retorno
```json
{
  "field1": "tipo",
  "field2": "tipo"
}
```

### Ejemplo
```typescript
const result = await tool_name({
  param1: "valor"
});
```

### Errores Comunes
| Codigo | Mensaje | Solucion |
|--------|---------|----------|
| 400 | Invalid param | Verificar formato |
```

### 4. Testing

```typescript
// tests/{tool-name}.test.ts
import { tool_name } from '../src/tools/{tool-name}';

describe('tool_name', () => {
  it('should return expected result for valid input', async () => {
    const result = await tool_name({ param1: 'value' });
    expect(result).toBeDefined();
    expect(result.field1).toBe('expected');
  });

  it('should throw error for invalid input', async () => {
    await expect(tool_name({ param1: '' }))
      .rejects.toThrow('Invalid param');
  });
});
```

### 5. Registro

Agregar a `core/mcp-servers/_registry.yml`:

```yaml
mcp_servers:
  internal:
    {nombre}:
      name: "{Nombre del MCP}"
      description: "{Descripcion}"
      status: "development"  # planned | development | production
      priority: "{alta|maxima}"
      repository:
        type: "gitea"
        url: "git@gitea-server:rckrdmrd/mcp-{nombre}.git"
      clone_path: "core/mcp-servers/internal/{nombre}"
      tools_provided:
        - tool_1
        - tool_2
```

---

## VALIDACIONES OBLIGATORIAS

```bash
# 1. Build
npm run build
# ✅ Sin errores de compilacion

# 2. Lint
npm run lint
# ✅ Sin errores de estilo

# 3. Type check
npm run typecheck
# ✅ Sin errores de tipos

# 4. Tests
npm run test
# ✅ Coverage > 70%

# 5. Health check
npm run start &
curl http://localhost:${PORT}/health
# ✅ Status: ok
```

---

## CONVENCIONES DE NOMENCLATURA

### Nombres de Herramientas

```yaml
formato: "{dominio}_{accion}_{objeto}"
ejemplos:
  - rag_query_context      # RAG: consultar contexto
  - rag_index_document     # RAG: indexar documento
  - taiga_create_epic      # Taiga: crear epic
  - taiga_list_tasks       # Taiga: listar tareas
```

### Nombres de Archivos

```yaml
tools: "kebab-case.ts"
tests: "{tool}.test.ts"
config: "kebab-case.yml"
docs: "UPPER-CASE.md"
```

---

## CHECKLIST

```
ANTES DE INICIAR
├── [ ] Template copiado
├── [ ] Placeholders reemplazados
├── [ ] Repositorio inicializado
├── [ ] Dependencias instaladas

DURANTE DESARROLLO
├── [ ] Cada tool tiene validacion de entrada
├── [ ] Cada tool tiene schema documentado
├── [ ] Cada tool tiene tests
├── [ ] Documentacion actualizada

ANTES DE PUBLICAR
├── [ ] Build exitoso
├── [ ] Lint sin errores
├── [ ] Tests pasan (>70% coverage)
├── [ ] Health check funciona
├── [ ] _registry.yml actualizado
├── [ ] README.md completo
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| "Tool not found" | No registrado en index | Exportar en tools/index.ts |
| "Invalid params" | Schema incorrecto | Verificar tipos en schema |
| "Connection refused" | Puerto en uso | Cambiar PORT en .env |
| "Missing env var" | Variable no configurada | Copiar de .env.example |

---

## REFERENCIAS

- **Template:** `core/mcp-servers/templates/TEMPLATE-MCP-INTERNO/`
- **Registry:** `core/mcp-servers/_registry.yml`
- **Perfil:** @PERFIL_MCP_DEVELOPER
- **Arquitecto:** @PERFIL_MCP_ARCHITECT
- **RAG:** @SIMCO_RAG

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **EPIC:** EPIC-013
