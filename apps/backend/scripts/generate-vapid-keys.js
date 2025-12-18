#!/usr/bin/env node

/**
 * Script para generar claves VAPID para Web Push Notifications
 *
 * Uso:
 *   node scripts/generate-vapid-keys.js
 *
 * Output:
 *   - Claves VAPID (public y private)
 *   - Variables de entorno listas para copiar
 *
 * Las claves generadas deben agregarse a .env o .env.production:
 *   VAPID_PUBLIC_KEY=<clave-publica>
 *   VAPID_PRIVATE_KEY=<clave-privada>
 *   VAPID_SUBJECT=mailto:admin@gamilit.com
 */

const webpush = require('web-push');

console.log('\n=================================================');
console.log('  GENERADOR DE CLAVES VAPID - GAMILIT');
console.log('=================================================\n');

console.log('Generando par de claves VAPID...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Claves generadas exitosamente!\n');
console.log('=================================================');
console.log('  COPIAR ESTAS VARIABLES A .env O .env.production');
console.log('=================================================\n');

console.log('# Web Push VAPID Keys (generadas automáticamente)');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:admin@gamilit.com\n');

console.log('=================================================');
console.log('  NOTAS IMPORTANTES');
console.log('=================================================\n');
console.log('1. VAPID_PUBLIC_KEY:');
console.log('   - Se comparte con el frontend');
console.log('   - Permite crear PushSubscriptions en el navegador');
console.log('   - Endpoint: GET /api/notifications/devices/vapid-public-key\n');

console.log('2. VAPID_PRIVATE_KEY:');
console.log('   - DEBE mantenerse SECRETA');
console.log('   - NUNCA commitear al repositorio');
console.log('   - Se usa para firmar notificaciones push\n');

console.log('3. VAPID_SUBJECT:');
console.log('   - Email de contacto o URL del sitio');
console.log('   - Formato: mailto:email@example.com o https://example.com\n');

console.log('4. Configuración:');
console.log('   - Desarrollo: Agregar a apps/backend/.env');
console.log('   - Producción: Agregar a apps/backend/.env.production');
console.log('   - O configurar como variables de entorno del sistema\n');

console.log('5. Compatibilidad:');
console.log('   - Chrome, Firefox, Edge: Full support');
console.log('   - Safari: 16.4+ (iOS 16.4+)');
console.log('   - Opera: Full support\n');

console.log('=================================================\n');
