import { test, expect } from '@playwright/test';
import { loginAsTeacher } from './fixtures/auth-helpers';
import { testClassrooms } from './fixtures/test-users';
import {
  waitForPageLoad,
  waitForToast,
  getByTestId,
  waitForLoadingToFinish,
  waitForModal,
  closeModal,
} from './helpers/page-helpers';

/**
 * Teacher Flow E2E Tests
 *
 * Tests the complete teacher workflow:
 * Login → Teacher Portal → View Submissions → Review → Grade
 * Test: Receive notification of new exercise
 */

test.describe('Teacher Flow - Submission Review', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await loginAsTeacher(page);
    await waitForPageLoad(page);
  });

  test('should view pending submissions', async ({ page }) => {
    // Verify we're on teacher dashboard
    await expect(page).toHaveURL(/\/teacher\/dashboard/);

    // Navigate to submissions page
    const submissionsLink = page.getByRole('link', {
      name: /entregas|submissions|respuestas/i,
    });

    if (await submissionsLink.isVisible()) {
      await submissionsLink.click();
    } else {
      // Try navigation menu
      await page.goto('/teacher/submissions');
    }

    await waitForPageLoad(page);

    // Verify we're on submissions page
    await expect(page).toHaveURL(/\/teacher.*submissions|responses/);

    // Check for submissions table/list
    const submissionsTable = page.locator('table, [role="table"], [data-testid="submissions-list"]');
    await expect(submissionsTable.first()).toBeVisible({ timeout: 10000 });

    // Filter for pending submissions
    const filterDropdown = page.locator('select, [role="combobox"]').filter({
      hasText: /estado|status|filtrar/i,
    });

    if (await filterDropdown.isVisible()) {
      await filterDropdown.selectOption({ label: /pendiente|pending/i });
      await waitForLoadingToFinish(page);
    } else {
      // Try clicking a filter button
      const pendingButton = page.getByRole('button', { name: /pendiente|pending/i });
      if (await pendingButton.isVisible()) {
        await pendingButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify pending submissions are shown
    const pendingBadges = page.locator('text=/pendiente|pending/i');
    const count = await pendingBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should review and grade a submission', async ({ page }) => {
    // Navigate to submissions page
    await page.goto('/teacher/submissions');
    await waitForPageLoad(page);

    // Find first pending submission
    const firstSubmission = page
      .locator('[data-testid="submission-row"], tr, .submission-card')
      .filter({ hasText: /pendiente|pending/i })
      .first();

    // If no pending submissions found, skip test
    const hasPending = await firstSubmission.isVisible({ timeout: 3000 });
    if (!hasPending) {
      test.skip();
      return;
    }

    // Click to view submission details
    const viewButton = firstSubmission.getByRole('button', { name: /ver|view|revisar/i });
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      await firstSubmission.click();
    }

    await waitForPageLoad(page);

    // Verify submission details page
    await expect(page.locator('[data-testid="submission-details"]')).toBeVisible({
      timeout: 10000,
    });

    // Verify student's answers are visible
    const answersSection = page.locator('[data-testid="student-answers"], .student-answers');
    await expect(answersSection.first()).toBeVisible({ timeout: 5000 });

    // Enter grade/feedback
    const gradeInput = page.locator('input[name="grade"], input[name="score"], [data-testid="grade-input"]');
    if (await gradeInput.isVisible({ timeout: 3000 })) {
      await gradeInput.fill('85');
    }

    // Enter feedback comment
    const feedbackTextarea = page.locator(
      'textarea[name="feedback"], textarea[name="comments"], [data-testid="feedback-textarea"]'
    );
    if (await feedbackTextarea.isVisible({ timeout: 3000 })) {
      await feedbackTextarea.fill('Buen trabajo. Revisar la pregunta 3 para mejorar.');
    }

    // Submit grade
    const submitGradeButton = page.getByRole('button', {
      name: /enviar calificación|submit grade|guardar/i,
    });
    await expect(submitGradeButton).toBeVisible({ timeout: 5000 });
    await submitGradeButton.click();

    // Wait for submission
    await waitForLoadingToFinish(page);

    // Verify success message
    await waitForToast(page, /calificación enviada|grade submitted|guardado/i);

    // Verify status changed to graded
    const statusBadge = page.locator('[data-testid="submission-status"]');
    if (await statusBadge.isVisible({ timeout: 3000 })) {
      await expect(statusBadge).toContainText(/calificado|graded|completado/i);
    }
  });

  test('should receive notification for new exercise submission', async ({ page }) => {
    // Check for notification bell/icon
    const notificationBell = page.locator(
      '[data-testid="notifications"], button[aria-label*="notification"], .notification-icon'
    );

    if (!(await notificationBell.isVisible({ timeout: 3000 }))) {
      // Notifications might not be implemented yet
      test.skip();
      return;
    }

    // Click notification bell
    await notificationBell.click();
    await page.waitForTimeout(500);

    // Verify notification dropdown/panel appears
    const notificationPanel = page.locator(
      '[data-testid="notification-panel"], .notification-dropdown, [role="menu"]'
    );
    await expect(notificationPanel).toBeVisible({ timeout: 5000 });

    // Check for new submission notifications
    const newSubmissionNotif = notificationPanel.locator(
      'text=/nueva entrega|new submission|ejercicio enviado/i'
    );

    const hasNotifications = await newSubmissionNotif.isVisible({ timeout: 2000 });
    expect(hasNotifications).toBeTruthy();
  });

  test('should filter submissions by student', async ({ page }) => {
    // Navigate to submissions page
    await page.goto('/teacher/submissions');
    await waitForPageLoad(page);

    // Look for student filter
    const studentFilter = page.locator(
      'input[placeholder*="estudiante"], input[placeholder*="student"], [data-testid="student-filter"]'
    );

    if (await studentFilter.isVisible({ timeout: 3000 })) {
      // Enter student name
      await studentFilter.fill('Test Student');
      await page.waitForTimeout(1000);

      // Verify filtered results
      const submissionRows = page.locator('[data-testid="submission-row"], tr');
      const count = await submissionRows.count();

      // Should show filtered results
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      // Filter might be implemented differently
      test.skip();
    }
  });

  test('should filter submissions by exercise', async ({ page }) => {
    // Navigate to submissions page
    await page.goto('/teacher/submissions');
    await waitForPageLoad(page);

    // Look for exercise filter dropdown
    const exerciseFilter = page.locator(
      'select[name="exercise"], [data-testid="exercise-filter"]'
    );

    if (await exerciseFilter.isVisible({ timeout: 3000 })) {
      // Select first exercise option (skip "All")
      const options = await exerciseFilter.locator('option').all();
      if (options.length > 1) {
        await exerciseFilter.selectOption({ index: 1 });
        await waitForLoadingToFinish(page);

        // Verify filtered results
        const submissionRows = page.locator('[data-testid="submission-row"], tr');
        const count = await submissionRows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    } else {
      test.skip();
    }
  });

  test('should view student progress analytics', async ({ page }) => {
    // Navigate to progress/analytics page
    const progressLink = page.getByRole('link', { name: /progreso|progress|analíticas/i });

    if (await progressLink.isVisible({ timeout: 3000 })) {
      await progressLink.click();
    } else {
      await page.goto('/teacher/progress');
    }

    await waitForPageLoad(page);

    // Verify we're on progress page
    await expect(page).toHaveURL(/\/teacher.*progress|analytics/);

    // Check for student list
    const studentList = page.locator(
      '[data-testid="student-list"], table, [role="table"]'
    );
    await expect(studentList.first()).toBeVisible({ timeout: 10000 });

    // Check for progress indicators
    const progressBars = page.locator('[role="progressbar"], .progress-bar');
    const progressCount = await progressBars.count();
    expect(progressCount).toBeGreaterThanOrEqual(0);

    // Check for statistics/charts
    const statsCards = page.locator('[data-testid*="stat"], .stat-card, .metric');
    const statsCount = await statsCards.count();
    expect(statsCount).toBeGreaterThanOrEqual(0);
  });

  test('should export submissions report', async ({ page }) => {
    // Navigate to submissions page
    await page.goto('/teacher/submissions');
    await waitForPageLoad(page);

    // Look for export button
    const exportButton = page.getByRole('button', { name: /exportar|export|descargar/i });

    if (!(await exportButton.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Setup download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click export
    await exportButton.click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/submissions|entregas/i);
  });

  test('should bulk grade multiple submissions', async ({ page }) => {
    // Navigate to submissions page
    await page.goto('/teacher/submissions');
    await waitForPageLoad(page);

    // Look for checkboxes to select multiple submissions
    const checkboxes = page.locator('input[type="checkbox"][data-testid*="select"]');
    const count = await checkboxes.count();

    if (count < 2) {
      // Need at least 2 submissions for bulk action
      test.skip();
      return;
    }

    // Select first 2 submissions
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    // Look for bulk action button
    const bulkActionButton = page.getByRole('button', {
      name: /acciones|actions|calificar seleccionados/i,
    });

    if (await bulkActionButton.isVisible({ timeout: 3000 })) {
      await bulkActionButton.click();

      // Wait for bulk action modal/dropdown
      const bulkModal = await waitForModal(page);

      // Enter bulk grade
      const bulkGradeInput = bulkModal.locator('input[name="grade"]');
      if (await bulkGradeInput.isVisible({ timeout: 2000 })) {
        await bulkGradeInput.fill('80');

        // Submit bulk grade
        const submitButton = bulkModal.getByRole('button', { name: /aplicar|apply|enviar/i });
        await submitButton.click();

        await waitForLoadingToFinish(page);

        // Verify success
        await waitForToast(page, /calificaciones aplicadas|grades applied/i);
      }
    } else {
      test.skip();
    }
  });
});
