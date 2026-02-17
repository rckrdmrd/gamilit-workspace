# Setup de Desarrollo Frontend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/frontend/

---

## Requisitos Previos

- Node.js v18+ (recomendado v20 LTS)
- npm v9+ o pnpm
- Git
- Backend de GAMILIT corriendo (ver [../../backend/impl/SETUP-DEVELOPMENT.md](../../backend/impl/SETUP-DEVELOPMENT.md))

---

## Instalación Inicial

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd gamilit
```

### 2. Instalar Dependencias

```bash
# Desde la raíz del monorepo
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar template
cp apps/frontend/.env.example apps/frontend/.env

# Editar con tus valores
nano apps/frontend/.env
```

### Variables Requeridas

```env
# API Backend
VITE_API_URL=http://localhost:3000/api/v1

# WebSocket
VITE_WS_URL=http://localhost:3000

# Environment
VITE_ENV=development
```

---

## Ejecutar Frontend

### Modo Desarrollo (con hot-reload)

```bash
# Desde raíz del monorepo
npm run dev:frontend

# O desde apps/frontend
cd apps/frontend
npm run dev
```

El servidor de desarrollo estará en: `http://localhost:5173`

### Modo Producción (build)

```bash
npm run build:frontend

# Previsualizar build
npm run preview:frontend
```

---

## Verificar Instalación

1. Abrir `http://localhost:5173` en el navegador
2. Verificar que la página de login carga correctamente
3. Verificar conexión con backend (network tab)

---

## Estructura del Proyecto

```
apps/frontend/
├── public/                  # Archivos estáticos
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component
│   ├── router/             # React Router config
│   │   └── index.tsx
│   ├── features/           # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── exercises/
│   │   ├── gamification/
│   │   └── ...
│   ├── shared/             # Shared code
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── utils/
│   │   └── types/
│   └── styles/             # Global styles
│       └── globals.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Build para producción |
| `npm run preview` | Previsualizar build |
| `npm run test` | Ejecutar tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con coverage |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear con Prettier |
| `npm run type-check` | Verificar tipos TypeScript |

---

## Configuración de IDE

### VS Code Extensions Recomendadas

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Path Intellisense

### Settings Recomendadas

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## Debugging

### React DevTools

1. Instalar extensión de Chrome: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
2. Abrir DevTools → Components tab

### React Query DevTools

Ya incluido en desarrollo. Aparece un botón flotante en la esquina inferior derecha.

### VS Code Debugger

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/frontend/src"
    }
  ]
}
```

---

## Desarrollo con Backend

### Proxy Configuration

Si necesitas proxy para evitar CORS en desarrollo:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Ejecutar Frontend + Backend

```bash
# Desde raíz del monorepo
npm run dev  # Ejecuta ambos en paralelo

# O en terminales separadas
npm run dev:backend
npm run dev:frontend
```

---

## Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con UI de Vitest
npm run test:ui

# Coverage
npm run test:coverage
```

### Escribir Tests

```typescript
// features/gamification/components/__tests__/RankBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { RankBadge } from '../RankBadge';

describe('RankBadge', () => {
  it('renders rank name', () => {
    const rank = { name: 'Ajaw', iconUrl: '/icons/ajaw.png' };
    render(<RankBadge rank={rank} />);

    expect(screen.getByText('Ajaw')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Error: Module not found

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: Port 5173 already in use

```bash
# Encontrar proceso
lsof -i :5173

# Matar proceso
kill -9 <PID>
```

### Error: CORS

- Verificar que `VITE_API_URL` apunta al backend correcto
- Verificar que el backend tiene CORS configurado

### Error: TypeScript

```bash
# Verificar tipos
npm run type-check
```

### Hot reload no funciona

- Verificar que no hay errores de TypeScript
- Reiniciar el servidor de desarrollo
- Limpiar cache de Vite: `rm -rf node_modules/.vite`

---

## Desarrollar Nuevas Features

### 1. Crear Estructura

```bash
mkdir -p src/features/nueva-feature/{components,hooks,services,types}
```

### 2. Crear Archivos Base

```typescript
// src/features/nueva-feature/index.ts
export { MiComponente } from './components/MiComponente';
export { useMiHook } from './hooks/useMiHook';
```

### 3. Registrar Rutas

```typescript
// src/router/index.tsx
import { NuevaFeaturePage } from '@/features/nueva-feature/pages/NuevaFeaturePage';

const routes = [
  // ...existing routes
  { path: '/nueva-feature', element: <NuevaFeaturePage /> },
];
```

---

## Ver También

- [ESTRUCTURA-FEATURES.md](./ESTRUCTURA-FEATURES.md) - Estructura de features
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Zustand y React Query
- [API-INTEGRATION.md](./API-INTEGRATION.md) - Conexión con backend
- [../../deployment/DEV-SERVERS.md](../../deployment/DEV-SERVERS.md) - Servidores de desarrollo
