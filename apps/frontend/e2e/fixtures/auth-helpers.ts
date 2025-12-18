import { Page, expect } from '@playwright/test';
import { testUsers, TestUser } from './test-users';

/**
 * Authentication Helper Functions
 *
 * Reusable functions for login/logout in E2E tests
 */

/**
 * Login as a specific user role
 */
export async function loginAs(page: Page, role: 'student' | 'teacher' | 'admin') {
  const user = testUsers[role];
  await login(page, user);
}

/**
 * Login with email and password
 */
export async function login(page: Page, user: TestUser) {
  await page.goto('/login');

  // Wait for login form to be visible
  await page.waitForSelector('form', { state: 'visible' });

  // Fill credentials
  const emailInput = page.getByLabel(/email|correo/i);
  const passwordInput = page.getByLabel(/contraseña|password/i);

  await emailInput.fill(user.email);
  await passwordInput.fill(user.password);

  // Submit form
  const loginButton = page.getByRole('button', { name: /iniciar sesión|login/i });
  await loginButton.click();

  // Wait for navigation to dashboard
  await page.waitForURL(new RegExp(user.expectedDashboard), { timeout: 10000 });

  // Verify we're logged in
  await expect(page).toHaveURL(new RegExp(user.expectedDashboard));
}

/**
 * Login as student
 */
export async function loginAsStudent(page: Page) {
  await loginAs(page, 'student');
}

/**
 * Login as teacher
 */
export async function loginAsTeacher(page: Page) {
  await loginAs(page, 'teacher');
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page) {
  await loginAs(page, 'admin');
}

/**
 * Logout
 */
export async function logout(page: Page) {
  // Look for logout button (may be in menu/dropdown)
  const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Try to find menu button first
    const menuButton = page.getByRole('button', { name: /menú|menu|perfil|profile/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.getByRole('button', { name: /cerrar sesión|logout|salir/i }).click();
    }
  }

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return !currentUrl.includes('/login') && !currentUrl.includes('/register');
}

/**
 * Setup authenticated state (faster than full login)
 * Use this in beforeEach for tests that need authentication
 */
export async function setupAuthState(page: Page, role: 'student' | 'teacher' | 'admin') {
  // This would use Playwright's storageState feature
  // For now, we'll do a regular login
  await loginAs(page, role);
}
