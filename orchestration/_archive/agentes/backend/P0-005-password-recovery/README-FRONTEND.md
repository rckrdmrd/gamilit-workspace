# Password Recovery - Guía para Frontend

**Tarea:** P0-005
**Fecha:** 2025-11-28

## 🎯 Endpoints Disponibles

### 1. Solicitar Reset de Contraseña

**Endpoint:** `POST /auth/reset-password/request`

**Request Body:**
```typescript
{
  email: string; // Email del usuario
}
```

**Response:**
```typescript
{
  message: string; // "Si el email existe en nuestro sistema, recibirás instrucciones..."
}
```

**Status Codes:**
- `200`: Solicitud procesada (siempre retorna 200 por seguridad)
- `400`: Email inválido (falla validación)

**Ejemplo de uso:**
```typescript
const response = await fetch('/auth/reset-password/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'usuario@example.com' })
});

const data = await response.json();
console.log(data.message); // Mostrar en UI
```

### 2. Resetear Contraseña con Token

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```typescript
{
  token: string;        // Token desde URL/email (64 caracteres hex)
  new_password: string; // Nueva contraseña
}
```

**Response:**
```typescript
{
  message: string; // "Contraseña actualizada exitosamente"
}
```

**Status Codes:**
- `200`: Contraseña actualizada
- `400`: Token inválido o expirado
- `400`: Password no cumple validaciones

**Validaciones de Password:**
- Mínimo 8 caracteres
- Máximo 128 caracteres
- Debe contener: mayúsculas, minúsculas, y números/símbolos

**Ejemplo de uso:**
```typescript
const token = new URLSearchParams(window.location.search).get('token');

const response = await fetch('/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: token,
    new_password: 'NewPassword123!'
  })
});

if (response.ok) {
  // Redirigir a login con mensaje de éxito
  navigate('/login?message=password-updated');
} else {
  const error = await response.json();
  // Mostrar error (token expirado, password inválido, etc.)
  showError(error.message);
}
```

## 📧 Flujo de Usuario

### Paso 1: Olvidé mi Contraseña
1. Usuario hace clic en "Olvidé mi contraseña" en página de login
2. Redirige a `/forgot-password`
3. Muestra formulario con campo email

### Paso 2: Solicitar Reset
1. Usuario ingresa email
2. Frontend llama a `POST /auth/reset-password/request`
3. Mostrar mensaje genérico: "Si el email existe, recibirás instrucciones"
4. No revelar si email existe o no (seguridad)

### Paso 3: Email Recibido
1. Usuario recibe email con enlace
2. Enlace apunta a: `/reset-password?token=XXXX`
3. Token tiene 1 hora de validez

### Paso 4: Formulario de Reset
1. Página `/reset-password` extrae token de URL
2. Mostrar formulario con:
   - Input: nueva contraseña
   - Input: confirmar contraseña
   - Mostrar requisitos de password
3. Validar en cliente antes de enviar

### Paso 5: Actualizar Contraseña
1. Frontend llama a `POST /auth/reset-password`
2. Si éxito: redirigir a login con mensaje
3. Si error: mostrar mensaje (token expirado, etc.)

## 🎨 Componentes Necesarios

### ForgotPasswordPage
```tsx
// apps/frontend/src/features/auth/pages/ForgotPasswordPage.tsx

import { useState } from 'react';
import { authAPI } from '../api/authAPI';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestPasswordReset({ email });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      // Mostrar error genérico
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <h2>Revisa tu Email</h2>
        <p>Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recuperar Contraseña</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Instrucciones'}
      </button>
    </form>
  );
};
```

### ResetPasswordPage
```tsx
// apps/frontend/src/features/auth/pages/ResetPasswordPage.tsx

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/authAPI';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <div>Token inválido o faltante</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, new_password: password });
      navigate('/login?message=password-updated');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nueva Contraseña</h2>
      {error && <div className="error">{error}</div>}

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
          minLength={8}
          required
        />
        <small>Mínimo 8 caracteres, con mayúsculas, minúsculas y números</small>
      </div>

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar contraseña"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
      </button>
    </form>
  );
};
```

### API Functions
```typescript
// apps/frontend/src/features/auth/api/authAPI.ts

export const authAPI = {
  // ... existing methods

  requestPasswordReset: async (data: { email: string }) => {
    const response = await apiClient.post('/auth/reset-password/request', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
```

## 🔐 Consideraciones de UX

### Mensajes Genéricos
- **No revelar** si email existe o no (seguridad)
- Siempre mostrar mensaje genérico de "revisa tu email"

### Expiración de Token
- Token válido por **1 hora**
- Mostrar mensaje claro si token expiró
- Ofrecer opción de solicitar nuevo token

### Validación de Password
- Mostrar requisitos antes de enviar
- Validar en tiempo real (feedback visual)
- Mensaje claro si no cumple requisitos

### Manejo de Errores
```typescript
try {
  await authAPI.resetPassword({ token, new_password });
} catch (error) {
  if (error.response?.status === 400) {
    // Token inválido o expirado
    setError('El enlace ha expirado. Solicita uno nuevo.');
  } else {
    setError('Error al actualizar contraseña. Intenta nuevamente.');
  }
}
```

## 🎨 Rutas Sugeridas

```typescript
// app.routes.tsx
{
  path: '/forgot-password',
  element: <ForgotPasswordPage />
},
{
  path: '/reset-password',
  element: <ResetPasswordPage />
}
```

## 📱 Email Template Preview

El email que recibe el usuario tiene:
- Header con logo GAMILIT
- Botón principal "Restablecer Contraseña"
- Link alternativo (copy-paste)
- Advertencia de expiración (1 hora)
- Footer con info de contacto

URL del enlace: `${FRONTEND_URL}/reset-password?token=${token}`

## ✅ Checklist Frontend

- [ ] Crear página ForgotPasswordPage
- [ ] Crear página ResetPasswordPage
- [ ] Agregar métodos en authAPI
- [ ] Configurar rutas en router
- [ ] Agregar link "Olvidé mi contraseña" en LoginPage
- [ ] Implementar validación de password en tiempo real
- [ ] Manejar estados de loading
- [ ] Manejar errores apropiadamente
- [ ] Mostrar mensajes de éxito
- [ ] Testing de flujo completo

---

**Documentación Backend:** Ver archivos en `orchestration/agentes/backend/P0-005-password-recovery/`
