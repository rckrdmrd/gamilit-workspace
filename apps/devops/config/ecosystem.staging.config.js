/**
 * ============================================================================
 * GAMILIT Platform - PM2 Ecosystem Configuration (STAGING)
 * ============================================================================
 *
 * Configuracion de PM2 para el ambiente de STAGING.
 * Pre-produccion para QA y pruebas de integracion.
 *
 * DIFERENCIAS VS PRODUCCION:
 *   - Backend: 1 instancia (fork), produccion usa 2 (cluster)
 *   - Frontend: 1 instancia (fork), misma que produccion
 *   - Memoria: Limites reducidos (512M backend, 256M frontend)
 *   - Puertos: Backend 3016, Frontend 3015
 *   - Swagger: Habilitado
 *   - Logs: debug level
 *
 * COMANDOS:
 *   pm2 start ecosystem.staging.config.js --env staging
 *   pm2 restart gamilit-backend-staging
 *   pm2 restart gamilit-frontend-staging
 *   pm2 logs gamilit-backend-staging
 *   pm2 logs gamilit-frontend-staging
 *   pm2 stop gamilit-backend-staging gamilit-frontend-staging
 *   pm2 delete gamilit-backend-staging gamilit-frontend-staging
 *
 * ============================================================================
 */

module.exports = {
  apps: [
    // ========================================================================
    // BACKEND - NestJS API (STAGING)
    // ========================================================================
    {
      name: 'gamilit-backend-staging',
      cwd: '../../backend',
      script: 'dist/main.js',

      // Configuracion de Node.js
      node_args: '-r tsconfig-paths/register',
      interpreter: 'node',

      // Fork mode, 1 instancia (staging no necesita cluster)
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart y monitoreo
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Variables de entorno staging
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3016,
      },

      // Archivo .env a cargar
      env_file: '../../backend/.env.staging',

      // Logs
      error_file: '../../../logs/staging-backend-error.log',
      out_file: '../../../logs/staging-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Configuracion de restart en caso de errores
      min_uptime: '10s',
      max_restarts: 15,
      kill_timeout: 5000,

      // Configuracion para esperar a que la app este lista
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ========================================================================
    // FRONTEND - Vite Preview (STAGING)
    // ========================================================================
    {
      name: 'gamilit-frontend-staging',
      cwd: '../../frontend',
      script: 'npx',
      args: 'vite preview --port 3015 --host 0.0.0.0',

      // Configuracion
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart y monitoreo
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',

      // Variables de entorno staging
      env_staging: {
        NODE_ENV: 'staging',
        VITE_ENV: 'staging',
        VITE_APP_ENV: 'staging',
      },

      // Archivo .env a cargar
      env_file: '../../frontend/.env.staging',

      // Logs
      error_file: '../../../logs/staging-frontend-error.log',
      out_file: '../../../logs/staging-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Configuracion de restart
      min_uptime: '10s',
      max_restarts: 15,
      kill_timeout: 5000,
    },
  ],
};
