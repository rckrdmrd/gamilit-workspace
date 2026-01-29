/**
 * useFavicon Hook - Dynamic Favicon Management
 *
 * Provides a React hook for dynamically updating the favicon.
 * Useful for the White Label system to apply tenant-specific favicons.
 *
 * @module hooks/useFavicon
 * @see ET-WL-001-theming.md
 */

import { useEffect, useRef } from 'react';

/**
 * useFavicon Hook
 *
 * Updates the document favicon dynamically.
 * Restores the original favicon on unmount or when favicon is set to null.
 *
 * @param faviconUrl - URL to the favicon, or null to restore default
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Set custom favicon
 *   useFavicon('https://cdn.example.com/custom-favicon.ico');
 *
 *   return <div>Content</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function DynamicFavicon({ url }: { url: string | null }) {
 *   // Favicon updates when url changes
 *   // Restores to default when url is null
 *   useFavicon(url);
 *
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useFavicon(faviconUrl: string | null): void {
  const originalFavicon = useRef<string | null>(null);

  // Store original favicon on first render
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link && originalFavicon.current === null) {
      originalFavicon.current = link.href;
    }
  }, []);

  // Update favicon when URL changes
  useEffect(() => {
    if (!faviconUrl) {
      // Restore original favicon
      if (originalFavicon.current) {
        setFavicon(originalFavicon.current);
      }
      return;
    }

    setFavicon(faviconUrl);

    // Cleanup: restore original on unmount
    return () => {
      if (originalFavicon.current) {
        setFavicon(originalFavicon.current);
      }
    };
  }, [faviconUrl]);
}

/**
 * Sets the favicon in the document head
 *
 * @param url - URL to the favicon
 */
function setFavicon(url: string): void {
  // Find existing favicon link
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

  if (!link) {
    // Create favicon link if it doesn't exist
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    document.head.appendChild(link);
  }

  link.href = url;

  // Also update shortcut icon for older browsers
  const shortcutLink = document.querySelector<HTMLLinkElement>(
    "link[rel='shortcut icon']"
  );

  if (shortcutLink) {
    shortcutLink.href = url;
  }

  // Update apple-touch-icon if present
  const appleTouchIcon = document.querySelector<HTMLLinkElement>(
    "link[rel='apple-touch-icon']"
  );

  if (appleTouchIcon) {
    appleTouchIcon.href = url;
  }
}

/**
 * useDocumentTitle Hook
 *
 * Updates the document title dynamically.
 * Restores the original title on unmount.
 *
 * @param title - Title to set, or null to restore default
 * @param options - Options for title behavior
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   useDocumentTitle('Dashboard | My Platform');
 *   return <div>Dashboard content</div>;
 * }
 * ```
 */
export function useDocumentTitle(
  title: string | null,
  options: { restoreOnUnmount?: boolean } = { restoreOnUnmount: true }
): void {
  const originalTitle = useRef<string | null>(null);

  // Store original title on first render
  useEffect(() => {
    if (originalTitle.current === null) {
      originalTitle.current = document.title;
    }
  }, []);

  // Update title when it changes
  useEffect(() => {
    if (title === null) {
      // Restore original title
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
      return;
    }

    document.title = title;

    // Cleanup: restore original on unmount (if enabled)
    return () => {
      if (options.restoreOnUnmount && originalTitle.current) {
        document.title = originalTitle.current;
      }
    };
  }, [title, options.restoreOnUnmount]);
}

/**
 * useBrandingMeta Hook
 *
 * Combines favicon and title management for branding.
 * Convenient hook for applying both simultaneously.
 *
 * @param options - Branding options (faviconUrl, platformName, pageName)
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   useBrandingMeta({
 *     faviconUrl: branding?.faviconUrl,
 *     platformName: branding?.platformName || 'GAMILIT',
 *     pageName: 'Admin Dashboard',
 *   });
 *
 *   return <div>Admin content</div>;
 * }
 * ```
 */
export function useBrandingMeta(options: {
  faviconUrl?: string | null;
  platformName?: string;
  pageName?: string;
}): void {
  const { faviconUrl, platformName, pageName } = options;

  // Build title
  const title = pageName && platformName
    ? `${pageName} | ${platformName}`
    : platformName || null;

  // Apply favicon
  useFavicon(faviconUrl ?? null);

  // Apply title
  useDocumentTitle(title);
}

export default useFavicon;
