import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('GAMILIT API')
  .setDescription('GAMILIT - Plataforma Educativa Gamificada API Documentation')
  .setVersion('1.0.0')
  .setContact(
    'GAMILIT Support',
    'https://gamilit.com',
    'support@gamilit.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer(`http://localhost:${process.env.PORT || 3006}`, 'Local Development')
  .addServer('https://api.gamilit.com', 'Production')

  // Authentication
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'access-token',
  )

  // API Key (for service-to-service)
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
      description: 'API Key for service authentication',
    },
    'api-key',
  )

  // Tags - Organized by functional area
  // Public & Auth
  .addTag('Auth', 'Autenticación y autorización - Registro, login, refresh tokens')

  // Educational
  .addTag('Educational', 'Contenido educativo - Módulos y ejercicios de comprensión lectora')

  // Progress
  .addTag('Progress', 'Seguimiento de progreso - Sesiones, intentos y envíos de ejercicios')

  // Social
  .addTag('Social', 'Funcionalidades sociales - Escuelas, aulas, equipos y amistades')

  // Content
  .addTag('Content', 'Gestión de contenido - Biblioteca Marie Curie, plantillas y categorías')

  // Gamification
  .addTag('Gamification', 'Sistema de gamificación - XP, ML Coins, rangos, logros y tienda')

  // Assignments
  .addTag('Assignments', 'Asignaciones - Tareas y actividades asignadas por profesores')

  // Notifications
  .addTag('Notifications', 'Notificaciones - Sistema multicanal (email, push, in-app)')

  // Teacher
  .addTag('Teacher', 'Herramientas de profesor - Calificaciones, revisión manual y comunicación')

  // Profile
  .addTag('Profile', 'Perfil de usuario - Información personal y preferencias')

  // Admin
  .addTag('Admin - Users', 'Administración de usuarios - CRUD y gestión de roles')
  .addTag('Admin - Organizations', 'Administración de organizaciones - Tenants y multi-tenant')
  .addTag('Admin - Content', 'Administración de contenido - Aprobación y moderación')
  .addTag('Admin - System', 'Administración de sistema - Monitoreo, logs, alertas')
  .addTag('Admin - Analytics', 'Administración de analíticas - Reportes y métricas')
  .addTag('Admin - Gamification', 'Administración de gamificación - Configuración de misiones')

  // Health
  .addTag('Health', 'Health checks - Estado del sistema y dependencias')

  .build();

// Swagger UI options
export const swaggerUiOptions = {
  customSiteTitle: 'GAMILIT API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { font-size: 36px; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    displayRequestDuration: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
};
