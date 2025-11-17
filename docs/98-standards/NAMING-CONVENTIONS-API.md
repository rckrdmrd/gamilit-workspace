# Convenciones de Nombres - APIs y Payloads

**Versión:** 1.0.0
**Fecha:** 2025-11-16
**Estado:** Activo

---

## 🎯 Propósito

Este documento establece las convenciones de nombres para **payloads de API**, **DTOs** y **comunicación Frontend-Backend** en el proyecto GAMILIT.

**Objetivo:** Evitar errores 500 por incompatibilidad de nombres de campos entre Frontend y Backend.

---

## 📋 Regla General

### Backend (NestJS + PostgreSQL)
✅ **Usar snake_case** para todos los campos de API

**Razón:**
- PostgreSQL usa snake_case por convención
- NestJS DTOs se mapean directamente a columnas de DB
- Consistencia entre DB → Backend → Frontend

### Frontend (React + TypeScript)
✅ **Usar snake_case al comunicarse con Backend**
⚠️ Internamente puede usar camelCase, pero **SIEMPRE transformar antes de enviar a API**

---

## 🔑 Casos Específicos

### 1. Registro de Usuario (Público)

**Backend espera** (RegisterUserDto):
```typescript
{
  email: string,         // required
  password: string,      // required
  first_name?: string,   // optional, snake_case
  last_name?: string,    // optional, snake_case
  // role NOT accepted (assigned automatically as 'student')
}
```

**Frontend DEBE enviar:**
```typescript
// ✅ CORRECTO
const payload = {
  email: data.email,
  password: data.password,
  first_name: firstName,
  last_name: lastName
};

// ❌ INCORRECTO
const payload = {
  email: data.email,
  password: data.password,
  firstName: firstName,    // ❌ camelCase
  lastName: lastName,      // ❌ camelCase
  role: 'student'          // ❌ campo NO aceptado
};
```

### 2. Creación de Usuario (Admin)

**Backend espera** (CreateUserDto - admin only):
```typescript
{
  email: string,
  password: string,
  first_name?: string,
  last_name?: string,
  role: 'student' | 'admin_teacher' | 'super_admin'  // Admin CAN set role
}
```

**Diferencia clave:**
- **Registro público:** NO acepta `role` (asignado automáticamente)
- **Creación admin:** SÍ acepta `role` (admin puede asignar roles)

### 3. Actualización de Perfil

**Backend espera:**
```typescript
{
  first_name?: string,
  last_name?: string,
  display_name?: string,
  avatar_url?: string
}
```

**Nunca usar:**
- ❌ `firstName` (debe ser `first_name`)
- ❌ `lastName` (debe ser `last_name`)
- ❌ `displayName` (debe ser `display_name`)
- ❌ `avatarUrl` (debe ser `avatar_url`)

---

## 🚨 Errores Comunes

### Error 1: camelCase en lugar de snake_case
```typescript
// ❌ INCORRECTO - causa 500 error
await apiClient.post('/auth/register', {
  email: "user@example.com",
  password: "pass123",
  firstName: "John",     // ❌ Backend no reconoce este campo
  lastName: "Doe"        // ❌ Backend no reconoce este campo
});

// ✅ CORRECTO
await apiClient.post('/auth/register', {
  email: "user@example.com",
  password: "pass123",
  first_name: "John",    // ✅ Backend reconoce este campo
  last_name: "Doe"       // ✅ Backend reconoce este campo
});
```

### Error 2: Enviar campo `role` en registro público
```typescript
// ❌ INCORRECTO - Backend rechaza el campo 'role'
await apiClient.post('/auth/register', {
  email: "user@example.com",
  password: "pass123",
  first_name: "John",
  last_name: "Doe",
  role: "student"        // ❌ Backend NO acepta esto (auto-asignado)
});

// ✅ CORRECTO
await apiClient.post('/auth/register', {
  email: "user@example.com",
  password: "pass123",
  first_name: "John",
  last_name: "Doe"
  // role omitido - Backend lo asigna automáticamente
});
```

