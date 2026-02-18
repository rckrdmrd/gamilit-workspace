import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env vars
const envPath = path.resolve(__dirname, '../../backend/.env.dev');
dotenv.config({ path: envPath });

async function seedRubrics() {
    console.log('Loading env from:', envPath);

    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'gamilit_platform',
    });

    try {
        await client.connect();
        console.log('Connected to database:', process.env.DB_DATABASE);

        const seedFilePath = path.resolve(__dirname, '../../database/seeds/dev/educational_content/13-exercise_type_rubrics.sql');
        console.log('Reading seed file:', seedFilePath);

        if (!fs.existsSync(seedFilePath)) {
            throw new Error('Seed file not found at: ' + seedFilePath);
        }

        const sql = fs.readFileSync(seedFilePath, 'utf-8');

        console.log('Executing seed SQL...');
        await client.query(sql);
        console.log('✅ Seed executed successfully.');

    } catch (err) {
        console.error('Error executing seed:', err);
    } finally {
        await client.end();
    }
}

seedRubrics();
