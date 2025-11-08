# Frontend Auth Context Integration Guide

## Overview
This guide explains how to integrate the newly created authentication system into your GAMILIT frontend application.

## Files Created

### 1. Auth Types (`src/shared/types/auth.types.ts`) - 43 lines
Consolidated TypeScript interfaces for authentication:
- `User` - User profile interface
- `LoginCredentials` - Login form data
- `RegisterData` - Registration form data
- `AuthResponse` - API response structure
- `AuthState` - Internal auth state
- `AuthContextType` - Context API interface

### 2. Auth Context (`src/app/providers/AuthContext.tsx`) - 262 lines
Complete authentication context provider with:
- **User State Management**: Tracks current user and authentication status
- **Persistent Auth**: Automatically loads user on mount if token exists
- **Login/Register**: Full authentication flow with error handling
- **Logout**: Clears user state and tokens
- **Profile Refresh**: Re-fetch user data from API
- **Error Handling**: Comprehensive error states with clearError method
- **Loading States**: isLoading flag for async operations

### 3. Protected Route Component (`src/shared/components/ProtectedRoute.tsx`) - 135 lines
Route protection component featuring:
- **Authentication Guard**: Blocks unauthenticated users
- **Role-Based Access Control (RBAC)**: Optional role restrictions
- **Loading State**: Shows spinner while checking auth status
- **Smart Redirects**: Preserves intended destination for post-login redirect
- **UnauthorizedPage**: Default 403 page for insufficient permissions

### 4. Barrel Exports
- `src/app/providers/index.ts` - Exports AuthProvider, useAuth, AuthContext
- `src/shared/types/index.ts` - Exports all auth types
- Updated `src/shared/components/index.ts` - Added ProtectedRoute export

## Component Features Summary

### AuthProvider Features
- ✅ Auto-loads user profile on app startup
- ✅ Persists authentication across page refreshes
- ✅ Integrates with existing authApi (login, register, logout, getProfile)
- ✅ Handles token storage via localStorage
- ✅ Provides error state management
- ✅ Type-safe with full TypeScript support
- ✅ React 18 compatible with StrictMode

### ProtectedRoute Features
- ✅ Authentication requirement enforcement
- ✅ Role-based access control (optional)
- ✅ Loading state with spinner
- ✅ Automatic redirect to login
- ✅ Preserves intended destination
- ✅ Custom redirect paths
- ✅ Includes UnauthorizedPage component

## Integration Instructions

### Step 1: Wrap Application with AuthProvider

Update `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/app/providers';
import App from './App';
import './shared/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

### Step 2: Set Up React Router (if not already done)

Install react-router-dom (already in package.json):
```bash
npm install react-router-dom
```

Update `src/App.tsx` with routing:

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, UnauthorizedPage } from '@components';

// Import your pages (to be created)
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with role restriction */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 3: Use Auth in Components

#### Example: Login Form Component

```tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Button, Input } from '@components';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });

      // Redirect to intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is already set in context
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
```

#### Example: Using Auth State in Header

```tsx
import React from 'react';
import { useAuth } from '@/app/providers';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Button } from '@components';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">GAMILIT</Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user?.role === 'admin' && (
                <Link to="/admin">Admin</Link>
              )}
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatar} alt={user?.email} />
                <span>{user?.email}</span>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
```

#### Example: Register Form

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Button, Input } from '@components';

export const RegisterForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <Input
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="First Name"
      />

      <Input
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Last Name"
      />

      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
};
```

### Step 4: Advanced Usage - Profile Refresh

```tsx
import { useAuth } from '@/app/providers';

function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const handleProfileUpdate = async (updatedData: any) => {
    // Update profile via API
    await updateProfileApi(updatedData);

    // Refresh user data in context
    await refreshUser();
  };

  return (
    <div>
      <h1>Profile: {user?.email}</h1>
      {/* Profile form */}
    </div>
  );
}
```

### Step 5: Testing Auth Flow

1. **Test Login Flow**:
   - Navigate to `/login`
   - Enter credentials
   - Should redirect to `/dashboard` on success
   - Token should persist in localStorage

