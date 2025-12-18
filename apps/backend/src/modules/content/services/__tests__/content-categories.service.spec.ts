/**
 * ContentCategoriesService Unit Tests
 *
 * @description Tests for content categories management service covering:
 * - CRUD operations for categories
 * - Hierarchical category management (parent-child)
 * - Slug uniqueness validation
 * - Category tree building and breadcrumb navigation
 * - Root and child category queries
 * - Category movement and hierarchy validation
 * - Soft delete (is_active flag)
 * - Category statistics
 *
 * Sprint 1 - P1-021: Increase coverage to 50%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { ContentCategoriesService } from '../content-categories.service';
import { ContentCategory } from '../../entities';
import { createMockRepository, createMockQueryBuilder } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';

describe('ContentCategoriesService', () => {
  let service: ContentCategoriesService;
  let categoryRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockCategoryId = TestDataFactory.createUuid('category');
  const mockParentId = TestDataFactory.createUuid('parent');

  const mockCategory = {
    id: mockCategoryId,
    name: 'Mathematics',
    slug: 'mathematics',
    description: 'Mathematical content and exercises',
    parent_category_id: null,
    display_order: 1,
    is_active: true,
    icon: 'icon-math',
    color: '#FF5733',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockChildCategory = {
    id: TestDataFactory.createUuid('child'),
    name: 'Algebra',
    slug: 'algebra',
    description: 'Algebraic concepts',
    parent_category_id: mockCategoryId,
    display_order: 1,
    is_active: true,
    icon: null,
    color: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    categoryRepo = createMockRepository<ContentCategory>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentCategoriesService,
        {
          provide: getRepositoryToken(ContentCategory, 'content'),
          useValue: categoryRepo,
        },
      ],
    }).compile();

    service = module.get<ContentCategoriesService>(ContentCategoriesService);
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // CREATE OPERATION
  // =========================================================================

  describe('create', () => {
    const name = 'Physics';
    const slug = 'physics';
    const description = 'Physics content';

    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(null);
      categoryRepo.create.mockReturnValue(mockCategory as any);
      categoryRepo.save.mockResolvedValue(mockCategory as any);
    });

    it('should create new category successfully', async () => {
      const result = await service.create(name, slug, description);

      expect(result).toEqual(mockCategory);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { slug },
      });
      expect(categoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          slug,
          description,
          display_order: 0,
          is_active: true,
        }),
      );
      expect(categoryRepo.save).toHaveBeenCalled();
    });

    it('should create category with parent', async () => {
      categoryRepo.findOne
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce(mockCategory as any); // parent check

      await service.create(name, slug, description, mockParentId);

      expect(categoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_category_id: mockParentId,
        }),
      );
    });

    it('should create category with custom display order', async () => {
      await service.create(name, slug, description, undefined, 5);

      expect(categoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          display_order: 5,
        }),
      );
    });

    it('should create category with icon and color', async () => {
      const icon = 'icon-physics';
      const color = '#0066CC';

      await service.create(name, slug, description, undefined, undefined, icon, color);

      expect(categoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          icon,
          color,
        }),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);

      await expect(service.create(name, slug)).rejects.toThrow(ConflictException);
      await expect(service.create(name, slug)).rejects.toThrow(
        `Category with slug "${slug}" already exists`,
      );
    });

    it('should throw NotFoundException if parent category not found', async () => {
      categoryRepo.findOne
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce(null); // parent check

      await expect(service.create(name, slug, description, mockParentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // FIND OPERATIONS
  // =========================================================================

  describe('findAll', () => {
    const mockCategories = [mockCategory, mockChildCategory];

    it('should return all active categories', async () => {
      categoryRepo.find.mockResolvedValue(mockCategories as any);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: { is_active: true },
        order: { display_order: 'ASC', name: 'ASC' },
      });
    });

    it('should include inactive categories when requested', async () => {
      categoryRepo.find.mockResolvedValue(mockCategories as any);

      await service.findAll(true);

      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { display_order: 'ASC', name: 'ASC' },
      });
    });
  });

  describe('findRootCategories', () => {
    it('should return only root categories', async () => {
      categoryRepo.find.mockResolvedValue([mockCategory] as any);

      const result = await service.findRootCategories();

      expect(result).toEqual([mockCategory]);
      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: { parent_category_id: IsNull(), is_active: true },
        order: { display_order: 'ASC', name: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should return category by ID', async () => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);

      const result = await service.findById(mockCategoryId);

      expect(result).toEqual(mockCategory);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: mockCategoryId } });
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(mockCategoryId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(mockCategoryId)).rejects.toThrow(
        `ContentCategory with ID ${mockCategoryId} not found`,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);

      const result = await service.findBySlug('mathematics');

      expect(result).toEqual(mockCategory);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { slug: 'mathematics' } });
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        `ContentCategory with slug "nonexistent" not found`,
      );
    });
  });

  describe('findChildren', () => {
    it('should return child categories', async () => {
      categoryRepo.find.mockResolvedValue([mockChildCategory] as any);

      const result = await service.findChildren(mockCategoryId);

      expect(result).toEqual([mockChildCategory]);
      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: { parent_category_id: mockCategoryId, is_active: true },
        order: { display_order: 'ASC', name: 'ASC' },
      });
    });

    it('should return empty array if no children', async () => {
      categoryRepo.find.mockResolvedValue([]);

      const result = await service.findChildren(mockCategoryId);

      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // HIERARCHY OPERATIONS
  // =========================================================================

  describe('getBreadcrumb', () => {
    it('should return breadcrumb trail from root to category', async () => {
      const grandparent = { ...mockCategory, id: 'grandparent', parent_category_id: null };
      const parent = { ...mockCategory, id: 'parent', parent_category_id: 'grandparent' };
      const child = { ...mockCategory, id: 'child', parent_category_id: 'parent' };

      categoryRepo.findOne
        .mockResolvedValueOnce(child as any)
        .mockResolvedValueOnce(parent as any)
        .mockResolvedValueOnce(grandparent as any);

      const result = await service.getBreadcrumb('child');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(grandparent);
      expect(result[1]).toEqual(parent);
      expect(result[2]).toEqual(child);
    });

    it('should return single item for root category', async () => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);

      const result = await service.getBreadcrumb(mockCategoryId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCategory);
    });
  });

  describe('getTree', () => {
    it('should build category tree with nested children', async () => {
      const categories = [
        mockCategory,
        mockChildCategory,
        { ...mockCategory, id: 'another-root', parent_category_id: null },
      ];
      categoryRepo.find.mockResolvedValue(categories as any);

      const result = await service.getTree();

      expect(result).toHaveLength(2); // Two root categories
      expect(result[0]).toHaveProperty('children');
    });

    it('should handle empty category list', async () => {
      categoryRepo.find.mockResolvedValue([]);

      const result = await service.getTree();

      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // UPDATE OPERATIONS
  // =========================================================================

  describe('update', () => {
    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);
      categoryRepo.save.mockResolvedValue(mockCategory as any);
    });

    it('should update category successfully', async () => {
      const updateData = {
        name: 'Advanced Mathematics',
        description: 'Advanced math topics',
      };

      const result = await service.update(mockCategoryId, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
      expect(categoryRepo.save).toHaveBeenCalled();
    });

    it('should validate slug uniqueness when changing slug', async () => {
      categoryRepo.findOne
        .mockResolvedValueOnce(mockCategory as any) // initial find
        .mockResolvedValueOnce(null); // slug check

      await service.update(mockCategoryId, { slug: 'new-slug' });

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'new-slug' },
      });
    });

    it('should throw ConflictException if new slug exists', async () => {
      const existingCategory = { ...mockCategory, id: 'different-id' };
      categoryRepo.findOne
        .mockResolvedValueOnce(mockCategory as any) // initial find
        .mockResolvedValueOnce(existingCategory as any); // slug check

      await expect(service.update(mockCategoryId, { slug: 'existing-slug' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if setting category as its own parent', async () => {
      await expect(
        service.update(mockCategoryId, { parent_category_id: mockCategoryId }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(mockCategoryId, { parent_category_id: mockCategoryId }),
      ).rejects.toThrow('A category cannot be its own parent');
    });

    it('should validate new parent exists', async () => {
      const newParentId = TestDataFactory.createUuid('new-parent');
      categoryRepo.findOne
        .mockResolvedValueOnce(mockCategory as any) // initial find
        .mockResolvedValueOnce({ id: newParentId } as any); // parent check

      await service.update(mockCategoryId, { parent_category_id: newParentId });

      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: newParentId } });
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(service.update(mockCategoryId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrder', () => {
    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);
      categoryRepo.save.mockResolvedValue(mockCategory as any);
    });

    it('should update category display order', async () => {
      const newOrder = 10;
      const result = await service.updateOrder(mockCategoryId, newOrder);

      expect(result.display_order).toBe(newOrder);
      expect(categoryRepo.save).toHaveBeenCalled();
    });
  });

  describe('setActive', () => {
    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);
      categoryRepo.save.mockResolvedValue(mockCategory as any);
    });

    it('should activate category', async () => {
      const result = await service.setActive(mockCategoryId, true);

      expect(result.is_active).toBe(true);
      expect(categoryRepo.save).toHaveBeenCalled();
    });

    it('should deactivate category', async () => {
      const result = await service.setActive(mockCategoryId, false);

      expect(result.is_active).toBe(false);
    });
  });

  describe('moveCategory', () => {
    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);
      categoryRepo.save.mockResolvedValue(mockCategory as any);
    });

    it('should move category to new parent', async () => {
      const newParentId = TestDataFactory.createUuid('new-parent');

      const result = await service.moveCategory(mockCategoryId, newParentId);

      expect(result.parent_category_id).toBe(newParentId);
      expect(categoryRepo.save).toHaveBeenCalled();
    });

    it('should move category to root (null parent)', async () => {
      const result = await service.moveCategory(mockCategoryId, null);

      expect(result.parent_category_id).toBeUndefined();
    });

    it('should throw BadRequestException if creating circular reference', async () => {
      // Mock category hierarchy: child -> parent -> grandparent
      const child = { ...mockCategory, id: 'child', parent_category_id: 'parent' };
      const parent = { ...mockCategory, id: 'parent', parent_category_id: 'grandparent' };
      const grandparent = { ...mockCategory, id: 'grandparent', parent_category_id: null };

      categoryRepo.findOne
        .mockResolvedValueOnce(grandparent as any) // Initial category
        .mockResolvedValueOnce(child as any) // Check descendant
        .mockResolvedValueOnce(parent as any) // Check descendant
        .mockResolvedValueOnce(grandparent as any); // Find grandparent in chain

      await expect(service.moveCategory('grandparent', 'child')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.moveCategory('grandparent', 'child')).rejects.toThrow(
        'Cannot move category to its own descendant',
      );
    });
  });

  // =========================================================================
  // DELETE OPERATION
  // =========================================================================

  describe('delete', () => {
    beforeEach(() => {
      categoryRepo.findOne.mockResolvedValue(mockCategory as any);
      categoryRepo.remove.mockResolvedValue(mockCategory as any);
    });

    it('should delete category without children', async () => {
      categoryRepo.find.mockResolvedValue([]);

      await service.delete(mockCategoryId);

      expect(categoryRepo.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw BadRequestException if category has children', async () => {
      categoryRepo.find.mockResolvedValue([mockChildCategory] as any);

      await expect(service.delete(mockCategoryId)).rejects.toThrow(BadRequestException);
      await expect(service.delete(mockCategoryId)).rejects.toThrow(
        'Cannot delete category with subcategories',
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(mockCategoryId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // STATISTICS
  // =========================================================================

  describe('getStats', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = createMockQueryBuilder();
      categoryRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return category statistics', async () => {
      categoryRepo.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // active
        .mockResolvedValueOnce(20); // root categories

      mockQueryBuilder.getCount.mockResolvedValue(15); // with children

      const result = await service.getStats();

      expect(result).toEqual({
        total: 100,
        active: 85,
        inactive: 15,
        root_categories: 20,
        with_children: 15,
      });
    });

    it('should calculate inactive count correctly', async () => {
      categoryRepo.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(40) // active
        .mockResolvedValueOnce(10); // root

      mockQueryBuilder.getCount.mockResolvedValue(5);

      const result = await service.getStats();

      expect(result.inactive).toBe(10); // 50 - 40
    });
  });
});
