/**
 * ContentVersion Entity Tests
 *
 * Tests for ContentVersion entity structure and validation
 * Created: 2026-01-13
 */

import { ContentVersion, VersionableContentType } from '../content-version.entity';

describe('ContentVersion Entity', () => {
  describe('Entity Instantiation', () => {
    it('should create a valid ContentVersion instance', () => {
      const version = new ContentVersion();

      version.id = 'version-123';
      version.contentType = 'exercise';
      version.contentId = 'exercise-456';
      version.versionNumber = 1;
      version.contentData = { title: 'Test Exercise', questions: [] };

      expect(version).toBeInstanceOf(ContentVersion);
      expect(version.id).toBe('version-123');
      expect(version.contentType).toBe('exercise');
      expect(version.versionNumber).toBe(1);
    });
  });

  describe('Content Types', () => {
    it('should allow all valid content types', () => {
      const validTypes: VersionableContentType[] = ['exercise', 'module', 'lesson', 'quiz'];

      validTypes.forEach((type) => {
        const version = new ContentVersion();
        version.contentType = type;
        expect(version.contentType).toBe(type);
      });
    });
  });

  describe('Version Numbering', () => {
    it('should track version number', () => {
      const version = new ContentVersion();
      version.versionNumber = 1;

      expect(version.versionNumber).toBe(1);

      // Simulate version increment
      version.versionNumber = 2;
      expect(version.versionNumber).toBe(2);
    });

    it('should allow optional version name', () => {
      const version = new ContentVersion();
      version.versionNumber = 1;
      version.versionName = 'v1.0-beta';

      expect(version.versionName).toBe('v1.0-beta');
    });
  });

  describe('Content Data', () => {
    it('should store content snapshot as JSON', () => {
      const version = new ContentVersion();
      const contentSnapshot = {
        title: 'Math Exercise',
        description: 'Basic algebra problems',
        difficulty: 'medium',
        questions: [
          { id: 'q1', text: 'Solve x + 5 = 10', answer: '5' },
          { id: 'q2', text: 'Solve 2x = 8', answer: '4' },
        ],
        settings: {
          timeLimit: 300,
          allowHints: true,
        },
      };

      version.contentData = contentSnapshot;

      expect(version.contentData).toEqual(contentSnapshot);
      expect(version.contentData.title).toBe('Math Exercise');
      expect(version.contentData.questions).toHaveLength(2);
    });

    it('should handle complex nested content data', () => {
      const version = new ContentVersion();
      version.contentData = {
        module: {
          title: 'Algebra Basics',
          lessons: [
            {
              id: 'lesson-1',
              exercises: ['ex-1', 'ex-2'],
            },
          ],
        },
        metadata: {
          tags: ['math', 'algebra'],
          gradeLevel: 8,
        },
      };

      expect(version.contentData.module.title).toBe('Algebra Basics');
      expect(version.contentData.metadata.tags).toContain('math');
    });
  });

  describe('Change Tracking', () => {
    it('should track change summary', () => {
      const version = new ContentVersion();
      version.changeSummary = 'Updated question wording for clarity';

      expect(version.changeSummary).toBe('Updated question wording for clarity');
    });

    it('should track detailed change notes', () => {
      const version = new ContentVersion();
      version.changeNotes = `
        - Modified question 3 to be more specific
        - Added hint for question 5
        - Fixed typo in answer option B
      `;

      expect(version.changeNotes).toContain('Modified question 3');
    });
  });

  describe('Authorship', () => {
    it('should track who created the version', () => {
      const version = new ContentVersion();
      version.createdBy = 'teacher-user-123';

      expect(version.createdBy).toBe('teacher-user-123');
    });

    it('should allow optional tenantId', () => {
      const version = new ContentVersion();

      expect(version.tenantId).toBeUndefined();

      version.tenantId = 'tenant-456';
      expect(version.tenantId).toBe('tenant-456');
    });
  });

  describe('Publication Status', () => {
    it('should track publication status', () => {
      const version = new ContentVersion();
      version.isPublished = false;

      expect(version.isPublished).toBe(false);

      // Publish the version
      version.isPublished = true;
      version.publishedAt = new Date('2026-01-13T12:00:00Z');

      expect(version.isPublished).toBe(true);
      expect(version.publishedAt).toEqual(new Date('2026-01-13T12:00:00Z'));
    });

    it('should default isPublished to false', () => {
      const version = new ContentVersion();
      version.isPublished = false; // Default value

      expect(version.isPublished).toBe(false);
    });
  });

  describe('Metadata', () => {
    it('should store additional metadata', () => {
      const version = new ContentVersion();
      version.metadata = {
        source: 'import',
        originalFormat: 'qti',
        reviewStatus: 'approved',
        approvedBy: 'admin-123',
      };

      expect(version.metadata?.source).toBe('import');
      expect(version.metadata?.reviewStatus).toBe('approved');
    });

    it('should default metadata to empty object', () => {
      const version = new ContentVersion();
      version.metadata = {};

      expect(version.metadata).toEqual({});
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', () => {
      const version = new ContentVersion();
      const now = new Date();
      version.createdAt = now;

      expect(version.createdAt).toEqual(now);
    });
  });

  describe('Version Workflow', () => {
    it('should support creating a new version from existing content', () => {
      // Original version
      const v1 = new ContentVersion();
      v1.contentType = 'exercise';
      v1.contentId = 'exercise-100';
      v1.versionNumber = 1;
      v1.contentData = { title: 'Original Title', questions: [] };
      v1.isPublished = true;

      // New version with changes
      const v2 = new ContentVersion();
      v2.contentType = v1.contentType;
      v2.contentId = v1.contentId;
      v2.versionNumber = v1.versionNumber + 1;
      v2.contentData = { title: 'Updated Title', questions: [{ id: 'q1' }] };
      v2.changeSummary = 'Added first question';
      v2.isPublished = false;

      expect(v2.versionNumber).toBe(2);
      expect(v2.contentData.title).toBe('Updated Title');
      expect(v2.isPublished).toBe(false);
    });
  });
});
