/**
 * Input Component Unit Tests
 *
 * Tests for the reusable Input component covering:
 * - Basic rendering
 * - Label and helper text
 * - Error state
 * - Disabled state
 * - Icons (left and right)
 * - Ref forwarding
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with different input types', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should spread additional props', () => {
      render(<Input data-testid="custom-input" />);
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<Input label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should associate label with input via htmlFor', () => {
      render(<Input label="Email" id="email-input" />);
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should generate id when not provided', () => {
      render(<Input label="Generated ID" />);
      const label = screen.getByText('Generated ID');
      const forAttr = label.getAttribute('for');
      expect(forAttr).toMatch(/^input-/);
    });

    it('should not render label when not provided', () => {
      render(<Input placeholder="No label" />);
      const wrapper = screen.getByPlaceholderText('No label').closest('div')?.parentElement;
      expect(wrapper?.querySelector('label')).not.toBeInTheDocument();
    });

    it('should have label styles', () => {
      render(<Input label="Styled Label" />);
      const label = screen.getByText('Styled Label');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-medium');
      expect(label.className).toContain('text-gray-700');
    });
  });

  describe('helper text', () => {
    it('should render helper text when provided', () => {
      render(<Input helperText="Enter your full name" />);
      expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    });

    it('should apply helper text styles', () => {
      render(<Input helperText="Helper" />);
      const helperText = screen.getByText('Helper');
      expect(helperText.className).toContain('text-gray-500');
      expect(helperText.className).toContain('text-sm');
    });

    it('should not render helper text when not provided', () => {
      render(<Input placeholder="No helper" />);
      const wrapper = screen.getByPlaceholderText('No helper').closest('div')?.parentElement;
      const paragraphs = wrapper?.querySelectorAll('p');
      expect(paragraphs?.length).toBe(0);
    });
  });

  describe('error state', () => {
    it('should render error message when provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should apply error styles to input', () => {
      render(<Input error="Error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('border-red-500');
      expect(input.className).toContain('focus:ring-red-500');
    });

    it('should apply error styles to error message', () => {
      render(<Input error="Invalid input" />);
      const errorMessage = screen.getByText('Invalid input');
      expect(errorMessage.className).toContain('text-red-600');
    });

    it('should have role=alert on error message', () => {
      render(<Input error="Error alert" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Error alert');
    });

    it('should show error instead of helper text when both provided', () => {
      render(<Input helperText="Helper" error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('should set aria-invalid when error exists', () => {
      render(<Input error="Invalid" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not set aria-invalid when no error', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('bg-gray-100');
      expect(input.className).toContain('cursor-not-allowed');
      expect(input.className).toContain('text-gray-500');
    });
  });

  describe('icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">L</span>;
    const RightIcon = () => <span data-testid="right-icon">R</span>;

    it('should render left icon', () => {
      render(<Input leftIcon={<LeftIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      render(<Input rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should render both icons', () => {
      render(<Input leftIcon={<LeftIcon />} rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should add left padding for left icon', () => {
      render(<Input leftIcon={<LeftIcon />} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('pl-10');
    });

    it('should add right padding for right icon', () => {
      render(<Input rightIcon={<RightIcon />} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('pr-10');
    });

    it('should position left icon correctly', () => {
      render(<Input leftIcon={<LeftIcon />} />);
      const iconWrapper = screen.getByTestId('left-icon').parentElement;
      expect(iconWrapper?.className).toContain('left-3');
      expect(iconWrapper?.className).toContain('absolute');
    });

    it('should position right icon correctly', () => {
      render(<Input rightIcon={<RightIcon />} />);
      const iconWrapper = screen.getByTestId('right-icon').parentElement;
      expect(iconWrapper?.className).toContain('right-3');
      expect(iconWrapper?.className).toContain('absolute');
    });
  });

  describe('value and onChange', () => {
    it('should display controlled value', () => {
      render(<Input value="controlled" readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('controlled');
    });

    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} data-testid="input" />);
      fireEvent.change(screen.getByTestId('input'), { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should update value on change', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      fireEvent.change(input, { target: { value: 'typed text' } });
      expect(input).toHaveValue('typed text');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} data-testid="input" />);
      ref.current?.focus();
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default styles', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('custom-input');
    });
  });

  describe('additional props', () => {
    it('should pass through name attribute', () => {
      render(<Input name="username" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('name', 'username');
    });

    it('should pass through maxLength attribute', () => {
      render(<Input maxLength={10} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('maxLength', '10');
    });

    it('should pass through autoComplete attribute', () => {
      render(<Input autoComplete="off" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('autoComplete', 'off');
    });
  });

  describe('base styles', () => {
    it('should have base input styles', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('w-full');
      expect(input.className).toContain('border');
      expect(input.className).toContain('rounded-md');
      expect(input.className).toContain('px-3');
      expect(input.className).toContain('py-2');
    });

    it('should have focus styles when no error', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toContain('focus:ring-blue-500');
      expect(input.className).toContain('focus:border-blue-500');
    });
  });

  describe('accessibility', () => {
    it('should have accessible name via label', () => {
      render(<Input label="Search" />);
      expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Search input" />);
      expect(screen.getByRole('textbox', { name: 'Search input' })).toBeInTheDocument();
    });
  });
});
