/**
 * ============================================================================
 * GAMILIT Platform - PM2 Ecosystem Configuration
 * ============================================================================
 *
 * Este archivo configura PM2 para gestionar los procesos de backend y frontend
 * en producción y desarrollo.
 *
 * Uso:
 *   pm2 start ecosystem.config.js --env production    # Producción
 *   pm2 start ecosystem.config.js --env development   # Desarrollo
 *   pm2 restart all                                   # Reiniciar todos
 *   pm2 stop all                                      # Detener todos
 *   pm2 logs                                          # Ver logs
 *   pm2 monit                                         # Monitor interactivo
 *
 * ============================================================================
 */

module.exports = {
  apps: [
    // ========================================================================
    // BACKEND - NestJS API
    // ========================================================================
    {
      name: 'gamilit-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',

      // Configuración de Node
      node_args: '-r tsconfig-paths/register',

      // Instancias (usar 'max' para cluster mode en producción)
      instances: 1,
      exec_mode: 'fork', // 'cluster' para múltiples instancias

      // Auto-restart
      autorestart: true,
      watch: false, // No watch en producción
      max_memory_restart: '500M',

      // Variables de entorno por ambiente
      env_production: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3006,
      },

      // Logs
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Configuración de restart
      min_uptime: '10s',
      max_restarts: 10,

      // Configuración de merge logs
      merge_logs: true,

      // Post-deploy scripts
      post_update: ['npm install', 'npm run build'],
    },

    // ========================================================================
    // FRONTEND - Vite + React (SOLO PARA DESARROLLO CON PM2)
    // ========================================================================
    // NOTA: En producción, el frontend normalmente se sirve como archivos
    // estáticos desde Nginx/Apache. Este proceso es solo para desarrollo.
    {
      name: 'gamilit-frontend-dev',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run dev',

      // Configuración
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',

      // Variables de entorno
      env_development: {
        NODE_ENV: 'development',
        VITE_APP_ENV: 'development',
      },

      // Logs
      error_file: './logs/frontend-dev-error.log',
      out_file: './logs/frontend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Configuración de restart
      min_uptime: '10s',
      max_restarts: 10,

      merge_logs: true,
    },

    // ========================================================================
    // FRONTEND - Preview Build (PARA TESTING DE PRODUCCIÓN)
    // ========================================================================
    {
      name: 'gamilit-frontend-preview',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run preview:prod',

      // Configuración
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',

      // Variables de entorno
      env_production: {
        NODE_ENV: 'production',
        VITE_APP_ENV: 'production',
      },

      // Logs
      error_file: './logs/frontend-preview-error.log',
      out_file: './logs/frontend-preview-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Configuración de restart
      min_uptime: '10s',
      max_restarts: 10,

      merge_logs: true,

      // Post-deploy
      post_update: ['npm install', 'npm run build:prod'],
    },
  ],

  // ==========================================================================
  // DEPLOYMENT CONFIGURATION
  // ==========================================================================
  deploy: {
    production: {
      user: 'deploy',
      host: '74.208.126.102',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/gamilit.git', // ACTUALIZAR CON TU REPO
      path: '/var/www/gamilit',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
    development: {
      user: 'deploy',
      host: '74.208.126.102',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/gamilit.git', // ACTUALIZAR CON TU REPO
      path: '/var/www/gamilit-dev',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'development',
      },
    },
  },
};
