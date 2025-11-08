# Setup e Instalación - Dashboard Estudiante

Guía paso a paso para configurar y ejecutar el Dashboard Estudiante Responsive.

---

## Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0 o yarn >= 1.22.0
- Git

---

## 1. Verificar Dependencias

El proyecto ya incluye todas las dependencias necesarias en `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.4",
    "framer-motion": "^12.23.24",
    "lucide-react": "^0.545.0",
    "axios": "^1.12.2",
    "tailwindcss": "^4.1.14"
  }
}
```

### Instalar Dependencias

```bash
cd /home/isem/workspace/glit-platform-v2
npm install
```

---

## 2. Configuración del Proyecto

### Verificar Tailwind Config

El archivo `tailwind.config.js` debe incluir los colores del Detective Theme:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Detective Theme colors ya configurados
        'detective-orange': '#f97316',
        'detective-gold': '#f59e0b',
        // ... más colores
      },
    },
  },
};
```

### Verificar Path Aliases

En `tsconfig.json` o `vite.config.ts`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@apps/*": ["src/apps/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

---

## 3. Estructura de Archivos

Verificar que la estructura esté completa:

```bash
ls -R src/apps/student/
```

Deberías ver:
- `components/dashboard/` (8 archivos)
- `components/notifications/` (2 archivos)
- `components/interactions/` (1 archivo)
- `hooks/` (3 archivos)
- `pages/DashboardHome.tsx`

---

## 4. Configurar Rutas

### Opción A: Reemplazar DashboardPage existente

```typescript
// En tu archivo de rutas principal
import DashboardHome from '@apps/student/pages/DashboardHome';

<Routes>
  <Route path="/" element={<DashboardHome />} />
  <Route path="/dashboard" element={<DashboardHome />} />
</Routes>
```

### Opción B: Agregar nueva ruta

```typescript
import DashboardPage from '@apps/student/pages/DashboardPage';  // Antigua
import DashboardHome from '@apps/student/pages/DashboardHome';  // Nueva

<Routes>
  <Route path="/" element={<DashboardHome />} />
  <Route path="/dashboard-old" element={<DashboardPage />} />
</Routes>
```

---

## 5. Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173` (por defecto con Vite)

### Build para Producción

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

---

## 6. Verificar Funcionamiento

### Checklist de Verificación

1. **Navegación Móvil**
   - [ ] Abrir en dispositivo móvil o responsive mode
   - [ ] Verificar que aparezca bottom navigation
   - [ ] Hacer clic en cada ítem del menú
   - [ ] Verificar animaciones de estado activo

2. **Widgets de Gamificación**
   - [ ] Verificar que MLCoinsWidget muestre datos
   - [ ] Verificar animación del contador
   - [ ] Verificar que RankProgressWidget muestre rango
   - [ ] Verificar barra de progreso animada

3. **Responsive Design**
   - [ ] Mobile (< 768px): 1 columna, bottom nav
   - [ ] Tablet (768-1023px): 2 columnas, sidebar colapsable
   - [ ] Desktop (1024-1399px): 3 columnas, sidebar fijo
   - [ ] Wide (> 1400px): 4 columnas, panel lateral

4. **Swipe Gestures**
   - [ ] Pull-to-refresh funciona
   - [ ] Feedback visual aparece
   - [ ] Datos se actualizan

5. **Keyboard Navigation** (Desktop)
   - [ ] `g h` navega a Home
   - [ ] `g m` navega a Modules
   - [ ] `g p` navega a Profile
   - [ ] Tab navega entre elementos
   - [ ] Focus indicators visibles

---

## 7. Configuración Opcional

### Habilitar API Real

Editar `src/apps/student/hooks/useDashboardData.ts`:

```typescript
// Descomentar las llamadas API reales
const [coinsRes, rankRes, achievementsRes, progressRes] = await Promise.all([
  axios.get(`${API_URL}/api/gamification/coins/${userId}`),
  // ... más endpoints
]);

// Comentar el fallback de mock data
// setData(getMockDashboardData());
```

