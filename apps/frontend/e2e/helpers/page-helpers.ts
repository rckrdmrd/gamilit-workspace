import { Page, expect } from '@playwright/test';

/**
 * Page Helper Functions
 *
 * Reusable functions for common page interactions
 */

/**
 * Wait for page to load completely
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for element with retry
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'visible' | 'attached' | 'hidden' }
) {
  await page.waitForSelector(selector, {
    timeout: options?.timeout || 10000,
    state: options?.state || 'visible',
  });
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([page.waitForNavigation(), page.click(selector)]);
}

/**
 * Fill form field by label
 */
export async function fillField(page: Page, labelText: string | RegExp, value: string) {
  await page.getByLabel(labelText).fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, buttonText: string | RegExp) {
  await page.getByRole('button', { name: buttonText }).click();
}

/**
 * Wait for toast/notification
 */
export async function waitForToast(page: Page, expectedText?: string | RegExp) {
  const toast = page.locator('[role="alert"], .toast, [class*="toast"]').first();
  await expect(toast).toBeVisible({ timeout: 5000 });

  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }

  return toast;
}

/**
 * Wait for modal to open
 */
export async function waitForModal(page: Page) {
  const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
  return modal;
}

/**
 * Close modal
 */
export async function closeModal(page: Page) {
  // Try different ways to close modal
  const closeButton = page.locator(
    'button[aria-label*="cerrar"], button[aria-label*="close"], button.modal-close, [data-testid="close-modal"]'
  );

  if (await closeButton.isVisible()) {
    await closeButton.first().click();
  } else {
    // Try pressing Escape
    await page.keyboard.press('Escape');
  }

  // Wait for modal to disappear
  await expect(page.locator('[role="dialog"]').first()).not.toBeVisible({ timeout: 3000 });
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({ path: `test-results/${name}-${timestamp}.png`, fullPage: true });
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingToFinish(page: Page) {
  const spinner = page.locator('[role="progressbar"], .spinner, .loading, [class*="loading"]');

  // Wait for spinner to appear (if it will)
  try {
    await spinner.first().waitFor({ state: 'visible', timeout: 1000 });
  } catch {
    // Spinner might not appear, that's ok
    return;
  }

  // Wait for all spinners to disappear
  await spinner.first().waitFor({ state: 'hidden', timeout: 10000 });
}

/**
 * Get data-testid element
 */
export function getByTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      const matchesUrl =
        typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
      return matchesUrl && response.request().method() === method;
    },
    { timeout: 10000 }
  );
}

/**
 * Fill and submit form
 */
export async function fillAndSubmitForm(
  page: Page,
  fields: Record<string, string>,
  submitButtonText: string | RegExp
) {
  for (const [label, value] of Object.entries(fields)) {
    await fillField(page, new RegExp(label, 'i'), value);
  }

  await clickButton(page, submitButtonText);
}