2. **Test Protected Routes**:
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`
   - Location state should preserve intended destination

3. **Test Role-Based Access**:
   - Login as regular user
   - Try accessing `/admin`
   - Should redirect to `/unauthorized`

4. **Test Logout**:
   - Click logout button
   - User state should clear
   - Should redirect to login page

## Next Steps

### 1. Create Page Components
- `src/pages/LoginPage.tsx` - Login page with LoginForm
- `src/pages/RegisterPage.tsx` - Registration page with RegisterForm
- `src/pages/DashboardPage.tsx` - Main dashboard after login
- `src/pages/HomePage.tsx` - Landing page
- `src/pages/AdminPage.tsx` - Admin panel (role-protected)

### 2. Create Form Components
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/auth/components/ForgotPasswordForm.tsx` (optional)

### 3. Enhance Auth Features (Optional)
- Password reset flow
- Email verification flow
- Remember me functionality
- Social authentication (OAuth)
- Multi-factor authentication (MFA)
- Session timeout handling

### 4. Create Dashboard Layout
- Protected layout wrapper
- Sidebar navigation
- User profile dropdown
- Notification system

### 5. Add Loading and Error States
- Global loading indicator
- Toast notifications for auth events
- Error boundary for auth failures

## API Integration Notes

The AuthContext already integrates with:
- `authApi.login()` - Handles token storage automatically
- `authApi.register()` - Handles token storage automatically
- `authApi.logout()` - Clears tokens from storage
- `authApi.getProfile()` - Fetches current user data
- `authApi.refreshToken()` - Handled by axios interceptors in client.ts

The token refresh logic is already implemented in `src/lib/api/client.ts` and works automatically.

## TypeScript Usage

All components are fully typed. Use the exported types:

```tsx
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthContextType,
  AuthState
} from '@/shared/types/auth.types';
```

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"
**Solution**: Ensure `<AuthProvider>` wraps your app in `main.tsx`

### Issue: Infinite redirect loop
**Solution**: Make sure `/login` route is NOT wrapped in `<ProtectedRoute>`

### Issue: User state not persisting
**Solution**: Check browser localStorage for `access_token`. Verify API is returning proper tokens.

### Issue: 401 errors after token expires
**Solution**: The refresh token logic in `client.ts` should handle this automatically. Check that refresh_token is stored.

## Security Considerations

1. **Token Storage**: Currently using localStorage. Consider httpOnly cookies for production.
2. **HTTPS Only**: Always use HTTPS in production for token transmission.
3. **Token Expiry**: Implement proper token expiration handling.
4. **XSS Protection**: Sanitize all user inputs to prevent XSS attacks.
5. **CSRF Protection**: Implement CSRF tokens for state-changing operations.

## Current Project Status

**Completed:**
- ✅ Auth API endpoints (`src/lib/api/auth.api.ts`)
- ✅ Axios client with interceptors (`src/lib/api/client.ts`)
- ✅ Auth types and interfaces
- ✅ Auth Context Provider
- ✅ useAuth custom hook
- ✅ ProtectedRoute component
- ✅ UnauthorizedPage component
- ✅ Barrel exports

**To Be Created:**
- ⏳ Login page and form
- ⏳ Register page and form
- ⏳ Dashboard page
- ⏳ Router setup in App.tsx
- ⏳ Auth form validation
- ⏳ Error handling UI
- ⏳ Loading indicators

## Example Project Structure

```
apps/frontend/src/
├── app/
│   ├── providers/
│   │   ├── AuthContext.tsx     ✅ Created
│   │   └── index.ts            ✅ Created
│   └── routes/                 ⏳ To create
├── features/
│   └── auth/
│       └── components/         ⏳ To create
│           ├── LoginForm.tsx
│           └── RegisterForm.tsx
├── lib/
│   └── api/
│       ├── auth.api.ts         ✅ Exists
│       └── client.ts           ✅ Exists
├── pages/                      ⏳ To create
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── HomePage.tsx
├── shared/
│   ├── components/
│   │   ├── ProtectedRoute.tsx  ✅ Created
│   │   └── index.ts            ✅ Updated
│   └── types/
│       ├── auth.types.ts       ✅ Created
│       └── index.ts            ✅ Created
├── App.tsx                     ⏳ Update with routes
└── main.tsx                    ⏳ Update with AuthProvider
```

---

**Generated**: 2025-11-02
**Role**: SA-FRONTEND-AUTH
**Status**: Core auth infrastructure complete, ready for integration
