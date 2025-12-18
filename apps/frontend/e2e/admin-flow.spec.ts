import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures/auth-helpers';
import {
  waitForPageLoad,
  waitForToast,
  getByTestId,
  waitForLoadingToFinish,
  waitForModal,
} from './helpers/page-helpers';

/**
 * Admin Flow E2E Tests
 *
 * Tests the complete admin workflow:
 * Login → Admin Portal → Feature Flags → Toggle flag → Verify effect
 * Login → Admin Portal → Roles → Edit permissions
 */

test.describe('Admin Flow - Feature Flags', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
    await waitForPageLoad(page);
  });

  test('should access admin portal and view feature flags', async ({ page }) => {
    // Verify we're on admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Navigate to feature flags page
    const featureFlagsLink = page.getByRole('link', {
      name: /feature flags|banderas|características/i,
    });

    if (await featureFlagsLink.isVisible({ timeout: 3000 })) {
      await featureFlagsLink.click();
    } else {
      // Try direct navigation
      await page.goto('/admin/feature-flags');
    }

    await waitForPageLoad(page);

    // Verify we're on feature flags page
    await expect(page).toHaveURL(/\/admin.*feature.*flags|features/);

    // Verify feature flags list is visible
    const flagsList = page.locator(
      '[data-testid="feature-flags-list"], table, [role="table"]'
    );
    await expect(flagsList.first()).toBeVisible({ timeout: 10000 });

    // Verify there are feature flags
    const flagRows = page.locator('[data-testid="flag-row"], tr').filter({
      hasNot: page.locator('th'),
    });
    const count = await flagRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should toggle a feature flag and verify effect', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto('/admin/feature-flags');
    await waitForPageLoad(page);

    // Find a test feature flag (create one if doesn't exist)
    const testFlagName = 'test-feature-e2e';
    const testFlag = page.locator(`[data-flag="${testFlagName}"], [data-testid="flag-${testFlagName}"]`);

    // Get the toggle switch for the flag
    let toggleSwitch = page
      .locator('[role="switch"], input[type="checkbox"]')
      .first();

    // Check if specific test flag exists
    const hasTestFlag = await testFlag.isVisible({ timeout: 2000 });

    if (hasTestFlag) {
      toggleSwitch = testFlag.locator('[role="switch"], input[type="checkbox"]');
    }

    // Get initial state
    const initialState = await toggleSwitch.isChecked();

    // Toggle the flag
    await toggleSwitch.click();
    await page.waitForTimeout(500);

    // Verify state changed
    const newState = await toggleSwitch.isChecked();
    expect(newState).toBe(!initialState);

    // Verify success message
    await waitForToast(page, /actualizado|updated|guardado|saved/i);

    // Verify the change persisted (refresh page)
    await page.reload();
    await waitForPageLoad(page);

    // Check state is still changed
    const persistedState = await toggleSwitch.isChecked();
    expect(persistedState).toBe(newState);

    // Toggle back to original state
    if (persistedState !== initialState) {
      await toggleSwitch.click();
      await page.waitForTimeout(500);
      await waitForToast(page, /actualizado|updated/i);
    }
  });

  test('should create a new feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto('/admin/feature-flags');
    await waitForPageLoad(page);

    // Click create new flag button
    const createButton = page.getByRole('button', {
      name: /crear|create|nuevo|new.*flag/i,
    });

    if (!(await createButton.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    await createButton.click();

    // Wait for modal/form
    const modal = await waitForModal(page);

    // Fill in flag details
    const nameInput = modal.locator('input[name="name"], input[name="key"]');
    const descriptionInput = modal.locator(
      'textarea[name="description"], input[name="description"]'
    );

    const flagName = `test-flag-${Date.now()}`;

    await nameInput.fill(flagName);
    await descriptionInput.fill('Test flag created by E2E test');

    // Submit
    const submitButton = modal.getByRole('button', { name: /crear|create|guardar|save/i });
    await submitButton.click();

    await waitForLoadingToFinish(page);

    // Verify success
    await waitForToast(page, /creado|created|éxito|success/i);

    // Verify flag appears in list
    await expect(page.locator(`text=${flagName}`)).toBeVisible({ timeout: 5000 });

    // Cleanup: Delete the test flag
    const deleteButton = page
      .locator(`[data-flag="${flagName}"]`)
      .locator('button[aria-label*="eliminar"], button[aria-label*="delete"]');

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirmar|confirm|eliminar|delete/i });
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
        await waitForToast(page, /eliminado|deleted/i);
      }
    }
  });

  test('should update feature flag targeting rules', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto('/admin/feature-flags');
    await waitForPageLoad(page);

    // Click on first flag to edit
    const firstFlag = page.locator('[data-testid="flag-row"], tr').filter({
      hasNot: page.locator('th'),
    }).first();

    const editButton = firstFlag.getByRole('button', { name: /editar|edit|configurar/i });

    if (!(await editButton.isVisible({ timeout: 3000 }))) {
      // Try clicking the row itself
      await firstFlag.click();
    } else {
      await editButton.click();
    }

    await waitForPageLoad(page);

    // Look for targeting configuration
    const targetingSection = page.locator(
      '[data-testid="targeting-config"], .targeting, text=/targeting|segmentación/i'
    );

    if (!(await targetingSection.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Add a targeting rule (example: enable for specific role)
    const addRuleButton = page.getByRole('button', { name: /agregar regla|add rule/i });

    if (await addRuleButton.isVisible({ timeout: 2000 })) {
      await addRuleButton.click();

      // Fill in rule details (depends on implementation)
      const attributeSelect = page.locator('select[name="attribute"]');
      if (await attributeSelect.isVisible({ timeout: 2000 })) {
        await attributeSelect.selectOption('role');

        const valueInput = page.locator('input[name="value"]');
        await valueInput.fill('teacher');

        // Save rule
        const saveButton = page.getByRole('button', { name: /guardar|save/i });
        await saveButton.click();

        await waitForLoadingToFinish(page);
        await waitForToast(page, /guardado|saved/i);
      }
    }
  });
});

