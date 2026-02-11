/**
 * ============================================================================
 * GAMILIT Platform - PM2 Ecosystem Configuration
 * ============================================================================
 *
 * Configuración de PM2 para gestionar los procesos de backend y frontend
 * en el servidor de producción.
 *
 * SERVIDOR PRODUCCIÓN: 74.208.126.102
 * - Backend: Puerto 3006 (2 instancias en cluster)
 * - Frontend: Puerto 3005 (1 instancia)
 *
 * COMANDOS PRINCIPALES:
 *   pm2 start ecosystem.config.js --only gamilit-backend --env production
 *   pm2 start ecosystem.config.js --only gamilit-frontend --env production
 *   pm2 start ecosystem.config.js --env production     # Inicia ambos
 *   pm2 restart all                                    # Reiniciar todos
 *   pm2 stop all                                       # Detener todos
 *   pm2 delete all                                     # Eliminar procesos
 *   pm2 logs                                           # Ver logs en tiempo real
 *   pm2 logs gamilit-backend                           # Logs solo del backend
 *   pm2 logs gamilit-frontend                          # Logs solo del frontend
 *   pm2 monit                                          # Monitor interactivo
 *   pm2 status                                         # Estado de procesos
 *   pm2 save                                           # Guardar configuración
 *   pm2 startup                                        # Configurar inicio automático
 *
 * ============================================================================
 */

module.exports = {
  apps: [
    // ========================================================================
    // BACKEND - NestJS API (PRODUCCIÓN)
    // ========================================================================
    {
      name: 'gamilit-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',

      // Configuración de Node.js
      node_args: '-r tsconfig-paths/register',
      interpreter: 'node',

      // Cluster mode para aprovechar múltiples cores
      instances: 2,
      exec_mode: 'cluster',

      // Auto-restart y monitoreo
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Variables de entorno - Se sobrescriben con .env.production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3006,
      },

      // Archivo .env a cargar
      env_file: './.env.production',

      // Logs
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Configuración de restart en caso de errores
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,

      // Configuración para esperar a que la app esté lista
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ========================================================================
    // FRONTEND - Vite Preview (PRODUCCIÓN)
    // ========================================================================
    // NOTA: En producción se usa vite preview para servir los archivos
    // buildados. Para máximo rendimiento se recomienda usar Nginx.
    {
      name: 'gamilit-frontend',
      cwd: './apps/frontend',
      script: 'npx',
      args: 'vite preview --port 3005 --host 0.0.0.0',

      // Configuración
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart y monitoreo
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Variables de entorno
      env_production: {
        NODE_ENV: 'production',
        VITE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
        VITE_ENV: 'development',
      },

      // Archivo .env a cargar
      env_file: './.env.production',

      // Logs
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Configuración de restart
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
    },
  ],

  // ==========================================================================
  // DEPLOYMENT CONFIGURATION (Opcional - para deploy automático)
  // ==========================================================================
  deploy: {
    production: {
      user: 'isem',
      host: '74.208.126.102',
      ref: 'origin/main',
      repo: 'git@github.com:rckrdmrd/gamilit-workspace.git',
      path: '/home/isem/workspace-v2/projects/gamilit',
      'pre-setup': 'echo "Setting up production environment"',
      'post-deploy': 'npm install && npm run build:all && pm2 reload ecosystem.config.js --env production && pm2 save',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
