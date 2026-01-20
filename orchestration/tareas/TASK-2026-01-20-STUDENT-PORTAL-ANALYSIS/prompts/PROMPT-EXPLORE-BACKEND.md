# PROMPT: Exploracion Backend Endpoints

**Tipo de Agente:** Explore Agent
**Nivel de Profundidad:** very thorough
**Fase:** Exploracion Inicial

---

## Prompt Enviado

```
Explore the backend API structure related to Student Portal in gamilit project.

Focus on:
1. Controllers in apps/backend/src/modules/
2. Endpoints exposed (GET, POST, PUT, DELETE)
3. Response structures (DTOs)
4. Services called by controllers
5. Database entities accessed

Modules to prioritize:
- gamification/ (ranks, achievements, missions, rewards)
- educational/ (exercises, progress, lessons)
- users/ (profile, preferences)

For each endpoint, identify:
- HTTP method and path
- Request parameters/body
- Response structure
- Service method called

Path to explore: /home/isem/workspace-v2/projects/gamilit/apps/backend/src/

Look for patterns like:
- @Controller, @Get, @Post decorators
- Return types and DTOs
- TransformResponseInterceptor usage

Output a structured inventory of endpoints relevant to Student Portal.
```

---

## Contexto Adicional Proporcionado

- Framework: NestJS
- ORM: TypeORM
- Database: PostgreSQL
- Interceptor: TransformResponseInterceptor (wraps responses in {success, data, timestamp})

---

## Resultado Esperado

- 80+ endpoints identificados
- Estructura de respuesta por endpoint
- Mapeo controller -> service -> entity
- Identificacion de wrappers y transformers

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Documentacion de APIs
- Validacion de coherencia FE-BE
- Generacion de inventarios de endpoints

**Parametros Ajustables:**
- `Modules to prioritize`: Segun el portal analizado
- `Patterns`: Agregar decoradores custom si existen
- `Focus on`: Especificar aspectos (seguridad, validacion, etc.)
