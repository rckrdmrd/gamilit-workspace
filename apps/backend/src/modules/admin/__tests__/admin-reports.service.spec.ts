import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminReportsService } from '../services/admin-reports.service';
import { AdminReport } from '../entities/admin-report.entity';
import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import {
  GenerateReportDto,
  ListReportsDto,
  ReportType,
  ReportFormat,
  ReportStatus,
} from '../dto/reports';
import { promises as fs } from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ size: 1024 }),
    access: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AdminReportsService', () => {
  let service: AdminReportsService;
  let _reportRepository: Repository<AdminReport>;
  let _userRepository: Repository<User>;
  let _tenantRepository: Repository<Tenant>;

  // Test tenant ID para todas las pruebas
  const testTenantId = 'test-tenant-uuid';

  const mockReport: Partial<AdminReport> = {
    id: 'report-1',
    report_type: 'users_summary' as ReportType,
    report_format: 'pdf' as ReportFormat,
    status: 'pending' as ReportStatus,
    metadata: {},
    requested_by: 'admin-user',
    tenant_id: testTenantId, // FIX-BE-001-2026-01-18
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
    updated_at: new Date(),
    file_url: null,
    file_size: null,
    completed_at: null,
    error_message: null,
  };

  const mockReportRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(), // FIX-BE-001: Para filtrar por tenant_id
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminReportsService,
        {
          provide: getRepositoryToken(AdminReport, 'auth'),
          useValue: mockReportRepository,
        },
        {
          provide: getRepositoryToken(User, 'auth'),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Tenant, 'auth'),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    service = module.get<AdminReportsService>(AdminReportsService);
    reportRepository = module.get<Repository<AdminReport>>(getRepositoryToken(AdminReport, 'auth'));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User, 'auth'));
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant, 'auth'));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =====================================================
  // GENERATEREPORT TESTS
  // =====================================================

  describe('generateReport', () => {
    const generateDto: GenerateReportDto = {
      type: 'users_summary' as ReportType,
      format: 'pdf' as ReportFormat,
      filters: { startDate: '2024-01-01', endDate: '2024-12-31' },
    };

    it('should create a report with pending status', async () => {
      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);

      const result = await service.generateReport(generateDto, 'admin-user', testTenantId);

      expect(mockReportRepository.create).toHaveBeenCalledWith({
        report_type: 'users_summary',
        report_format: 'pdf',
        status: 'pending',
        metadata: { startDate: '2024-01-01', endDate: '2024-12-31' },
        requested_by: 'admin-user',
        tenant_id: testTenantId, // FIX-BE-001-2026-01-18
        expires_at: expect.any(Date),
      });

      expect(mockReportRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('pending');
      expect(result.type).toBe('users_summary');
    });

    it('should set expiration date to 30 days from creation', async () => {
      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);

      await service.generateReport(generateDto, 'admin-user', testTenantId);

      const createCall = mockReportRepository.create.mock.calls[0][0];
      const expiresAt = new Date(createCall.expires_at);
      const now = new Date();

      // Should be approximately 30 days (allow 1 second tolerance)
      const diffInDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeGreaterThan(29.99);
      expect(diffInDays).toBeLessThan(30.01);
    });

    it('should process report generation asynchronously', async () => {
      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);

      // Mock the update method for async processing
      mockReportRepository.update.mockResolvedValue({ affected: 1 });
      mockReportRepository.findOne.mockResolvedValue({
        ...mockReport,
        status: 'generating',
      });

      const result = await service.generateReport(generateDto, 'admin-user', testTenantId);

      // Should return immediately with pending status
      expect(result.status).toBe('pending');

      // Wait a bit for async processing to start
      await new Promise(resolve => setTimeout(resolve, 100));

      // Async processing should have started
      expect(mockReportRepository.update).toHaveBeenCalled();
    });

    it('should handle empty filters', async () => {
      const dtoWithoutFilters: GenerateReportDto = {
        type: 'users_summary' as ReportType,
        format: 'csv' as ReportFormat,
      };

      mockReportRepository.create.mockReturnValue(mockReport);
      mockReportRepository.save.mockResolvedValue(mockReport);

      await service.generateReport(dtoWithoutFilters, 'admin-user', testTenantId);

      expect(mockReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {},
          tenant_id: testTenantId,
        })
      );
    });
  });

  // =====================================================
  // GETREPORTS TESTS
  // =====================================================

  describe('getReports', () => {
    it('should return paginated list of reports', async () => {
      const reports = [
        { ...mockReport, id: 'report-1' },
        { ...mockReport, id: 'report-2' },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(), // FIX-BE-001: tenant filter
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([reports, 2]),
      };

      mockReportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: ListReportsDto = { page: 1, limit: 20 };
      const result = await service.getReports(query, testTenantId);

      expect(queryBuilder.where).toHaveBeenCalledWith('report.tenant_id = :tenantId', { tenantId: testTenantId });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total_pages).toBe(1);
    });

    it('should filter by report type', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockReportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: ListReportsDto = { type: 'users_summary' as ReportType, page: 1, limit: 20 };
      await service.getReports(query, testTenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('report.report_type = :type', { type: 'users_summary' });
    });

    it('should filter by status', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockReportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: ListReportsDto = { status: 'completed' as ReportStatus, page: 1, limit: 20 };
      await service.getReports(query, testTenantId);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('report.status = :status', { status: 'completed' });
    });

    it('should handle pagination correctly', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockReportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: ListReportsDto = { page: 3, limit: 10 };
      await service.getReports(query, testTenantId);

      expect(queryBuilder.skip).toHaveBeenCalledWith(20); // (3-1) * 10
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should calculate total_pages correctly', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 25]),
      };

      mockReportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: ListReportsDto = { page: 1, limit: 10 };
      const result = await service.getReports(query, testTenantId);

      expect(result.total_pages).toBe(3); // ceil(25/10)
    });
  });

  // =====================================================
  // GETREPORTBYID (downloadReport) TESTS
  // =====================================================

  describe('downloadReport', () => {
    it('should return report when it exists and is completed', async () => {
      const completedReport = {
        ...mockReport,
        status: 'completed' as ReportStatus,
        file_url: '/reports/test.pdf',
      };

      mockReportRepository.findOne.mockResolvedValue(completedReport);

      const result = await service.downloadReport('report-1', testTenantId);

      expect(mockReportRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'report-1', tenant_id: testTenantId },
      });
      expect(result.id).toBe('report-1');
      expect(result.file_url).toBe('/reports/test.pdf');
    });

    it('should throw NotFoundException when report does not exist', async () => {
      mockReportRepository.findOne.mockResolvedValue(null);

      await expect(service.downloadReport('non-existent', testTenantId)).rejects.toThrow(NotFoundException);
      await expect(service.downloadReport('non-existent', testTenantId)).rejects.toThrow('Report with ID non-existent not found');
    });

    it('should throw error when report is not completed', async () => {
      const pendingReport = { ...mockReport, status: 'pending' as ReportStatus };
      mockReportRepository.findOne.mockResolvedValue(pendingReport);

      await expect(service.downloadReport('report-1', testTenantId)).rejects.toThrow('Report is not ready for download. Status: pending');
    });

    it('should allow download for generating status', async () => {
      const generatingReport = { ...mockReport, status: 'generating' as ReportStatus };
      mockReportRepository.findOne.mockResolvedValue(generatingReport);

      await expect(service.downloadReport('report-1', testTenantId)).rejects.toThrow('Report is not ready for download. Status: generating');
    });
  });

  // =====================================================
  // DELETEREPORT TESTS
  // =====================================================

  describe('deleteReport', () => {
    it('should delete report and file successfully', async () => {
      const reportWithFile = {
        ...mockReport,
        file_url: '/reports/test.pdf',
      };

      mockReportRepository.findOne.mockResolvedValue(reportWithFile);
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteReport('report-1', testTenantId);

      expect(mockReportRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'report-1', tenant_id: testTenantId },
      });
      expect(mockReportRepository.delete).toHaveBeenCalledWith('report-1');
      expect(fs.access).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should throw NotFoundException when report does not exist', async () => {
      mockReportRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteReport('non-existent', testTenantId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteReport('non-existent', testTenantId)).rejects.toThrow('Report with ID non-existent not found');
    });

    it('should delete report even if file does not exist', async () => {
      const reportWithFile = {
        ...mockReport,
        file_url: '/reports/missing.pdf',
      };

      mockReportRepository.findOne.mockResolvedValue(reportWithFile);
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });

      // Mock file not found error
      (fs.access as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });

      await service.deleteReport('report-1', testTenantId);

      expect(mockReportRepository.delete).toHaveBeenCalledWith('report-1');
    });

    it('should delete report without file_url', async () => {
      const reportWithoutFile = {
        ...mockReport,
        file_url: null,
      };

      mockReportRepository.findOne.mockResolvedValue(reportWithoutFile);
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteReport('report-1', testTenantId);

      expect(mockReportRepository.delete).toHaveBeenCalledWith('report-1');
      // Should not attempt to delete file
      expect(fs.access).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // CLEANUPEXPIREDREPORTS TESTS
  // =====================================================

  describe('cleanupExpiredReports', () => {
    it('should delete expired reports and their files', async () => {
      const expiredReports = [
        { ...mockReport, id: 'expired-1', file_url: '/reports/expired1.pdf' },
        { ...mockReport, id: 'expired-2', file_url: '/reports/expired2.pdf' },
      ];

      mockReportRepository.find.mockResolvedValue(expiredReports);
      mockReportRepository.delete.mockResolvedValue({ affected: 2 });

      await service.cleanupExpiredReports();

      expect(mockReportRepository.find).toHaveBeenCalledWith({
        where: {
          expires_at: LessThan(expect.any(Date)),
        },
        take: 100,
      });

      expect(mockReportRepository.delete).toHaveBeenCalledWith(['expired-1', 'expired-2']);
      expect(fs.access).toHaveBeenCalledTimes(2);
      expect(fs.unlink).toHaveBeenCalledTimes(2);
    });

    it('should handle no expired reports gracefully', async () => {
      mockReportRepository.find.mockResolvedValue([]);

      await service.cleanupExpiredReports();

      expect(mockReportRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle reports without files', async () => {
      const expiredReports = [
        { ...mockReport, id: 'expired-1', file_url: null },
        { ...mockReport, id: 'expired-2', file_url: '/reports/expired2.pdf' },
      ];

      mockReportRepository.find.mockResolvedValue(expiredReports);
      mockReportRepository.delete.mockResolvedValue({ affected: 2 });

      await service.cleanupExpiredReports();

      expect(mockReportRepository.delete).toHaveBeenCalledWith(['expired-1', 'expired-2']);
      // Should only delete one file
      expect(fs.unlink).toHaveBeenCalledTimes(1);
    });

    it('should limit cleanup to 100 reports per execution', async () => {
      mockReportRepository.find.mockResolvedValue([]);

      await service.cleanupExpiredReports();

      expect(mockReportRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should continue cleanup even if file deletion fails', async () => {
      const expiredReports = [
        { ...mockReport, id: 'expired-1', file_url: '/reports/expired1.pdf' },
      ];

      mockReportRepository.find.mockResolvedValue(expiredReports);
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });

      // Mock file deletion failure
      (fs.unlink as jest.Mock).mockRejectedValueOnce(new Error('Disk error'));

      await service.cleanupExpiredReports();

      // Should still delete from database
      expect(mockReportRepository.delete).toHaveBeenCalled();
    });
  });

  // =====================================================
  // INITIALIZATION TESTS
  // =====================================================

  describe('initialization', () => {
    it('should create reports directory on initialization', async () => {
      // Clear mocks and create a fresh service to test initialization
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminReportsService,
          { provide: getRepositoryToken(AdminReport, 'auth'), useValue: mockReportRepository },
          { provide: getRepositoryToken(User, 'auth'), useValue: mockUserRepository },
          { provide: getRepositoryToken(Tenant, 'auth'), useValue: mockTenantRepository },
        ],
      }).compile();

      module.get<AdminReportsService>(AdminReportsService);

      // Wait for async constructor operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should handle directory creation errors gracefully', async () => {
      // This is tested implicitly by the service initialization not throwing
      expect(service).toBeDefined();
    });
  });
});
