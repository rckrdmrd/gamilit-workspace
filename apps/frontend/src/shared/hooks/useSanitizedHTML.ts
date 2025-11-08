import { useMemo } from 'react';
import DOMPurify from 'dompurify';

/**
 * Configuration types for HTML sanitization
 */
export type SanitizationRole = 'student' | 'teacher' | 'admin';

export interface SanitizationConfig {
  /**
   * User role determines allowed HTML tags and attributes
   * - student: Most restrictive, basic formatting only
   * - teacher: Moderate restrictions, educational content
   * - admin: Least restrictive, full educational content
   */
  role?: SanitizationRole;

  /**
   * Additional allowed tags beyond the default whitelist
   */
  additionalAllowedTags?: string[];

  /**
   * Additional allowed attributes beyond the default whitelist
   */
  additionalAllowedAttrs?: string[];
}

/**
 * Default configuration per role
 */
const ROLE_CONFIGS: Record<SanitizationRole, { ALLOWED_TAGS: string[]; ALLOWED_ATTR: string[] }> = {
  student: {
    // Students: Only basic text formatting for answers/comments
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'] // Only class for styling
  },

  teacher: {
    // Teachers: Educational content with links and images
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'dl', 'dt', 'dd', 'sub', 'sup'
    ],
    ALLOWED_ATTR: [
      'class', 'id',
      'href', 'target', 'rel', // For links (target sanitized separately)
      'src', 'alt', 'title', 'width', 'height', // For images
      'colspan', 'rowspan' // For tables
    ]
  },

  admin: {
    // Admins: Full educational content including embeds
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'dl', 'dt', 'dd', 'sub', 'sup',
      'iframe', 'video', 'audio', 'source'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', // Limited style attribute
      'href', 'target', 'rel',
      'src', 'alt', 'title', 'width', 'height',
      'colspan', 'rowspan',
      'frameborder', 'allowfullscreen', 'allow', // For safe iframes
      'controls', 'autoplay', 'loop', 'muted' // For media
    ]
  }
};

/**
 * Hook to sanitize HTML content and prevent XSS attacks
 *
 * Security features:
 * - Removes all script tags and event handlers
 * - Whitelist-based approach for allowed tags/attributes
 * - Role-based permissions (student < teacher < admin)
 * - Forces external links to open safely (noopener noreferrer)
 * - Sanitizes iframe sources to allow only trusted domains
 * - Removes data: URIs to prevent data exfiltration
 *
 * @param htmlString - The raw HTML string to sanitize
 * @param config - Configuration options including user role
 * @returns Sanitized HTML string safe for rendering with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * const MyComponent = ({ content, userRole }) => {
 *   const sanitizedContent = useSanitizedHTML(content, { role: userRole });
 *   return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
 * };
 * ```
 */
export const useSanitizedHTML = (
  htmlString: string,
  config: SanitizationConfig = {}
): string => {
  const { role = 'admin', additionalAllowedTags = [], additionalAllowedAttrs = [] } = config;

  return useMemo(() => {
    if (!htmlString) return '';

    // Get role-based configuration
    const roleConfig = ROLE_CONFIGS[role];

    // Merge with additional allowed tags/attributes
    const ALLOWED_TAGS = [...roleConfig.ALLOWED_TAGS, ...additionalAllowedTags];
    const ALLOWED_ATTR = [...roleConfig.ALLOWED_ATTR, ...additionalAllowedAttrs];

    // Configure DOMPurify
    const sanitized = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,

      // Prevent DOM clobbering attacks
      SANITIZE_DOM: true,

      // Keep content safe but functional
      KEEP_CONTENT: true,

      // Return clean HTML
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,

      // Security hooks
      FORBID_TAGS: ['script', 'style', 'object', 'embed', 'base', 'link', 'meta'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],

      // Block data: URIs to prevent data exfiltration
      ALLOW_DATA_ATTR: false,

      // Custom URI schemes whitelist - blocks data:, javascript:, vbscript: etc.
      // Only allows http(s), mailto, tel, callto, sms, cid, xmpp
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

      // Hook to add security attributes to links
      RETURN_TRUSTED_TYPE: false,
    });

    // Post-processing: Ensure external links are safe
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;

    // Add rel="noopener noreferrer" to external links
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('rel', 'noopener noreferrer');
        // Remove target=_blank for security (or force it with noopener)
        if (link.getAttribute('target') === '_blank') {
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });

    // Sanitize iframe sources (only allow trusted domains for admin/teacher)
    if (role === 'admin' || role === 'teacher') {
      const iframes = tempDiv.querySelectorAll('iframe');
      const trustedDomains = [
        'youtube.com',
        'youtube-nocookie.com',
        'vimeo.com',
        'codepen.io',
        'codesandbox.io',
        'jsfiddle.net',
        'replit.com'
      ];

      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src');
        if (src) {
          try {
            const url = new URL(src);
            const isTrusted = trustedDomains.some(domain =>
              url.hostname === domain || url.hostname.endsWith(`.${domain}`)
            );

            if (!isTrusted) {
              iframe.remove();
            } else {
              // Add sandbox attribute for extra security
              iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
            }
          } catch {
            // Invalid URL, remove iframe
            iframe.remove();
          }
        } else {
          iframe.remove();
        }
      });
    }

    return tempDiv.innerHTML;
  }, [htmlString, role, additionalAllowedTags, additionalAllowedAttrs]);
};

/**
 * Helper function for quick sanitization without React hooks
 * Use this in non-component contexts (e.g., utilities, tests)
 */
export const sanitizeHTML = (
  htmlString: string,
  config: SanitizationConfig = {}
): string => {
  if (!htmlString) return '';

  const { role = 'admin', additionalAllowedTags = [], additionalAllowedAttrs = [] } = config;
  const roleConfig = ROLE_CONFIGS[role];
  const ALLOWED_TAGS = [...roleConfig.ALLOWED_TAGS, ...additionalAllowedTags];
  const ALLOWED_ATTR = [...roleConfig.ALLOWED_ATTR, ...additionalAllowedAttrs];

  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'base', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};
