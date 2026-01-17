/**
 * Card Component Unit Tests
 *
 * Tests for the reusable Card component covering:
 * - Basic rendering
 * - Variants (default, bordered, elevated)
 * - Header and footer slots
 * - Custom className
 * - Children rendering
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Card>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </Card>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Card>Default</Card>);
      const card = screen.getByText('Default').closest('div')?.parentElement;
      expect(card?.className).toContain('bg-white');
      expect(card?.className).toContain('rounded-lg');
    });

    it('should apply bordered variant styles', () => {
      render(<Card variant="bordered">Bordered</Card>);
      const card = screen.getByText('Bordered').closest('div')?.parentElement;
      expect(card?.className).toContain('border');
      expect(card?.className).toContain('border-gray-200');
    });

    it('should apply elevated variant styles', () => {
      render(<Card variant="elevated">Elevated</Card>);
      const card = screen.getByText('Elevated').closest('div')?.parentElement;
      expect(card?.className).toContain('shadow-lg');
    });
  });

  describe('header slot', () => {
    it('should render header when provided', () => {
      render(
        <Card header={<h2>Card Title</h2>}>
          Content
        </Card>
      );
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
    });

    it('should render header before content', () => {
      render(
        <Card header={<div data-testid="header">Header</div>}>
          <div data-testid="content">Content</div>
        </Card>
      );
      const header = screen.getByTestId('header');
      const content = screen.getByTestId('content');
      expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should apply header styles with border', () => {
      render(
        <Card header={<span>Title</span>}>
          Content
        </Card>
      );
      const title = screen.getByText('Title');
      const headerWrapper = title.parentElement;
      expect(headerWrapper?.className).toContain('border-b');
      expect(headerWrapper?.className).toContain('px-6');
      expect(headerWrapper?.className).toContain('py-4');
    });

    it('should not render header wrapper when no header provided', () => {
      render(<Card>Content only</Card>);
      const contentWrapper = screen.getByText('Content only').parentElement;
      // Check there's no sibling with border-b before content
      const prevSibling = contentWrapper?.previousElementSibling;
      expect(prevSibling).toBeNull();
    });
  });

  describe('footer slot', () => {
    it('should render footer when provided', () => {
      render(
        <Card footer={<button>Action</button>}>
          Content
        </Card>
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should render footer after content', () => {
      render(
        <Card footer={<div data-testid="footer">Footer</div>}>
          <div data-testid="content">Content</div>
        </Card>
      );
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');
      expect(content.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should apply footer styles with border and background', () => {
      render(
        <Card footer={<span>Footer</span>}>
          Content
        </Card>
      );
      const footer = screen.getByText('Footer');
      const footerWrapper = footer.parentElement;
      expect(footerWrapper?.className).toContain('border-t');
      expect(footerWrapper?.className).toContain('bg-gray-50');
      expect(footerWrapper?.className).toContain('rounded-b-lg');
    });

    it('should not render footer wrapper when no footer provided', () => {
      render(<Card>Content only</Card>);
      const contentWrapper = screen.getByText('Content only').parentElement;
      // Check there's no sibling with border-t after content
      const nextSibling = contentWrapper?.nextElementSibling;
      expect(nextSibling).toBeNull();
    });
  });

  describe('header and footer together', () => {
    it('should render both header and footer', () => {
      render(
        <Card
          header={<h2>Title</h2>}
          footer={<button>Submit</button>}
        >
          Body content
        </Card>
      );
      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should maintain correct order: header, content, footer', () => {
      render(
        <Card
          header={<div data-testid="header">H</div>}
          footer={<div data-testid="footer">F</div>}
        >
          <div data-testid="content">C</div>
        </Card>
      );
      const header = screen.getByTestId('header');
      const content = screen.getByTestId('content');
      const footer = screen.getByTestId('footer');

      expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(content.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default styles', () => {
      render(<Card className="custom-card">Content</Card>);
      const card = screen.getByText('Content').closest('div')?.parentElement;
      expect(card?.className).toContain('custom-card');
      expect(card?.className).toContain('bg-white');
    });

    it('should allow overriding default styles', () => {
      render(<Card className="bg-red-500">Content</Card>);
      const card = screen.getByText('Content').closest('div')?.parentElement;
      expect(card?.className).toContain('bg-red-500');
    });
  });

  describe('content padding', () => {
    it('should have padding on content area', () => {
      render(<Card>Padded content</Card>);
      // The content is inside a div with padding classes, which is inside the card
      const contentDiv = screen.getByText('Padded content').closest('div');
      expect(contentDiv?.className).toContain('px-6');
      expect(contentDiv?.className).toContain('py-4');
    });
  });

  describe('nesting', () => {
    it('should support nested cards', () => {
      render(
        <Card>
          <Card>
            Inner content
          </Card>
        </Card>
      );
      expect(screen.getByText('Inner content')).toBeInTheDocument();
    });
  });
});
