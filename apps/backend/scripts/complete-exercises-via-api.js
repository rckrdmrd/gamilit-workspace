/**
 * Script para completar ejercicios via API del backend
 * Este script usa los endpoints correctos para cada tipo de ejercicio
 */

const API_BASE = 'http://localhost:3006/api/v1';

// Ejercicios de M1 y M2 (autocalificables)
const AUTO_GRADED_EXERCISES = [
  { id: '88fd14fb-2e94-452e-8c49-83ea5ba327e6', title: 'Completar Espacios', module: 'M1' },
  { id: '16855703-4f26-4898-9af4-526c8fbd2733', title: 'Crucigrama Científico', module: 'M1' },
  { id: '70c08781-96f6-4df7-b9e7-1e20932064dd', title: 'Línea de Tiempo', module: 'M1' },
  { id: '3647e5ff-1154-4ff4-89cf-e7656cbe7ab6', title: 'Sopa de Letras', module: 'M1' },
  { id: '43e1116f-38c4-423d-a1e7-d2bd1f0a5788', title: 'Verdadero o Falso', module: 'M1' },
  { id: 'f4684a7e-de5f-4a86-b2c4-c5738bce26a6', title: 'Detective Textual', module: 'M2' },
  { id: '31e07886-af27-4cf1-9818-a720c3586a16', title: 'Predicción Narrativa', module: 'M2' },
  { id: '8712288f-c254-4042-bc33-468b5f5fce70', title: 'Puzzle de Contexto', module: 'M2' },
  { id: '1f034c76-fa5c-43d0-8518-2307562fb70d', title: 'Causa-Efecto', module: 'M2' },
  { id: '6b5313d7-0a7a-490d-93ed-f27c65eaef0d', title: 'Rueda de Inferencias', module: 'M2' },
];

// Ejercicios de M3 (revisión manual)
const MANUAL_GRADED_EXERCISES = [
  { id: '194969ae-000d-452e-9d0b-349c03606e84', title: 'Tribunal de Opiniones', module: 'M3' },
  { id: '3183ac7e-8995-46cf-bee6-f96ae92a1fe2', title: 'Debate Digital', module: 'M3' },
  { id: '07537fbb-9b7e-4b03-9d13-8c50f2efd3a5', title: 'Análisis de Fuentes', module: 'M3' },
  { id: '98ecaab7-1f26-4e93-b93a-67e62f005d97', title: 'Podcast Argumentativo', module: 'M3' },
  { id: '996438de-dbab-4083-a6a7-7da0487f5e3f', title: 'Matriz de Perspectivas', module: 'M3' },
];

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rckrdmrd@gmail.com',
      password: 'Test123456!'
    })
  });
  const data = await response.json();
  if (!data.success) throw new Error('Login failed: ' + JSON.stringify(data));
  return {
    userId: data.data.user.id,
    token: data.data.accessToken
  };
}

async function createAttemptAndSubmit(token, userId, exerciseId, exerciseTitle) {
  console.log(`  Creating attempt for: ${exerciseTitle}`);

  const createResponse = await fetch(`${API_BASE}/progress/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_id: userId,
      exercise_id: exerciseId,
      attempt_number: 1,
      submitted_answers: {
        answer1: 'Respuesta correcta',
        answer2: 'Otra respuesta',
        completed: true
      },
      is_correct: true,
      score: 100,
      time_spent_seconds: 180,
      hints_used: 0,
      xp_earned: 100,
      ml_coins_earned: 10
    })
  });

  const createData = await createResponse.json();
  if (!createResponse.ok) {
    console.log(`    Error: ${JSON.stringify(createData)}`);
    return { success: false, error: createData };
  }

  const attemptId = createData.data?.id || createData.id;
  console.log(`    Attempt created: ${attemptId}, score=${createData.data?.score || createData.score || 100}`);

  return { success: true, data: createData };
}

async function submitManualExercise(token, userId, exerciseId, exerciseTitle) {
  console.log(`  Submitting for manual review: ${exerciseTitle}`);

  const response = await fetch(`${API_BASE}/progress/submissions/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: userId,
      exerciseId: exerciseId,
      answers: {
        response: 'Mi análisis detallado sobre este tema. Considero que la información presentada tiene múltiples perspectivas válidas que deben ser evaluadas con criterio crítico.',
        arguments: ['Argumento 1: Evidencia histórica', 'Argumento 2: Análisis de fuentes', 'Argumento 3: Contexto social'],
        conclusion: 'En conclusión, considero que el análisis demuestra la importancia de evaluar múltiples fuentes.'
      }
    })
  });

  const data = await response.json();
  console.log(`    Submit result: status=${data.data?.status || data.status || 'N/A'}`);

  return { success: response.ok, data };
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Completing exercises via API');
    console.log('='.repeat(60));

    // Login
    console.log('\n1. Logging in...');
    const { userId, token } = await login();
    console.log(`   User ID: ${userId}`);
    console.log(`   Token obtained`);

    // Complete auto-graded exercises (M1, M2)
    console.log('\n2. Completing auto-graded exercises (M1, M2)...');
    let successCount = 0;
    let errorCount = 0;

    for (const exercise of AUTO_GRADED_EXERCISES) {
      const result = await createAttemptAndSubmit(token, userId, exercise.id, `[${exercise.module}] ${exercise.title}`);
      if (result.success) successCount++;
      else errorCount++;

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`   Auto-graded: ${successCount} success, ${errorCount} errors`);

    // Submit manual exercises (M3)
    console.log('\n3. Submitting manual review exercises (M3)...');
    successCount = 0;
    errorCount = 0;

    for (const exercise of MANUAL_GRADED_EXERCISES) {
      const result = await submitManualExercise(token, userId, exercise.id, `[${exercise.module}] ${exercise.title}`);
      if (result.success) successCount++;
      else errorCount++;

      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`   Manual review: ${successCount} success, ${errorCount} errors`);

    console.log('\n' + '='.repeat(60));
    console.log('DONE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
