# Integración con API Backend

**Código que mapea:** `apps/frontend/src/services/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta cómo el frontend se integra con el backend API.

---

## 🔌 Cliente HTTP

**Librería:** Axios

**Configuración base:** `apps/frontend/src/services/api/client.ts`

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📁 Servicios por Módulo

| Módulo | Service | Propósito |
|--------|---------|-----------|
| **auth** | auth.service.ts | Login, register, logout |
| **educational** | educational.service.ts | Ejercicios, módulos |
| **gamification** | gamification.service.ts | Achievements, badges |
| **progress** | progress.service.ts | Progreso del estudiante |
| **social** | social.service.ts | Aulas, amigos |
| **notifications** | notifications.service.ts | Notificaciones |

---

## 📝 Ejemplo de Service

```typescript
// services/auth.service.ts
import { apiClient } from './client';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
```

---

## 🎯 Uso en Componentes

```typescript
import { authService } from '@/services/auth.service';

const handleLogin = async () => {
  try {
    const result = await authService.login(email, password);
    // Guardar token, actualizar store
  } catch (error) {
    // Manejar error
  }
};
```

---

## 🔌 WebSocket

**Cliente:** Socket.IO

**Path:** `apps/frontend/src/services/websocket/socket.client.ts`

```typescript
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_WS_URL);

// Escuchar eventos
socket.on('notification', (data) => {
  // Actualizar store de notificaciones
});
```

---

## 📚 Referencias

- [Backend API](../../02-especificaciones-tecnicas/apis/API-REFERENCE.md)

---

**Última actualización:** 2025-11-07
