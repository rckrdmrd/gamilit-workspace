# Setup de Desarrollo - Frontend

**Código que mapea:** `apps/frontend/`
**Última actualización:** 2025-11-07
**Tiempo estimado:** 20-30 minutos

---

## 📋 Pre-requisitos

- Node.js 20+
- npm o pnpm

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd apps/frontend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

**Aplicación corriendo en:** http://localhost:5173

---

## 🧪 Verificación

Abrir http://localhost:5173 en el navegador

---

## 📚 Comandos Útiles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build producción
npm run preview      # Preview de build
npm test             # Tests (Vitest)
npm run lint         # Linter
npm run storybook    # Storybook
```

---

## 🔧 Troubleshooting

### Puerto 5173 en uso

**Solución:** Vite asignará otro puerto automáticamente

### Error al conectar con API

**Solución:** Verificar que backend esté corriendo en puerto 3000

---

**Última actualización:** 2025-11-07
