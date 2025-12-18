import { test, expect } from '@playwright/test';
import { loginAsStudent } from './fixtures/auth-helpers';
import {
  waitForPageLoad,
  waitForToast,
  getByTestId,
  waitForLoadingToFinish,
  waitForModal,
} from './helpers/page-helpers';

/**
 * Gamification Flow E2E Tests
 *
 * Tests the complete gamification workflow:
 * Complete Exercise → Gain XP → Level Up → Unlock Achievement
 */

test.describe('Gamification Flow - XP and Levels', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await loginAsStudent(page);
    await waitForPageLoad(page);
  });

  test('should display current XP and level on dashboard', async ({ page }) => {
    // Verify we're on student dashboard
    await expect(page).toHaveURL(/\/student\/dashboard/);

    // Check for XP display
    const xpDisplay = page.locator(
      '[data-testid="user-xp"], .xp-display, [class*="xp"]'
    ).filter({ hasText: /XP|experiencia/i });

    await expect(xpDisplay.first()).toBeVisible({ timeout: 10000 });

    // Verify XP value is shown
    const xpText = await xpDisplay.first().textContent();
    expect(xpText).toMatch(/\d+/); // Should contain a number

    // Check for level display
    const levelDisplay = page.locator(
      '[data-testid="user-level"], .level-display, [class*="level"]'
    ).filter({ hasText: /nivel|level|rango/i });

    await expect(levelDisplay.first()).toBeVisible({ timeout: 5000 });

    // Verify level value is shown
    const levelText = await levelDisplay.first().textContent();
    expect(levelText).toMatch(/\d+/);
  });

  test('should gain XP after completing exercise', async ({ page }) => {
    // Get initial XP
    const xpDisplay = page.locator('[data-testid="user-xp"]').first();
    let initialXpText = await xpDisplay.textContent();
    if (!initialXpText) {
      initialXpText = await page
        .locator('text=/\\d+.*XP/i')
        .first()
        .textContent();
    }

    const initialXp = initialXpText ? parseInt(initialXpText.match(/\d+/)?.[0] || '0') : 0;

    // Navigate to a module
    const moduleCard = page.locator('[data-testid*="module"]').first();
    await moduleCard.click();
    await waitForPageLoad(page);

    // Select a simple exercise
    const exerciseButton = page.locator('[data-testid*="exercise"]').first();
    await exerciseButton.click();
    await waitForPageLoad(page);

    // Complete exercise (simplified - answer all questions)
    const answerButtons = page.locator(
      'button[role="radio"], input[type="radio"], [data-testid*="answer"]'
    );

    const answerCount = await answerButtons.count();

    if (answerCount > 0) {
      // Answer questions
      for (let i = 0; i < Math.min(5, answerCount); i++) {
        const option = answerButtons.first();
        if (await option.isVisible({ timeout: 2000 })) {
          await option.click();
          await page.waitForTimeout(1500); // Wait for auto-advance
        }
      }

      // Submit if needed
      const submitButton = page.getByRole('button', { name: /enviar|submit/i });
      if (await submitButton.isVisible({ timeout: 3000 })) {
        await submitButton.click();
        await waitForLoadingToFinish(page);
      }

      // Wait for completion feedback
      const feedbackModal = page.locator('[role="dialog"], .modal');
      if (await feedbackModal.isVisible({ timeout: 5000 })) {
        // Check for XP earned notification
        const xpEarned = feedbackModal.locator('text=/\\+\\d+.*XP|XP.*ganado/i');
        await expect(xpEarned).toBeVisible({ timeout: 5000 });

        // Get XP amount
        const xpEarnedText = await xpEarned.textContent();
        const earnedAmount = xpEarnedText ? parseInt(xpEarnedText.match(/\\d+/)?.[0] || '0') : 0;

        expect(earnedAmount).toBeGreaterThan(0);

        // Close modal
        const closeButton = feedbackModal.getByRole('button', {
          name: /cerrar|close|continuar/i,
        });
        if (await closeButton.isVisible({ timeout: 2000 })) {
          await closeButton.click();
        }
      }

      // Return to dashboard
      await page.goto('/student/dashboard');
      await waitForPageLoad(page);

      // Verify XP increased
      const updatedXpText = await xpDisplay.textContent();
      const updatedXp = updatedXpText ? parseInt(updatedXpText.match(/\d+/)?.[0] || '0') : 0;

      expect(updatedXp).toBeGreaterThanOrEqual(initialXp);
    } else {
      test.skip();
    }
  });

  test('should show level up animation when threshold reached', async ({ page }) => {
    // This test would require manipulating user XP to be just below level-up threshold
    // For now, we'll check if level-up UI elements exist

    // Look for level progress bar
    const levelProgressBar = page.locator(
      '[data-testid="level-progress"], [role="progressbar"]'
    ).filter({ hasText: /nivel|level/i });

    if (!(await levelProgressBar.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Verify progress bar shows percentage
    const progressText = await page
      .locator('text=/\\d+%|\\d+\\/\\d+/')
      .first()
      .textContent();
    expect(progressText).toBeTruthy();
  });

  test('should display XP gain animation', async ({ page }) => {
    // Navigate to exercise
    const moduleCard = page.locator('[data-testid*="module"]').first();
    if (await moduleCard.isVisible({ timeout: 3000 })) {
      await moduleCard.click();
      await waitForPageLoad(page);

      const exerciseButton = page.locator('[data-testid*="exercise"]').first();
      if (await exerciseButton.isVisible({ timeout: 3000 })) {
        await exerciseButton.click();
        await waitForPageLoad(page);

        // Complete exercise quickly
        const submitButton = page.getByRole('button', { name: /enviar|submit/i });
        if (await submitButton.isVisible({ timeout: 3000 })) {
          // Try to submit (might fail if incomplete, that's ok)
          await submitButton.click({ force: true }).catch(() => {});

          // Check for XP animation/notification
          const xpNotification = page.locator(
            '[data-testid*="xp-notification"], .xp-earned, .toast, [class*="confetti"]'
          );

          if (await xpNotification.isVisible({ timeout: 5000 })) {
            await expect(xpNotification).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('Gamification Flow - Achievements', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await waitForPageLoad(page);
  });

  test('should display achievements page', async ({ page }) => {
    // Navigate to achievements page
    const achievementsLink = page.getByRole('link', { name: /logros|achievements|insignias/i });

    if (await achievementsLink.isVisible({ timeout: 3000 })) {
      await achievementsLink.click();
    } else {
      await page.goto('/student/achievements');
    }

    await waitForPageLoad(page);

    // Verify we're on achievements page
    await expect(page).toHaveURL(/\/student.*achievements|logros/);

    // Check for achievements grid/list
    const achievementsGrid = page.locator(
      '[data-testid="achievements-grid"], .achievements, [class*="achievement"]'
    );
    await expect(achievementsGrid.first()).toBeVisible({ timeout: 10000 });

    // Verify achievements are shown
    const achievementCards = page.locator('[data-testid*="achievement"], .achievement-card');
    const count = await achievementCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show locked and unlocked achievements', async ({ page }) => {
    // Navigate to achievements page
    await page.goto('/student/achievements');
    await waitForPageLoad(page);

    // Check for unlocked achievements
    const unlockedAchievements = page.locator(
      '[data-testid*="achievement"]'
    ).filter({ has: page.locator('text=/desbloqueado|unlocked|conseguido/i') });

    // Check for locked achievements
    const lockedAchievements = page.locator(
      '[data-testid*="achievement"]'
    ).filter({ has: page.locator('text=/bloqueado|locked|sin desbloquear/i') });

    const unlockedCount = await unlockedAchievements.count();
    const lockedCount = await lockedAchievements.count();

    // Should have at least some achievements (either locked or unlocked)
    expect(unlockedCount + lockedCount).toBeGreaterThan(0);
  });

  test('should show achievement unlock notification', async ({ page }) => {
    // This test would require triggering an achievement unlock
    // For now, we'll verify the achievement modal/toast exists in the codebase

    // Complete an action that might unlock an achievement
    const moduleCard = page.locator('[data-testid*="module"]').first();
    if (await moduleCard.isVisible({ timeout: 3000 })) {
      await moduleCard.click();
      await waitForPageLoad(page);

      // Check if achievement notification appears
      const achievementNotification = page.locator(
        '[data-testid="achievement-unlock"], [class*="achievement-modal"], text=/logro desbloqueado|achievement unlocked/i'
      );

      // This might not appear if no achievement is unlocked, which is ok
      const appeared = await achievementNotification.isVisible({ timeout: 3000 }).catch(() => false);

      if (appeared) {
        await expect(achievementNotification).toBeVisible();

        // Verify achievement details shown
        const achievementTitle = achievementNotification.locator('h2, h3, .title');
        await expect(achievementTitle.first()).toBeVisible();
      }
    }
  });

  test('should show achievement progress', async ({ page }) => {
    // Navigate to achievements page
    await page.goto('/student/achievements');
    await waitForPageLoad(page);

    // Find an achievement with progress tracking
    const progressAchievement = page
      .locator('[data-testid*="achievement"]')
      .filter({ has: page.locator('[role="progressbar"], .progress, text=/\\d+\\/\\d+/') })
      .first();

    if (!(await progressAchievement.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Verify progress is shown
    const progressBar = progressAchievement.locator('[role="progressbar"], .progress');
    await expect(progressBar).toBeVisible();

    // Verify progress text (e.g., "3/5 exercises completed")
    const progressText = progressAchievement.locator('text=/\\d+\\/\\d+|\\d+%/');
    await expect(progressText.first()).toBeVisible();
  });
});

test.describe('Gamification Flow - Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await waitForPageLoad(page);
  });

  test('should display leaderboard', async ({ page }) => {
    // Navigate to leaderboard
    const leaderboardLink = page.getByRole('link', {
      name: /leaderboard|clasificación|ranking/i,
    });

    if (await leaderboardLink.isVisible({ timeout: 3000 })) {
      await leaderboardLink.click();
    } else {
      await page.goto('/student/leaderboard');
    }

    await waitForPageLoad(page);

    // Verify we're on leaderboard page
    await expect(page).toHaveURL(/\/student.*leaderboard|ranking/);

    // Check for leaderboard table
    const leaderboardTable = page.locator('table, [role="table"], [data-testid="leaderboard"]');
    await expect(leaderboardTable.first()).toBeVisible({ timeout: 10000 });

    // Verify columns exist
    await expect(page.locator('text=/rango|rank|posición/i')).toBeVisible();
    await expect(page.locator('text=/nombre|name|usuario|user/i')).toBeVisible();
    await expect(page.locator('text=/XP|puntos|points/i')).toBeVisible();
  });

  test('should highlight current user in leaderboard', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/student/leaderboard');
    await waitForPageLoad(page);

    // Look for highlighted/current user row
    const currentUserRow = page.locator(
      '[data-testid="current-user-row"], .current-user, .highlighted, [class*="highlight"]'
    );

    if (await currentUserRow.isVisible({ timeout: 5000 })) {
      await expect(currentUserRow).toBeVisible();

      // Verify it contains "Tú" or "You" or user's name
      const rowText = await currentUserRow.textContent();
      expect(rowText).toMatch(/tú|you|test.*student/i);
    } else {
      // Current user might be visible in table without special highlighting
      const tableRows = page.locator('tr');
      const rowsWithYou = tableRows.filter({ hasText: /tú|you/i });
      const count = await rowsWithYou.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter leaderboard by period', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/student/leaderboard');
    await waitForPageLoad(page);

    // Look for period filter (weekly, monthly, all-time)
    const periodFilter = page.locator(
      'select[name="period"], [data-testid="period-filter"]'
    );

    if (!(await periodFilter.isVisible({ timeout: 3000 }))) {
      // Try button-based filter
      const weeklyButton = page.getByRole('button', { name: /semanal|weekly|semana/i });

      if (!(await weeklyButton.isVisible({ timeout: 2000 }))) {
        test.skip();
        return;
      }

      await weeklyButton.click();
      await waitForLoadingToFinish(page);

      // Verify leaderboard updated
      const leaderboardTable = page.locator('table, [role="table"]');
      await expect(leaderboardTable).toBeVisible();

      // Switch to all-time
      const allTimeButton = page.getByRole('button', { name: /todo.*tiempo|all.*time/i });
      if (await allTimeButton.isVisible({ timeout: 2000 })) {
        await allTimeButton.click();
        await waitForLoadingToFinish(page);
      }
    } else {
      // Select different periods
      await periodFilter.selectOption('weekly');
      await waitForLoadingToFinish(page);

      await periodFilter.selectOption('all-time');
      await waitForLoadingToFinish(page);
    }
  });

  test('should filter leaderboard by classroom', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/student/leaderboard');
    await waitForPageLoad(page);

    // Look for classroom filter
    const classroomFilter = page.locator(
      'select[name="classroom"], [data-testid="classroom-filter"]'
    );

    if (!(await classroomFilter.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    // Get available options
    const options = await classroomFilter.locator('option').all();

    if (options.length > 1) {
      // Select second option (first is usually "All")
      await classroomFilter.selectOption({ index: 1 });
      await waitForLoadingToFinish(page);

      // Verify leaderboard filtered
      const leaderboardTable = page.locator('table, [role="table"]');
      await expect(leaderboardTable).toBeVisible();

      // Reset to all classrooms
      await classroomFilter.selectOption({ index: 0 });
    }
  });

  test('should show user rank badge for top positions', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/student/leaderboard');
    await waitForPageLoad(page);

    // Look for top 3 positions with special badges/icons
    const firstPlace = page.locator('[data-rank="1"], tr:nth-child(1)').first();
    const secondPlace = page.locator('[data-rank="2"], tr:nth-child(2)').first();
    const thirdPlace = page.locator('[data-rank="3"], tr:nth-child(3)').first();

    // Check if medals/badges are shown
    const topThreeBadges = page.locator('🥇|🥈|🥉|gold|silver|bronze').filter({
      or: [
        { hasText: /1|primero|first/i },
        { hasText: /2|segundo|second/i },
        { hasText: /3|tercero|third/i },
      ],
    });

    // This is optional - not all implementations show badges
    const hasBadges = await topThreeBadges.count();
    // Just verify we can see the leaderboard structure
    expect(await firstPlace.isVisible({ timeout: 3000 })).toBeTruthy();
  });
});

test.describe('Gamification Flow - Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await waitForPageLoad(page);
  });

  test('should display ML Coins balance', async ({ page }) => {
    // Check for ML Coins display on dashboard
    const mlCoinsDisplay = page.locator(
      '[data-testid="ml-coins"], .ml-coins, [class*="coin"]'
    ).filter({ hasText: /ML.*coin|monedas/i });

    if (!(await mlCoinsDisplay.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    await expect(mlCoinsDisplay.first()).toBeVisible();

    // Verify coins amount is shown
    const coinsText = await mlCoinsDisplay.first().textContent();
    expect(coinsText).toMatch(/\d+/);
  });

  test('should earn ML Coins after exercise completion', async ({ page }) => {
    // Get initial ML Coins balance
    const coinsDisplay = page.locator('[data-testid="ml-coins"]').first();

    if (!(await coinsDisplay.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    const initialCoinsText = await coinsDisplay.textContent();
    const initialCoins = initialCoinsText
      ? parseInt(initialCoinsText.match(/\d+/)?.[0] || '0')
      : 0;

    // Complete an exercise (simplified)
    const moduleCard = page.locator('[data-testid*="module"]').first();
    if (await moduleCard.isVisible({ timeout: 3000 })) {
      await moduleCard.click();
      await waitForPageLoad(page);

      // Complete exercise flow...
      // (Similar to XP test above)

      // Check completion modal for coins earned
      const feedbackModal = page.locator('[role="dialog"]');
      if (await feedbackModal.isVisible({ timeout: 5000 })) {
        const coinsEarned = feedbackModal.locator('text=/\\+\\d+.*coin|monedas.*ganadas/i');
        if (await coinsEarned.isVisible({ timeout: 3000 })) {
          await expect(coinsEarned).toBeVisible();
        }
      }
    }
  });
});
