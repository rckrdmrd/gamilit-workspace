/**
 * Test Users Fixtures
 *
 * Define test users for E2E tests.
 * These should correspond to users in your test database.
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  displayName?: string;
  expectedDashboard: string;
}

/**
 * Test users for E2E tests
 *
 * IMPORTANT: These users should be seeded in your test database
 * before running E2E tests.
 */
export const testUsers: Record<string, TestUser> = {
  student: {
    email: 'student@test.gamilit.com',
    password: 'TestStudent123!',
    role: 'student',
    displayName: 'Test Student',
    expectedDashboard: '/student/dashboard',
  },
  teacher: {
    email: 'teacher@test.gamilit.com',
    password: 'TestTeacher123!',
    role: 'teacher',
    displayName: 'Test Teacher',
    expectedDashboard: '/teacher/dashboard',
  },
  admin: {
    email: 'admin@test.gamilit.com',
    password: 'TestAdmin123!',
    role: 'admin',
    displayName: 'Test Admin',
    expectedDashboard: '/admin/dashboard',
  },
};

/**
 * Test Exercise IDs
 * These should match exercises in your test database
 */
export const testExercises = {
  quizTikTok: {
    id: 'quiz-tiktok-marie-curie',
    moduleId: 'module-4',
    title: 'Quiz TikTok: Marie Curie',
    type: 'quiz-tiktok',
  },
  infografia: {
    id: 'infografia-marie-curie',
    moduleId: 'module-4',
    title: 'Infografía Interactiva: Marie Curie',
    type: 'infografia-interactiva',
  },
};

/**
 * Test Classroom Data
 */
export const testClassrooms = {
  activeClassroom: {
    id: 'classroom-test-1',
    name: 'Test Classroom 2024',
    code: 'TEST2024',
  },
};
