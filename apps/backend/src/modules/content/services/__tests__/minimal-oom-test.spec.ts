import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentCategoriesService } from '../content-categories.service';
import { ContentCategory } from '../../entities/content-category.entity';
import { createMockRepository } from '@/__mocks__/repositories.mock';

describe('Minimal OOM Test with imports', () => {
  it('should create service', async () => {
    const categoryRepo = createMockRepository<ContentCategory>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentCategoriesService,
        {
          provide: getRepositoryToken(ContentCategory, 'content'),
          useValue: categoryRepo,
        },
      ],
    }).compile();
    const service = module.get<ContentCategoriesService>(ContentCategoriesService);
    expect(service).toBeDefined();
  });
});
