---
titulo: Portal Teacher - Infrastructure (Error Handling, Rate Limiting, Websockets)
tipo: portal
portal: teacher
seccion: api-reference
archivo: 06-INFRASTRUCTURE
ultima_actualizacion: 2026-02-27
---

# Portal Teacher - Infrastructure

**Version:** 1.3.0
**Parte de:** [Portal Teacher - API Reference](../PORTAL-TEACHER-API-REFERENCE.md)

Cubre: Error Handling, Rate Limiting, Websocket Events, y Changelog.

---

## 11. Error Handling

### 11.1 Codigos de Error Comunes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Validar datos de entrada |
| 401 | Unauthorized | Token invalido o expirado |
| 403 | Forbidden | Sin acceso al recurso |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado o conflicto |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Error | Contactar soporte |

### 11.2 Formato de Error

```json
{
  "statusCode": 403,
  "message": "Teacher does not have access to this classroom",
  "error": "Forbidden",
  "timestamp": "2025-11-29T10:30:00Z",
  "path": "/api/teacher/classrooms/uuid"
}
```

### 11.3 Manejo en Frontend

```typescript
// hooks/useErrorHandler.ts
export function useApiError() {
  const handleError = useCallback((error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message;

    switch (status) {
      case 401:
        // Redirigir a login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tienes acceso a este recurso');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 429:
        toast.error('Demasiadas solicitudes. Intenta de nuevo en un momento.');
        break;
      default:
        toast.error(message || 'Error inesperado');
    }
  }, []);

  return { handleError };
}
```

---

## 12. Rate Limiting

| Endpoint Category | Rate Limit | Window |
|-------------------|------------|--------|
| Dashboard | 60 req | 1 min |
| Analytics | 30 req | 1 min |
| Grading | 100 req | 1 min |
| Reports | 10 req | 1 min |
| Bonus Coins | 20 req | 1 min |

---

## 13. Websocket Events

El Portal Teacher puede suscribirse a eventos en tiempo real:

```typescript
// Suscribirse a eventos
socket.on('student:submission', (data) => {
  // Nueva submission recibida
  queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions'] });
});

socket.on('student:alert', (data) => {
  // Nueva alerta de estudiante
  queryClient.invalidateQueries({ queryKey: ['teacher', 'alerts'] });
  toast.warning(`Alerta: ${data.message}`);
});

socket.on('student:progress', (data) => {
  // Estudiante completo ejercicio
  queryClient.invalidateQueries({
    queryKey: ['teacher', 'classrooms', data.classroom_id, 'progress']
  });
});
```

---

## Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.3.0 | 2026-02-21 | Added Frontend column to controller table. Marked TeacherCommunicationController and TeacherContentController as disconnected from frontend (v3.1.0 cleanup). Resource Sharing endpoints still connected via resourceSharingApi.ts |
| 1.2.0 | 2026-02-21 | Fixed TeacherContentController endpoint count (11->13, actual count from source), added 3 missing controllers (TeacherAssignments, AlertConfig, ManualReview), updated total (51->63+) |
| 1.1.0 | 2026-02-21 | Added 6 Resource Sharing endpoints (section 10), updated endpoint counts (45->51, TeacherContentController 5->11) |
| 1.0.0 | 2025-11-29 | Creacion inicial |