### Error 3: Campos opcionales como requeridos
```typescript
// ❌ INCORRECTO - forzar campos opcionales
const payload = {
  email: data.email,
  password: data.password,
  first_name: firstName || "",   // ❌ No enviar string vacío
  last_name: lastName || ""       // ❌ No enviar string vacío
};

// ✅ CORRECTO - solo enviar si tienen valor
const payload = {
  email: data.email,
  password: data.password,
  ...(firstName && { first_name: firstName }),
  ...(lastName && { last_name: lastName })
};
```

---

## 📊 Tabla de Referencia Rápida

| Campo Frontend | Campo Backend | Uso |
|----------------|---------------|-----|
| email | email | ✅ Igual |
| password | password | ✅ Igual |
| firstName | first_name | ⚠️ Transformar a snake_case |
| lastName | last_name | ⚠️ Transformar a snake_case |
| displayName | display_name | ⚠️ Transformar a snake_case |
| avatarUrl | avatar_url | ⚠️ Transformar a snake_case |
| phoneNumber | phone_number | ⚠️ Transformar a snake_case |
| dateOfBirth | date_of_birth | ⚠️ Transformar a snake_case |
| role | role | ⚠️ Solo en endpoints admin |

---

## 🛠️ Implementación en Frontend

### Función Helper para Transformar

```typescript
/**
 * Transforma objeto de camelCase a snake_case para enviar a Backend
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convertir camelCase a snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = value;
  }
  
  return result;
}

// Uso
const frontendData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com"
};

const backendPayload = toSnakeCase(frontendData);
// { first_name: "John", last_name: "Doe", email: "john@example.com" }
```

### Mapping Manual (Recomendado)

```typescript
// ✅ MEJOR PRÁCTICA: Mapping explícito
const backendPayload = {
  email: frontendData.email,
  password: frontendData.password,
  first_name: frontendData.firstName,
  last_name: frontendData.lastName
};

// Beneficios:
// - Type-safe
// - Explícito y fácil de leer
// - Control total de qué campos enviar
```

---

## 📝 Validación en Desarrollo

### Backend (NestJS)

```typescript
// class-validator rechaza campos no definidos
export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  first_name?: string;  // ✅ snake_case definido

  @IsString()
  @IsOptional()
  last_name?: string;   // ✅ snake_case definido
  
  // firstName NO definido → Backend rechazará con 400
  // role NO definido en registro público → Backend rechazará con 400
}
```

### Frontend (TypeScript)

```typescript
// Tipos para Backend API
export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;  // ✅ snake_case
  last_name?: string;   // ✅ snake_case
}

// Tipos internos del Frontend (pueden usar camelCase)
export interface RegisterFormData {
  email: string;
  password: string;
  firstName?: string;   // camelCase interno
  lastName?: string;    // camelCase interno
}

// Función de transformación
function toBackendPayload(data: RegisterFormData): RegisterPayload {
  return {
    email: data.email,
    password: data.password,
    first_name: data.firstName,
    last_name: data.lastName
  };
}
```

---

## 🔍 Testing

### Test de Convención

```typescript
describe('API Payload Conventions', () => {
  it('should use snake_case for backend API calls', async () => {
    const payload = {
      email: 'test@example.com',
      password: 'Test123!',
      first_name: 'John',
      last_name: 'Doe'
    };
    
    // Verificar que NO hay camelCase
    expect(payload).not.toHaveProperty('firstName');
    expect(payload).not.toHaveProperty('lastName');
    
    // Verificar snake_case
    expect(payload).toHaveProperty('first_name');
    expect(payload).toHaveProperty('last_name');
  });
});
```

---

## 📚 Referencias

**Documentos relacionados:**
- [RegisterUserDto](../../apps/backend/src/modules/auth/dto/register-user.dto.ts)
- [API-CHEATSHEET.md](../96-quick-reference/API-CHEATSHEET.md)
- [US-FUND-001](../01-fase-alcance-inicial/EAI-001-fundamentos/historias-usuario/US-FUND-001-autenticacion-basica-jwt.md)

**Correcciones aplicadas:**
- FE-053: Fix Register 500 Error (2025-11-16)
- Docs: API-CHEATSHEET.md actualizado (2025-11-16)
- Docs: US-FUND-001 actualizado (2025-11-16)

---

**Creado:** 2025-11-16
**Última actualización:** 2025-11-16
**Responsable:** Tech Lead
**Estado:** ✅ Activo