### Configurar Variables de Entorno

Crear `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

Usar en el código:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## 8. Troubleshooting

### Error: "Module not found"

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module '@apps/student'"

Verificar path aliases en `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@apps': path.resolve(__dirname, './src/apps'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### Animaciones no funcionan

Verificar que Framer Motion esté instalado:

```bash
npm list framer-motion
```

Si no está instalado:

```bash
npm install framer-motion@^12.23.24
```

### Estilos de Tailwind no aparecen

Verificar que el archivo CSS principal incluya las directivas:

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Bottom Navigation no aparece

Verificar que estás en vista móvil:

```typescript
// El bottom nav solo aparece en móvil
const { isMobile } = useResponsiveLayout();
// isMobile debe ser true para ver bottom nav
```

---

## 9. Testing Manual

### Dispositivos a Probar

1. **Mobile**
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Samsung Galaxy S21 (360px)

2. **Tablet**
   - iPad (768px)
   - iPad Pro (1024px)

3. **Desktop**
   - Laptop (1366px)
   - Desktop (1920px)
   - Ultra-wide (2560px)

### Navegadores a Probar

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS/macOS)
- [ ] Samsung Internet (Android)

---

## 10. Optimización de Desarrollo

### Hot Module Replacement (HMR)

Vite incluye HMR por defecto. Los cambios se reflejarán automáticamente.

### TypeScript Strict Mode

El proyecto usa TypeScript strict mode. Verificar errores:

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

---

## 11. Deploy

### Build Optimizado

```bash
npm run build
```

Esto genera los archivos en `dist/` listos para producción.

### Análisis de Bundle

```bash
npm run build -- --mode analyze
```

### Deploy a Vercel/Netlify

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## 12. Monitoreo y Debug

### React DevTools

Instalar extensión de React DevTools en el navegador para inspeccionar componentes.

### Framer Motion DevTools

```bash
npm install framer-motion-devtools --save-dev
```

Agregar al componente raíz:

```typescript
import { AnimatePresence } from 'framer-motion';
import { DevTools } from 'framer-motion-devtools';

<>
  <DevTools />
  <App />
</>
```

### Performance Profiling

Usar React Profiler en DevTools:
1. Abrir React DevTools
2. Ir a tab "Profiler"
3. Hacer clic en "Record"
4. Interactuar con la app
5. Hacer clic en "Stop"
6. Analizar flamegraph

---

## 13. Recursos de Ayuda

### Documentación del Proyecto
- `README.md` - Documentación completa
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico
- `USAGE_EXAMPLES.md` - Ejemplos de uso
- `CHECKLIST.md` - Lista de verificación

### Documentación Externa
- [React 19 Docs](https://react.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)

### Contacto y Soporte

Para preguntas o problemas:
1. Revisar documentación del proyecto
2. Buscar en issues de GitHub
3. Contactar al equipo de desarrollo

---

## 14. Comandos Rápidos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Limpiar y reinstalar
rm -rf node_modules && npm install
```

---

## 15. Siguiente Nivel

Una vez que el dashboard funcione correctamente:

1. **Integración Backend**
   - Conectar endpoints reales
   - Implementar autenticación
   - Manejar estados de error

2. **Testing**
   - Agregar tests unitarios
   - Implementar E2E tests
   - Testing de accesibilidad

3. **Optimización**
   - Code splitting
   - Lazy loading de rutas
   - Image optimization
   - Service workers

4. **Analytics**
   - Google Analytics
   - Custom event tracking
   - Performance monitoring

---

## Estado Actual

✓ Todos los componentes implementados
✓ Mock data funcionando
✓ Responsive design completo
✓ Animaciones implementadas
✓ Accesibilidad WCAG 2.1 AA

**Listo para desarrollo local y testing!**

---

¿Problemas? Revisa el archivo `TROUBLESHOOTING.md` o contacta al equipo.
