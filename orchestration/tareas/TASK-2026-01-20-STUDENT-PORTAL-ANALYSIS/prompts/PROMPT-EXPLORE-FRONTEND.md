# PROMPT: Exploracion Frontend Student Portal

**Tipo de Agente:** Explore Agent
**Nivel de Profundidad:** very thorough
**Fase:** Exploracion Inicial

---

## Prompt Enviado

```
Explore the Student Portal frontend structure in gamilit project.

Focus on:
1. All pages in apps/frontend/src/apps/student/pages/
2. Components used by each page
3. Hooks (custom hooks in hooks/ folders)
4. API calls made by each page/component
5. State management (Zustand stores, React Query)

For each page, identify:
- Page name and route
- Main components used
- API endpoints consumed
- Data flow (how data is fetched and displayed)

Path to explore: /home/isem/workspace-v2/projects/gamilit/apps/frontend/src/

Look for patterns like:
- useQuery, useMutation (React Query)
- api.get, api.post (API calls)
- useStore, create (Zustand)

Output a structured summary of the Student Portal architecture.
```

---

## Contexto Adicional Proporcionado

- Proyecto: gamilit
- Ubicacion: /home/isem/workspace-v2/projects/gamilit/
- Stack: React + TypeScript + React Query + Zustand
- Objetivo: Mapear todas las paginas y sus dependencias

---

## Resultado Esperado

- Lista de 27 paginas identificadas
- Componentes por pagina
- Hooks utilizados
- Endpoints consumidos
- Patrones de estado

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Exploracion de otros portales (Admin, Teacher)
- Analisis de nuevos modulos
- Auditoria de arquitectura frontend

**Parametros Ajustables:**
- `Path to explore`: Cambiar segun el portal o modulo
- `Patterns`: Agregar/quitar segun tecnologias usadas
- `Focus on`: Especificar areas de interes