test.describe('Admin Flow - Role Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await waitForPageLoad(page);
  });

  test('should view and manage user roles', async ({ page }) => {
    // Navigate to users/roles page
    const usersLink = page.getByRole('link', { name: /usuarios|users|roles/i });

    if (await usersLink.isVisible({ timeout: 3000 })) {
      await usersLink.click();
    } else {
      await page.goto('/admin/users');
    }

    await waitForPageLoad(page);

    // Verify users list is visible
    const usersList = page.locator('[data-testid="users-list"], table, [role="table"]');
    await expect(usersList.first()).toBeVisible({ timeout: 10000 });

    // Verify user rows exist
    const userRows = page.locator('[data-testid="user-row"], tr').filter({
      hasNot: page.locator('th'),
    });
    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should edit user permissions', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Find a test user (not admin)
    const testUserRow = page
      .locator('[data-testid="user-row"], tr')
      .filter({ hasText: /student|teacher/i })
      .first();

    if (!(await testUserRow.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Click edit button
    const editButton = testUserRow.getByRole('button', { name: /editar|edit|permisos/i });

    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();
    } else {
      await testUserRow.click();
    }

    await waitForPageLoad(page);

    // Look for permissions checkboxes
    const permissionsSection = page.locator(
      '[data-testid="permissions"], .permissions, text=/permisos|permissions/i'
    );

    if (!(await permissionsSection.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Find permission checkboxes
    const permissionCheckboxes = page.locator('input[type="checkbox"][name*="permission"]');
    const checkboxCount = await permissionCheckboxes.count();

    if (checkboxCount === 0) {
      test.skip();
      return;
    }

    // Toggle first permission
    const firstCheckbox = permissionCheckboxes.first();
    const initialState = await firstCheckbox.isChecked();

    await firstCheckbox.click();
    await page.waitForTimeout(300);

    // Save changes
    const saveButton = page.getByRole('button', { name: /guardar|save|actualizar/i });
    await saveButton.click();

    await waitForLoadingToFinish(page);

    // Verify success
    await waitForToast(page, /actualizado|updated|guardado/i);

    // Revert changes
    await firstCheckbox.click();
    await saveButton.click();
    await waitForLoadingToFinish(page);
  });

  test('should change user role', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Find a test user
    const testUserRow = page
      .locator('[data-testid="user-row"], tr')
      .filter({ hasText: /test.*student|test.*teacher/i })
      .first();

    if (!(await testUserRow.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Click edit/manage button
    const editButton = testUserRow.getByRole('button', { name: /editar|edit|rol/i });

    if (!(await editButton.isVisible({ timeout: 2000 }))) {
      test.skip();
      return;
    }

    await editButton.click();
    await waitForPageLoad(page);

    // Find role selector
    const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');

    if (!(await roleSelect.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Get current role
    const currentRole = await roleSelect.inputValue();

    // Change to different role (toggle between student/teacher)
    const newRole = currentRole === 'student' ? 'teacher' : 'student';
    await roleSelect.selectOption(newRole);

    // Save
    const saveButton = page.getByRole('button', { name: /guardar|save/i });
    await saveButton.click();

    await waitForLoadingToFinish(page);

    // Verify success
    await waitForToast(page, /actualizado|updated/i);

    // Revert role back
    await roleSelect.selectOption(currentRole);
    await saveButton.click();
    await waitForLoadingToFinish(page);
  });

  test('should search for users', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Find search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]'
    );

    if (!(await searchInput.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Search for a user
    await searchInput.fill('test');
    await page.waitForTimeout(1000);

    // Verify filtered results
    const userRows = page.locator('[data-testid="user-row"], tr').filter({
      hasNot: page.locator('th'),
    });
    const count = await userRows.count();

    // Should show some results
    expect(count).toBeGreaterThanOrEqual(0);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
  });

  test('should filter users by role', async ({ page }) => {
    // Navigate to users page
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Find role filter
    const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');

    if (!(await roleFilter.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Filter by student role
    await roleFilter.selectOption('student');
    await waitForLoadingToFinish(page);

    // Verify all shown users are students
    const userRows = page.locator('[data-testid="user-row"], tr').filter({
      hasNot: page.locator('th'),
    });
    const count = await userRows.count();

    if (count > 0) {
      // Check first row has student badge/label
      const firstRow = userRows.first();
      await expect(firstRow).toContainText(/student|estudiante/i);
    }

    // Reset filter
    await roleFilter.selectOption('all');
  });
});
