/**
 * Footer Component Unit Tests
 *
 * Tests for the Footer component covering:
 * - Basic rendering
 * - Links
 * - Copyright text
 * - Styling
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  describe('rendering', () => {
    it('should render footer element', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have footer tag', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.tagName).toBe('FOOTER');
    });
  });

  describe('copyright text', () => {
    it('should show default copyright text', () => {
      render(<Footer />);
      expect(screen.getByText(/GAMILIT/)).toBeInTheDocument();
      expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument();
    });

    it('should include current year in default copyright', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    });

    it('should show custom copyright text', () => {
      render(<Footer copyrightText="© 2026 Custom Company" />);
      expect(screen.getByText('© 2026 Custom Company')).toBeInTheDocument();
    });

    it('should not show default when custom text provided', () => {
      render(<Footer copyrightText="Custom text only" />);
      expect(screen.queryByText(/GAMILIT/)).not.toBeInTheDocument();
    });
  });

  describe('links', () => {
    const mockLinks = [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ];

    it('should render no links by default', () => {
      render(<Footer />);
      const links = screen.queryAllByRole('link');
      expect(links).toHaveLength(0);
    });

    it('should render provided links', () => {
      render(<Footer links={mockLinks} />);
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should have correct href attributes', () => {
      render(<Footer links={mockLinks} />);
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    });

    it('should render empty array without errors', () => {
      render(<Footer links={[]} />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('should render single link', () => {
      render(<Footer links={[{ label: 'Help', href: '/help' }]} />);
      expect(screen.getByRole('link', { name: 'Help' })).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have border-t class for top border', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('border-t');
    });

    it('should have gray background', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('bg-gray-100');
    });

    it('should have padding', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('py-8');
    });

    it('should have container with mx-auto', () => {
      render(<Footer />);
      const container = screen.getByRole('contentinfo').querySelector('.container');
      expect(container?.className).toContain('mx-auto');
    });
  });

  describe('link styling', () => {
    const mockLinks = [{ label: 'Test Link', href: '/test' }];

    it('should have text-gray-600 class', () => {
      render(<Footer links={mockLinks} />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('text-gray-600');
    });

    it('should have hover styles', () => {
      render(<Footer links={mockLinks} />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('hover:text-blue-600');
    });

    it('should have transition class', () => {
      render(<Footer links={mockLinks} />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('transition');
    });

    it('should have small text size', () => {
      render(<Footer links={mockLinks} />);
      const link = screen.getByRole('link');
      expect(link.className).toContain('text-sm');
    });
  });

  describe('copyright styling', () => {
    it('should have centered text', () => {
      render(<Footer />);
      const copyrightContainer = screen.getByText(/GAMILIT/).closest('div');
      expect(copyrightContainer?.className).toContain('text-center');
    });

    it('should have small text size', () => {
      render(<Footer />);
      const copyrightContainer = screen.getByText(/GAMILIT/).closest('div');
      expect(copyrightContainer?.className).toContain('text-sm');
    });

    it('should have gray-500 text color', () => {
      render(<Footer />);
      const copyrightContainer = screen.getByText(/GAMILIT/).closest('div');
      expect(copyrightContainer?.className).toContain('text-gray-500');
    });
  });

  describe('layout', () => {
    it('should show links above copyright', () => {
      const mockLinks = [{ label: 'Link', href: '/link' }];
      render(<Footer links={mockLinks} />);

      const link = screen.getByRole('link');
      const copyright = screen.getByText(/GAMILIT/);

      // Link should appear before copyright in DOM
      expect(link.compareDocumentPosition(copyright)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should have flex layout for links', () => {
      const mockLinks = [
        { label: 'Link 1', href: '/1' },
        { label: 'Link 2', href: '/2' },
      ];
      render(<Footer links={mockLinks} />);

      const linksContainer = screen.getByRole('link', { name: 'Link 1' }).closest('div');
      expect(linksContainer?.className).toContain('flex');
      expect(linksContainer?.className).toContain('justify-center');
    });

    it('should have gap between links', () => {
      const mockLinks = [
        { label: 'Link 1', href: '/1' },
        { label: 'Link 2', href: '/2' },
      ];
      render(<Footer links={mockLinks} />);

      const linksContainer = screen.getByRole('link', { name: 'Link 1' }).closest('div');
      expect(linksContainer?.className).toContain('gap-6');
    });
  });
});
