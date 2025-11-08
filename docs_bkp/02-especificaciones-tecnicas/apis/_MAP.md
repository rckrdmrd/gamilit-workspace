# _MAP: docs/02-especificaciones-tecnicas/apis/

**Última actualización:** 2025-11-07
**Propósito:** Especificaciones de APIs REST (endpoints, contratos, OpenAPI)
**Audiencia:** Desarrolladores Backend/Frontend, QA Engineers
**Estado:** 🟡 En desarrollo

---

## 📁 Contenido de esta Carpeta

### Documentos de APIs

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [GAMIFICATION-API.md](./GAMIFICATION-API.md) | Endpoints de gamificación | 🟡 Parcial |
| [TEACHER-PORTAL-API.md](./TEACHER-PORTAL-API.md) | Endpoints del portal de maestros | 🟡 Parcial |
| [ADMIN-PORTAL-API.md](./ADMIN-PORTAL-API.md) | Endpoints del portal de admin | 🟡 Parcial |

**Total documentos:** 3

---

## 🔗 Interdependencias

### Módulos Relacionados

**Implementa endpoints para:**
- [Teacher Portal](../../01-requerimientos/teacher-portal/)
- [Admin Portal](../../01-requerimientos/admin-portal/)
- [Gamificación](../02-gamificacion/)
- [Contenido Educativo](../03-contenido-educativo/)
- [Progreso](../04-progreso-seguimiento/)

### Documentación Relacionada

**Desarrollo:**
- Backend: `apps/backend/src/modules/*/controllers/`

---

## 📊 Métricas

- **Total documentos:** 3
- **APIs documentadas:** 3 (parcialmente)
- **Endpoints documentados:** ~50%
- **Spec OpenAPI:** ⚪ Pendiente

---

## 🎯 Contenido por API

### GAMIFICATION-API.md 🟡

**Endpoints documentados:**
- Achievements
- Rangos Maya
- ML Coins
- Leaderboards (planeado)

**Falta:**
- Referencias a implementación en controllers
- Request/Response schemas completos
- Códigos de error

### TEACHER-PORTAL-API.md 🟡

**Endpoints documentados:**
- Classrooms CRUD
- Assignments CRUD
- Grading
- Analytics (parcial)

**Falta:**
- Referencias a implementación
- Ejemplos de requests/responses
- Autenticación y autorización

### ADMIN-PORTAL-API.md 🟡

**Endpoints documentados:**
- Users CRUD
- Organizations CRUD
- Content management
- System configuration

**Falta:**
- Referencias a implementación
- Permisos requeridos por endpoint
- Audit logging

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. [ ] Agregar referencias a controllers en todos los endpoints
2. [ ] Agregar request/response schemas completos
3. [ ] Documentar autenticación y autorización por endpoint

### Prioridad Media
4. [ ] Crear especificación OpenAPI/Swagger
5. [ ] Agregar ejemplos de uso (curl, JavaScript)
6. [ ] Documentar códigos de error estándar

### Prioridad Baja
7. [ ] Crear API de Autenticación (AUTH-API.md)
8. [ ] Crear API de Progreso (PROGRESS-API.md)
9. [ ] Crear API de Contenido Educativo (CONTENT-API.md)
10. [ ] Crear API de Notificaciones (NOTIFICATIONS-API.md)

---

## ⚠️ Issues Conocidos

- [ ] Documentos actuales no tienen referencias a implementación
- [ ] Falta especificación OpenAPI centralizada
- [ ] No hay ejemplos de requests/responses
- [ ] Autenticación/autorización no documentada por endpoint

---

## 📐 Formato Estándar de Endpoint

### Template Recomendado

```markdown
### POST /api/v1/[resource]

**Descripción:** [Descripción breve]

**Autenticación:** Bearer Token
**Roles permitidos:** `student`, `admin_teacher`, `super_admin`

**Implementación:**
- Controller: `apps/backend/src/modules/[module]/controllers/[name].controller.ts:45`
- Service: `apps/backend/src/modules/[module]/services/[name].service.ts:120`

**Request Body:**
```json
{
  "field1": "string",
  "field2": 123
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "field1": "string",
  "created_at": "2025-11-07T12:00:00Z"
}
```

**Errores:**
- `400 Bad Request` - Validación fallida
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no existe
- `500 Internal Server Error` - Error del servidor

**Ejemplo curl:**
```bash
curl -X POST https://api.gamilit.com/v1/[resource] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field1": "value"}'
```
```

---

## 📚 Recursos sobre API Documentation

**Herramientas:**
- [Swagger/OpenAPI](https://swagger.io/) - Especificación estándar
- [Postman](https://www.postman.com/) - Testing y documentación
- [Insomnia](https://insomnia.rest/) - Alternativa a Postman

**Mejores prácticas:**
- [REST API Best Practices](https://restfulapi.net/)
- [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)

---

## 📖 Guía de Navegación

**Si buscas...**
- **Endpoints de gamificación:** Ver [GAMIFICATION-API.md](./GAMIFICATION-API.md)
- **Endpoints de maestros:** Ver [TEACHER-PORTAL-API.md](./TEACHER-PORTAL-API.md)
- **Endpoints de admin:** Ver [ADMIN-PORTAL-API.md](./ADMIN-PORTAL-API.md)
- **Implementación:** Ver `apps/backend/src/modules/*/controllers/`
