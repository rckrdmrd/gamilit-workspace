/**
 * AvatarUpload Component Tests
 *
 * Tests for the AvatarUpload component functionality:
 * - File validation (type, size)
 * - Upload flow
 * - Error handling
 * - UI states
 * - Callbacks
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvatarUpload } from '../AvatarUpload';
import { profileAPI } from '@/services/api/profileAPI';
import toast from 'react-hot-toast';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/services/api/profileAPI', () => ({
  profileAPI: {
    uploadAvatar: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockFile = (
  name: string,
  type: string,
  size: number = 1024 * 1024 // 1MB default
): File => {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
};

const defaultProps = {
  userId: 'test-user-123',
  displayName: 'Test User',
  currentAvatarUrl: 'https://example.com/avatar.jpg',
};

// ============================================================================
// TESTS
// ============================================================================

describe('AvatarUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('renders with current avatar', () => {
      render(<AvatarUpload {...defaultProps} />);

      const img = screen.getByAltText('Avatar de Test User');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.currentAvatarUrl);
    });

    it('renders with initials fallback when no avatar', () => {
      render(<AvatarUpload {...defaultProps} currentAvatarUrl={undefined} />);

      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.queryByAltText('Avatar de Test User')).not.toBeInTheDocument();
    });

    it('renders upload button', () => {
      render(<AvatarUpload {...defaultProps} />);

      const button = screen.getByLabelText('Cambiar avatar');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('renders instructions when showInstructions is true', () => {
      render(<AvatarUpload {...defaultProps} showInstructions={true} />);

      expect(screen.getByText(/Haz click para cambiar tu avatar/i)).toBeInTheDocument();
    });

    it('does not render instructions when showInstructions is false', () => {
      render(<AvatarUpload {...defaultProps} showInstructions={false} />);

      expect(screen.queryByText(/Haz click para cambiar tu avatar/i)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SIZE VARIANTS TESTS
  // ==========================================================================

  describe('Size Variants', () => {
    it('applies correct classes for small size', () => {
      const { container } = render(<AvatarUpload {...defaultProps} size="sm" />);

      const avatar = container.querySelector('.h-16.w-16');
      expect(avatar).toBeInTheDocument();
    });

    it('applies correct classes for medium size', () => {
      const { container } = render(<AvatarUpload {...defaultProps} size="md" />);

      const avatar = container.querySelector('.h-20.w-20');
      expect(avatar).toBeInTheDocument();
    });

    it('applies correct classes for large size (default)', () => {
      const { container } = render(<AvatarUpload {...defaultProps} size="lg" />);

      const avatar = container.querySelector('.h-24.w-24');
      expect(avatar).toBeInTheDocument();
    });

    it('applies correct classes for extra large size', () => {
      const { container } = render(<AvatarUpload {...defaultProps} size="xl" />);

      const avatar = container.querySelector('.h-32.w-32');
      expect(avatar).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FILE VALIDATION TESTS
  // ==========================================================================

  describe('File Validation', () => {
    it('accepts valid image files (JPEG)', async () => {
      const mockUploadAvatar = jest.spyOn(profileAPI, 'uploadAvatar').mockResolvedValue({
        avatar_url: 'https://example.com/new-avatar.jpg',
        updated_at: new Date().toISOString(),
      });

      render(<AvatarUpload {...defaultProps} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUploadAvatar).toHaveBeenCalledWith(defaultProps.userId, file);
      });
    });

    it('accepts valid image files (PNG)', async () => {
      const mockUploadAvatar = jest.spyOn(profileAPI, 'uploadAvatar').mockResolvedValue({
        avatar_url: 'https://example.com/new-avatar.png',
        updated_at: new Date().toISOString(),
      });

      render(<AvatarUpload {...defaultProps} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.png', 'image/png');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUploadAvatar).toHaveBeenCalledWith(defaultProps.userId, file);
      });
    });

    it('rejects non-image files', async () => {
      const onError = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadError={onError} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('document.pdf', 'application/pdf');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Solo se permiten archivos de imagen'),
          expect.any(Object)
        );
        expect(onError).toHaveBeenCalled();
        expect(profileAPI.uploadAvatar).not.toHaveBeenCalled();
      });
    });

    it('rejects files exceeding max size (default 5MB)', async () => {
      const onError = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadError={onError} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('large-avatar.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('demasiado grande'),
          expect.any(Object)
        );
        expect(onError).toHaveBeenCalled();
        expect(profileAPI.uploadAvatar).not.toHaveBeenCalled();
      });
    });

    it('rejects files exceeding custom max size', async () => {
      const onError = jest.fn();
      render(<AvatarUpload {...defaultProps} maxSizeMB={2} onUploadError={onError} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg', 3 * 1024 * 1024); // 3MB

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('máximo: 2MB'),
          expect.any(Object)
        );
        expect(onError).toHaveBeenCalled();
        expect(profileAPI.uploadAvatar).not.toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // UPLOAD FLOW TESTS
  // ==========================================================================

  describe('Upload Flow', () => {
    it('uploads file successfully and calls onUploadComplete', async () => {
      const newAvatarUrl = 'https://example.com/new-avatar.jpg';
      const mockUploadAvatar = jest.spyOn(profileAPI, 'uploadAvatar').mockResolvedValue({
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });

      const onComplete = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadComplete={onComplete} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUploadAvatar).toHaveBeenCalledWith(defaultProps.userId, file);
        expect(onComplete).toHaveBeenCalledWith(newAvatarUrl);
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Avatar actualizado'),
          expect.any(Object)
        );
      });
    });

    it('handles upload errors correctly', async () => {
      const uploadError = new Error('Network error');
      jest.spyOn(profileAPI, 'uploadAvatar').mockRejectedValue(uploadError);

      const onError = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadError={onError} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(uploadError);
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('displays server error messages', async () => {
      const serverError = {
        response: {
          data: {
            message: 'File too large for storage',
          },
        },
      };
      jest.spyOn(profileAPI, 'uploadAvatar').mockRejectedValue(serverError);

      const onError = jest.fn();
      render(<AvatarUpload {...defaultProps} onUploadError={onError} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'File too large for storage',
          expect.any(Object)
        );
      });
    });
  });

  // ==========================================================================
  // DISABLED STATE TESTS
  // ==========================================================================

  describe('Disabled State', () => {
    it('disables upload button when disabled prop is true', () => {
      render(<AvatarUpload {...defaultProps} disabled={true} />);

      const button = screen.getByLabelText('Cambiar avatar');
      expect(button).toBeDisabled();
    });

    it('shows disabled message in instructions', () => {
      render(<AvatarUpload {...defaultProps} disabled={true} showInstructions={true} />);

      expect(screen.getByText('Upload deshabilitado')).toBeInTheDocument();
    });

    it('does not trigger upload when disabled', async () => {
      render(<AvatarUpload {...defaultProps} disabled={true} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      // Wait a bit to ensure no upload is triggered
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(profileAPI.uploadAvatar).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // CUSTOM CLASS TESTS
  // ==========================================================================

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <AvatarUpload {...defaultProps} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles no file selected', () => {
      render(<AvatarUpload {...defaultProps} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;

      // Trigger change without files
      fireEvent.change(input, { target: { files: [] } });

      expect(profileAPI.uploadAvatar).not.toHaveBeenCalled();
    });

    it('cleans up preview on error', async () => {
      jest.spyOn(profileAPI, 'uploadAvatar').mockRejectedValue(new Error('Upload failed'));

      render(<AvatarUpload {...defaultProps} />);

      const input = screen.getByLabelText('Seleccionar imagen') as HTMLInputElement;
      const file = createMockFile('avatar.jpg', 'image/jpeg');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Preview should be cleared, original avatar should be shown
      const img = screen.getByAltText('Avatar de Test User');
      expect(img).toHaveAttribute('src', defaultProps.currentAvatarUrl);
    });
  });
});
