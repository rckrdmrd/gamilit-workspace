/**
 * Test de validación de versionamiento de API
 * Verifica que TODAS las rutas incluyen /v1/
 *
 * @see GAP-005 - Implementar versionamiento consistente /v1/ en todas las rutas API
 * @see orchestration/agentes/architecture-analyst/analisis-rutas-api-2025-11-24/02-REPORTE-ANALISIS-COMPLETO.md
 */

import { API_ENDPOINTS } from '@/config/api.config';

describe('API_ENDPOINTS versionamiento', () => {
  /**
   * Helper para extraer todas las rutas del objeto API_ENDPOINTS
   * Soporta:
   * - Strings directos: '/v1/auth/login'
   * - Funciones que retornan strings: (id: string) => `/v1/users/${id}`
   * - Objetos anidados con múltiples niveles
   */
  function extractAllRoutes(obj: any, routes: string[] = []): string[] {
    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'string') {
        // Ruta directa
        routes.push(value);
      } else if (typeof value === 'function') {
        // Función que genera rutas - probar con ID mock
        try {
          const route = value('test-id-123', 'test-id-456'); // Soporta hasta 2 parámetros
          if (typeof route === 'string') {
            routes.push(route);
          }
        } catch (e) {
          // Ignorar funciones que no se pueden ejecutar sin contexto adicional
          console.warn(`No se pudo extraer ruta de función ${key}:`, e);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Objeto anidado - recursión
        extractAllRoutes(value, routes);
      }
    }
    return routes;
  }

  describe('Versionamiento /v1/ requerido', () => {
    it('todas las rutas deben incluir /v1/ al inicio', () => {
      const allRoutes = extractAllRoutes(API_ENDPOINTS);

      expect(allRoutes.length).toBeGreaterThan(0); // Asegurar que extrajo rutas

      const routesWithoutVersion = allRoutes.filter((route) => {
        return !route.startsWith('/v1/');
      });

      if (routesWithoutVersion.length > 0) {
        console.error('\n❌ Rutas sin versionamiento /v1/ encontradas:');
        routesWithoutVersion.forEach((route) => console.error(`  - ${route}`));
        console.error(`\nTotal: ${routesWithoutVersion.length} rutas sin versionamiento\n`);
      }

      expect(routesWithoutVersion).toHaveLength(0);
    });

    it('ninguna ruta debe tener doble /v1/v1/', () => {
      const allRoutes = extractAllRoutes(API_ENDPOINTS);

      const routesWithDoubleVersion = allRoutes.filter((route) => {
        return route.includes('/v1/v1/');
      });

      if (routesWithDoubleVersion.length > 0) {
        console.error('\n❌ Rutas con doble versionamiento /v1/v1/ encontradas:');
        routesWithDoubleVersion.forEach((route) => console.error(`  - ${route}`));
        console.error(`\nTotal: ${routesWithDoubleVersion.length} rutas con duplicación\n`);
      }

      expect(routesWithDoubleVersion).toHaveLength(0);
    });

    it('formato de rutas debe ser /v1/{dominio}/{recurso}', () => {
      const allRoutes = extractAllRoutes(API_ENDPOINTS);

      // Patrón: /v1/ seguido de al menos un segmento de dominio
      const validPattern = /^\/v1\/[a-z]+/;

      const invalidRoutes = allRoutes.filter((route) => {
        return !validPattern.test(route);
      });

      if (invalidRoutes.length > 0) {
        console.error('\n❌ Rutas con formato inválido encontradas:');
        invalidRoutes.forEach((route) => console.error(`  - ${route}`));
        console.error(`\nTotal: ${invalidRoutes.length} rutas con formato inválido\n`);
      }

      expect(invalidRoutes).toHaveLength(0);
    });
  });

  describe('Consistencia por sección', () => {
    it('auth.* - todas las rutas deben tener /v1/', () => {
      const authRoutes = extractAllRoutes(API_ENDPOINTS.auth);
      const invalid = authRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ auth.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('users.* - todas las rutas deben tener /v1/', () => {
      const usersRoutes = extractAllRoutes(API_ENDPOINTS.users);
      const invalid = usersRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ users.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('educational.* - todas las rutas deben tener /v1/', () => {
      const educationalRoutes = extractAllRoutes(API_ENDPOINTS.educational);
      const invalid = educationalRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ educational.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('teacher.* - todas las rutas deben tener /v1/', () => {
      const teacherRoutes = extractAllRoutes(API_ENDPOINTS.teacher);
      const invalid = teacherRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ teacher.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('admin.* - todas las rutas deben tener /v1/', () => {
      const adminRoutes = extractAllRoutes(API_ENDPOINTS.admin);
      const invalid = adminRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ admin.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('social (friends.*) - todas las rutas deben tener /v1/', () => {
      const friendsRoutes = extractAllRoutes(API_ENDPOINTS.friends);
      const invalid = friendsRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ friends.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('mechanics.* - todas las rutas deben tener /v1/', () => {
      const mechanicsRoutes = extractAllRoutes(API_ENDPOINTS.mechanics);
      const invalid = mechanicsRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ mechanics.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('ai.* - todas las rutas deben tener /v1/', () => {
      const aiRoutes = extractAllRoutes(API_ENDPOINTS.ai);
      const invalid = aiRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ ai.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });

    it('notifications.* - todas las rutas deben tener /v1/', () => {
      const notificationsRoutes = extractAllRoutes(API_ENDPOINTS.notifications);
      const invalid = notificationsRoutes.filter((r) => !r.startsWith('/v1/'));

      if (invalid.length > 0) {
        console.error('❌ notifications.* rutas sin /v1/:', invalid);
      }

      expect(invalid).toHaveLength(0);
    });
  });

  describe('Estadísticas de cobertura', () => {
    it('debe reportar estadísticas de rutas analizadas', () => {
      const allRoutes = extractAllRoutes(API_ENDPOINTS);
      const withVersion = allRoutes.filter((r) => r.startsWith('/v1/'));
      const coverage = allRoutes.length > 0 ? (withVersion.length / allRoutes.length) * 100 : 0;

      console.log('\n📊 Estadísticas de Versionamiento API:');
      console.log(`  Total rutas analizadas: ${allRoutes.length}`);
      console.log(`  Rutas con /v1/: ${withVersion.length}`);
      console.log(`  Cobertura: ${coverage.toFixed(2)}%`);

      // Agrupación por dominio
      const domains = new Map<string, number>();
      withVersion.forEach((route) => {
        const match = route.match(/^\/v1\/([^/]+)/);
        if (match) {
          const domain = match[1];
          domains.set(domain, (domains.get(domain) || 0) + 1);
        }
      });

      console.log('\n  Rutas por dominio:');
      Array.from(domains.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([domain, count]) => {
          console.log(`    ${domain}: ${count} rutas`);
        });
      console.log('');

      // Verificar 100% de cobertura
      expect(coverage).toBe(100);
    });
  });
});
