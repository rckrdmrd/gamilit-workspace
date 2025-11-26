#!/usr/bin/env node
/**
 * Script para generar tipos TypeScript desde la especificación OpenAPI del backend
 *
 * Uso:
 *   node scripts/generate-api-types.js
 *
 * Prerequisitos:
 *   - Backend debe estar corriendo en http://localhost:3006
 *   - openapi-typescript debe estar instalado
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Configuración
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006';
const OPENAPI_JSON_URL = `${BACKEND_URL}/api/docs-json`;
const OUTPUT_DIR = path.join(__dirname, '../src/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api-types.ts');
const TEMP_JSON_FILE = path.join(OUTPUT_DIR, 'openapi-spec.json');

console.log('🚀 Generando tipos TypeScript desde OpenAPI...\n');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`📁 Creando directorio: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para descargar el JSON de OpenAPI
function downloadOpenAPISpec() {
  return new Promise((resolve, reject) => {
    console.log(`📥 Descargando especificación OpenAPI desde: ${OPENAPI_JSON_URL}`);

    const client = BACKEND_URL.startsWith('https') ? https : http;

    client.get(OPENAPI_JSON_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download OpenAPI spec. Status: ${res.statusCode}\n\n` +
          `Asegúrate de que el backend esté corriendo en ${BACKEND_URL}\n` +
          `Puedes iniciar el backend con: npm run dev (en apps/backend)`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          // Validar que es JSON válido
          const spec = JSON.parse(data);

          // Guardar JSON temporalmente
          fs.writeFileSync(TEMP_JSON_FILE, JSON.stringify(spec, null, 2));
          console.log(`✅ Especificación OpenAPI descargada: ${TEMP_JSON_FILE}`);
          console.log(`   Versión: ${spec.info?.version || 'unknown'}`);
          console.log(`   Paths: ${Object.keys(spec.paths || {}).length}`);

          resolve(TEMP_JSON_FILE);
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Network error: ${err.message}\n\n` +
        `Asegúrate de que el backend esté corriendo en ${BACKEND_URL}`));
    });
  });
}

// Función para generar tipos TypeScript
function generateTypes(specFile) {
  console.log(`\n🔨 Generando tipos TypeScript...`);

  try {
    // Verificar que openapi-typescript esté instalado
    try {
      require.resolve('openapi-typescript');
    } catch {
      console.error('❌ Error: openapi-typescript no está instalado');
      console.log('\nInstala con: npm install --save-dev openapi-typescript');
      process.exit(1);
    }

    // Ejecutar openapi-typescript
    const command = `npx openapi-typescript "${specFile}" --output "${OUTPUT_FILE}"`;
    execSync(command, { stdio: 'inherit' });

    console.log(`\n✅ Tipos generados exitosamente: ${OUTPUT_FILE}`);

    // Agregar header personalizado al archivo generado
    addHeaderToGeneratedFile();

    // Limpiar archivo temporal
    if (fs.existsSync(TEMP_JSON_FILE)) {
      fs.unlinkSync(TEMP_JSON_FILE);
      console.log(`🗑️  Archivo temporal eliminado: ${TEMP_JSON_FILE}`);
    }

    return OUTPUT_FILE;
  } catch (err) {
    console.error(`❌ Error generando tipos: ${err.message}`);
    throw err;
  }
}

// Agregar header personalizado
function addHeaderToGeneratedFile() {
  const content = fs.readFileSync(OUTPUT_FILE, 'utf8');

  const header = `/**
 * GAMILIT API Types
 *
 * ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR MANUALMENTE
 *
 * Generado desde: ${OPENAPI_JSON_URL}
 * Fecha: ${new Date().toISOString()}
 *
 * Para regenerar:
 *   npm run generate:api-types
 *
 * Uso:
 *   import type { paths, components } from '@/generated/api-types';
 *
 *   type UserStatsResponse = components['schemas']['UserStats'];
 *   type GetUserStatsPath = paths['/v1/gamification/users/{userId}/stats']['get'];
 */

`;

  fs.writeFileSync(OUTPUT_FILE, header + content);
}

// Crear archivo de re-exportación
function createIndexFile() {
  const indexPath = path.join(OUTPUT_DIR, 'index.ts');
  const indexContent = `/**
 * Generated API Types - Index
 *
 * Re-exports all generated types for easier imports
 */

export * from './api-types';

// Helper type utilities
export type { paths, components } from './api-types';
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log(`📄 Archivo de index creado: ${indexPath}`);
}

// Crear archivo .gitignore para generated/
function createGitignore() {
  const gitignorePath = path.join(OUTPUT_DIR, '.gitignore');
  const gitignoreContent = `# Generated files - do not commit
openapi-spec.json
`;

  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(`📄 .gitignore creado: ${gitignorePath}`);
}

// Main
async function main() {
  try {
    // 1. Descargar especificación OpenAPI
    const specFile = await downloadOpenAPISpec();

    // 2. Generar tipos TypeScript
    generateTypes(specFile);

    // 3. Crear archivos adicionales
    createIndexFile();
    createGitignore();

    console.log('\n✨ ¡Generación de tipos completada exitosamente!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Importar tipos en tu código:');
    console.log('      import type { components } from \'@/generated/api-types\';');
    console.log('   2. Usar en API calls:');
    console.log('      type UserStats = components[\'schemas\'][\'UserStats\'];');
    console.log('   3. Regenerar cuando el backend cambie:');
    console.log('      npm run generate:api-types\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { downloadOpenAPISpec, generateTypes };
