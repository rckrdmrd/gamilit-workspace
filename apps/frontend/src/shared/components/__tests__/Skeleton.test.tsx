/**
 * Skeleton Components Unit Tests
 *
 * Tests for all Skeleton variant components covering:
 * - Base Skeleton
 * - SkeletonText
 * - SkeletonAvatar
 * - SkeletonCard
 * - SkeletonStats
 * - SkeletonAchievement
 * - SkeletonTable
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStats,
  SkeletonAchievement,
  SkeletonTable,
} from '../Skeleton';

describe('Skeleton', () => {
  describe('base rendering', () => {
    it('should render a div element', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.tagName).toBe('DIV');
    });

    it('should have animate-pulse class', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });

    it('should have gray background', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('bg-gray-200');
    });
  });

  describe('dimensions', () => {
    it('should apply default width (w-full)', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('w-full');
    });

    it('should apply default height (h-4)', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('h-4');
    });

    it('should accept custom width', () => {
      const { container } = render(<Skeleton width="w-32" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('w-32');
    });

    it('should accept custom height', () => {
      const { container } = render(<Skeleton height="h-8" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('h-8');
    });
  });

  describe('border radius', () => {
    it('should apply medium rounded by default', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('rounded-md');
    });

    it('should apply no rounded', () => {
      const { container } = render(<Skeleton rounded="none" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('rounded-none');
    });

    it('should apply small rounded', () => {
      const { container } = render(<Skeleton rounded="sm" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('rounded-sm');
    });

    it('should apply large rounded', () => {
      const { container } = render(<Skeleton rounded="lg" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('rounded-lg');
    });

    it('should apply full rounded', () => {
      const { container } = render(<Skeleton rounded="full" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('rounded-full');
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      const { container } = render(<Skeleton className="my-skeleton" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('my-skeleton');
    });
  });
});

describe('SkeletonText', () => {
  it('should render 3 lines by default', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(3);
  });

  it('should render custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(5);
  });

  it('should make last line shorter (w-3/4)', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.animate-pulse');
    const lastLine = lines[lines.length - 1];
    expect(lastLine?.className).toContain('w-3/4');
  });

  it('should make non-last lines full width', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines[0].className).toContain('w-full');
    expect(lines[1].className).toContain('w-full');
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonText className="my-text-skeleton" />);
    expect(container.querySelector('.my-text-skeleton')).toBeInTheDocument();
  });
});

describe('SkeletonAvatar', () => {
  it('should render with default size (40px)', () => {
    const { container } = render(<SkeletonAvatar />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should accept custom size', () => {
    const { container } = render(<SkeletonAvatar size={64} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should have rounded-full class', () => {
    const { container } = render(<SkeletonAvatar />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('rounded-full');
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonAvatar className="my-avatar" />);
    expect(container.querySelector('.my-avatar')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('should render card container', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.querySelector('.bg-white.rounded-lg.shadow');
    expect(card).toBeInTheDocument();
  });

  it('should not show avatar by default', () => {
    const { container } = render(<SkeletonCard />);
    // Check for inline style with 48px which is the avatar size in card
    const avatars = container.querySelectorAll('[style*="width: 48px"]');
    expect(avatars.length).toBe(0);
  });

  it('should show avatar when showAvatar is true', () => {
    const { container } = render(<SkeletonCard showAvatar />);
    const avatar = container.querySelector('[style*="width: 48px"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should render 3 body text lines by default', () => {
    const { container } = render(<SkeletonCard />);
    // SkeletonCard has: header (2 skeletons in flex-1 space-y-2) + body (SkeletonText with 3 lines)
    // Total animate-pulse elements: 2 header + 3 body = 5
    const allSkeletons = container.querySelectorAll('.animate-pulse');
    // The body SkeletonText should have 3 lines
    expect(allSkeletons.length).toBe(5);
  });

  it('should render custom number of body text lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);
    // 2 header + 5 body = 7
    const allSkeletons = container.querySelectorAll('.animate-pulse');
    expect(allSkeletons.length).toBe(7);
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonCard className="my-card" />);
    const card = container.querySelector('.my-card');
    expect(card).toBeInTheDocument();
  });
});

describe('SkeletonStats', () => {
  it('should render stats container', () => {
    const { container } = render(<SkeletonStats />);
    const card = container.querySelector('.bg-white.rounded-lg.shadow');
    expect(card).toBeInTheDocument();
  });

  it('should have icon placeholder (w-12 h-12)', () => {
    const { container } = render(<SkeletonStats />);
    const iconPlaceholder = container.querySelector('.w-12.h-12');
    expect(iconPlaceholder).toBeInTheDocument();
  });

  it('should have value placeholder (w-16 h-8)', () => {
    const { container } = render(<SkeletonStats />);
    const valuePlaceholder = container.querySelector('.w-16.h-8');
    expect(valuePlaceholder).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonStats className="my-stats" />);
    const card = container.querySelector('.my-stats');
    expect(card).toBeInTheDocument();
  });
});

describe('SkeletonAchievement', () => {
  it('should render achievement container', () => {
    const { container } = render(<SkeletonAchievement />);
    const card = container.querySelector('.bg-white.rounded-lg.shadow');
    expect(card).toBeInTheDocument();
  });

  it('should have icon placeholder (w-16 h-16 rounded-full)', () => {
    const { container } = render(<SkeletonAchievement />);
    const iconPlaceholder = container.querySelector('.w-16.h-16.rounded-full');
    expect(iconPlaceholder).toBeInTheDocument();
  });

  it('should have progress bar placeholder', () => {
    const { container } = render(<SkeletonAchievement />);
    const progressBar = container.querySelector('.w-full.h-2.rounded-full');
    expect(progressBar).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonAchievement className="my-achievement" />);
    const card = container.querySelector('.my-achievement');
    expect(card).toBeInTheDocument();
  });
});

describe('SkeletonTable', () => {
  it('should render 5 rows by default', () => {
    const { container } = render(<SkeletonTable />);
    // Header + 5 rows = 6 grid containers
    const rows = container.querySelectorAll('.grid');
    expect(rows.length).toBe(6);
  });

  it('should render custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} />);
    // Header + 3 rows = 4 grid containers
    const rows = container.querySelectorAll('.grid');
    expect(rows.length).toBe(4);
  });

  it('should render 4 columns by default', () => {
    const { container } = render(<SkeletonTable />);
    const firstRow = container.querySelector('.grid');
    const cells = firstRow?.querySelectorAll('.animate-pulse');
    expect(cells?.length).toBe(4);
  });

  it('should render custom number of columns', () => {
    const { container } = render(<SkeletonTable columns={6} />);
    const firstRow = container.querySelector('.grid');
    const cells = firstRow?.querySelectorAll('.animate-pulse');
    expect(cells?.length).toBe(6);
  });

  it('should accept custom className', () => {
    const { container } = render(<SkeletonTable className="my-table" />);
    const tableContainer = container.querySelector('.my-table');
    expect(tableContainer).toBeInTheDocument();
  });
});
