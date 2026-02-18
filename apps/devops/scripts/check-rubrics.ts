import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
const envPath = path.resolve(__dirname, '../../backend/.env.dev');
dotenv.config({ path: envPath });

async function checkRubrics() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'gamilit_platform',
    });

    try {
        await client.connect();

        const rubrics = await client.query('SELECT exercise_type FROM educational_content.exercise_type_rubrics WHERE is_default = true');
        const rubricTypes = new Set(rubrics.rows.map(r => r.exercise_type));

        const exercises = await client.query(`
      SELECT e.title, e.exercise_type 
      FROM educational_content.exercises e
      JOIN educational_content.modules m ON e.module_id = m.id
      WHERE m.module_code IN ('MOD-03-CRITICA', 'MOD-04-DIGITAL', 'MOD-05-PRODUCCION') 
      AND e.requires_manual_grading = true
    `);

        const missing = exercises.rows.filter(e => !rubricTypes.has(e.exercise_type));

        if (missing.length > 0) {
            console.log('JSON_RESULT:' + JSON.stringify(missing));
        } else {
            console.log('JSON_RESULT:[]');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkRubrics();
