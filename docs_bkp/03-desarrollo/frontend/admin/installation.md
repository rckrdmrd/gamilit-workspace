# Admin Panel Installation Guide

## Prerequisites

- Node.js 18+ installed
- React 18+ project setup
- TypeScript configured
- Tailwind CSS configured
- Chart.js library

## Installation Steps

### 1. Install Dependencies

```bash
npm install chart.js react-chartjs-2 framer-motion lucide-react
```

### 2. Verify Project Structure

Ensure the following directory structure exists:

```
src/apps/admin/
├── pages/
├── components/
│   ├── monitoring/
│   ├── content/
│   └── advanced/
└── hooks/
```

### 3. Configure Routes

Add the following routes to your router configuration:

```typescript
import {
  AdminDashboard,
  SystemMonitoring,
  ContentManagement,
  AdvancedAdmin
} from '@apps/admin';

// In your router file
const routes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    meta: { requiresAuth: true, role: 'super_admin' }
  },
  {
    path: '/admin/monitoring',
    element: <SystemMonitoring />,
    meta: { requiresAuth: true, role: 'super_admin' }
  },
  {
    path: '/admin/content',
    element: <ContentManagement />,
    meta: { requiresAuth: true, role: 'super_admin' }
  },
  {
    path: '/admin/advanced',
    element: <AdvancedAdmin />,
    meta: { requiresAuth: true, role: 'super_admin' }
  }
];
```

### 4. Configure API Endpoints

Ensure your backend has the following endpoints configured:

#### Monitoring
- `GET /api/health/detailed`
- `GET /api/admin/metrics`
- `GET /api/admin/activity`
- `GET /api/admin/errors`

#### Content Management
- `GET /api/educational/exercises`
- `POST /api/educational/exercises`
- `POST /api/admin/media`
- `GET /api/admin/approvals`

#### Advanced Administration
- `GET /api/admin/tenants`
- `GET /api/admin/feature-flags`
- `GET /api/admin/experiments`
- `POST /api/admin/economy/intervene`

### 5. Configure Environment Variables

Add to your `.env` file:

```env
# Admin Panel Configuration
VITE_ADMIN_REFRESH_INTERVAL=30000
VITE_ADMIN_METRICS_RETENTION=60
VITE_MAX_FILE_UPLOAD_SIZE=10485760
```

### 6. Setup Permissions

Ensure your authentication system includes the `super_admin` role:

```typescript
// In your auth context or middleware
const hasAdminAccess = (user) => {
  return user.role === 'super_admin';
};
```

### 7. Initialize Chart.js

Register Chart.js components (already done in MetricsChart.tsx):

```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

## Verification

### Test Individual Components

```typescript
// Test SystemPerformanceDashboard
import { SystemPerformanceDashboard } from '@apps/admin/components/monitoring';

function Test() {
  return <SystemPerformanceDashboard />;
}
```

### Test Hooks

```typescript
import { useSystemMetrics } from '@apps/admin/hooks';

function Test() {
  const { metrics, loading } = useSystemMetrics();
  console.log('Metrics:', metrics);
  return <div>Check console</div>;
}
```

### Test API Integration

```bash
# Test health endpoint
curl http://localhost:3000/api/health/detailed

# Test metrics endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/metrics
```

## Troubleshooting

### Issue: Chart.js not rendering

**Solution:**
```bash
npm install chart.js react-chartjs-2
```

### Issue: Icons not showing

**Solution:**
```bash
npm install lucide-react
```

### Issue: Animations not working

**Solution:**
```bash
npm install framer-motion
```

### Issue: Tailwind classes not applying

**Solution:** Ensure Tailwind config includes admin directory:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/apps/admin/**/*.{js,jsx,ts,tsx}',
  ],
  // ...
};
```

## Development Mode

To run the admin panel in development:

```bash
npm run dev
```

Navigate to: `http://localhost:5173/admin`

## Production Build

```bash
npm run build
```

## Performance Optimization

### Enable Code Splitting

```typescript
// Lazy load admin routes
const AdminDashboard = lazy(() => import('@apps/admin/pages/AdminDashboard'));
const SystemMonitoring = lazy(() => import('@apps/admin/pages/SystemMonitoring'));
// etc.
```

### Configure Caching

```typescript
// In your API client
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchWithCache(url: string) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

## Security Checklist

- ✅ All routes protected with `super_admin` role
- ✅ API endpoints require authentication
- ✅ Sensitive actions require confirmation
- ✅ Audit trail implemented
- ✅ CSRF protection enabled
- ✅ Rate limiting configured
- ✅ Input validation on all forms
- ✅ XSS protection enabled

## Next Steps

1. Configure backend endpoints
2. Set up authentication/authorization
3. Test all components
4. Configure monitoring alerts
5. Set up backup procedures
6. Train admin users
7. Monitor system performance

## Support

For installation issues:
- Check the main README.md
- Review API documentation
- Contact: admin@glit.com
