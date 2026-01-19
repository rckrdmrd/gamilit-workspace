/**
 * SharedReportsService
 *
 * TASK-2026-01-18-015 Sprint 5 Task 5.3
 * Service for managing report sharing between teachers.
 */

import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { SharedReport, SharePermission } from '../entities/shared-report.entity';
import { TeacherReport } from '../entities/teacher-report.entity';

/**
 * DTO for sharing a report
 */
export interface ShareReportDto {
  reportId: string;
  sharedWithId: string;
  permission?: SharePermission;
  message?: string;
  expiresInDays?: number;
}

/**
 * Response DTO for shared report
 */
export interface SharedReportResponseDto {
  id: string;
  report_id: string;
  report_name: string;
  report_type: string;
  report_format: string;
  shared_by_id: string;
  shared_by_name?: string;
  shared_with_id: string;
  permission: string;
  message: string | null;
  viewed_at: string | null;
  expires_at: string | null;
  is_revoked: boolean;
  created_at: string;
}

/**
 * Response DTO for reports shared with me
 */
export interface SharedWithMeResponseDto extends SharedReportResponseDto {
  can_download: boolean;
  is_expired: boolean;
}

@Injectable()
export class SharedReportsService {
  private readonly logger = new Logger(SharedReportsService.name);

  constructor(
    @InjectRepository(SharedReport, 'social')
    private readonly sharedReportRepo: Repository<SharedReport>,
    @InjectRepository(TeacherReport, 'social')
    private readonly teacherReportRepo: Repository<TeacherReport>,
  ) {}

  /**
   * Share a report with another teacher
   */
  async shareReport(
    teacherId: string,
    dto: ShareReportDto,
  ): Promise<SharedReportResponseDto> {
    this.logger.log(`Teacher ${teacherId} sharing report ${dto.reportId} with ${dto.sharedWithId}`);

    // Verify report exists and belongs to the teacher
    const report = await this.teacherReportRepo.findOne({
      where: { id: dto.reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report ${dto.reportId} not found`);
    }

    if (report.teacherId !== teacherId) {
      throw new ForbiddenException('You can only share reports you own');
    }

    // Can't share with yourself
    if (dto.sharedWithId === teacherId) {
      throw new BadRequestException('You cannot share a report with yourself');
    }

    // Check if already shared with this teacher
    const existingShare = await this.sharedReportRepo.findOne({
      where: {
        reportId: dto.reportId,
        sharedWithId: dto.sharedWithId,
        isRevoked: false,
      },
    });

    if (existingShare) {
      throw new BadRequestException('Report is already shared with this teacher');
    }

    // Calculate expiration date if specified
    let expiresAt: Date | null = null;
    if (dto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expiresInDays);
    }

    const sharedReport = this.sharedReportRepo.create({
      reportId: dto.reportId,
      sharedById: teacherId,
      sharedWithId: dto.sharedWithId,
      permission: dto.permission || SharePermission.VIEW,
      message: dto.message || null,
      expiresAt,
      isRevoked: false,
    });

    const saved = await this.sharedReportRepo.save(sharedReport);

    return this.mapToResponseDto(saved, report);
  }

  /**
   * Get reports I've shared with others
   */
  async getSharedByMe(teacherId: string): Promise<SharedReportResponseDto[]> {
    const shares = await this.sharedReportRepo.find({
      where: { sharedById: teacherId, isRevoked: false },
      relations: ['report'],
      order: { createdAt: 'DESC' },
    });

    return shares.map(share => this.mapToResponseDto(share, share.report));
  }

  /**
   * Get reports others have shared with me
   */
  async getSharedWithMe(teacherId: string): Promise<SharedWithMeResponseDto[]> {
    const now = new Date();

    const shares = await this.sharedReportRepo.find({
      where: { sharedWithId: teacherId, isRevoked: false },
      relations: ['report'],
      order: { createdAt: 'DESC' },
    });

    return shares.map(share => {
      const isExpired = share.expiresAt ? share.expiresAt < now : false;
      const canDownload = share.permission === SharePermission.DOWNLOAD && !isExpired;

      return {
        ...this.mapToResponseDto(share, share.report),
        can_download: canDownload,
        is_expired: isExpired,
      };
    });
  }

  /**
   * Mark a shared report as viewed
   */
  async markAsViewed(shareId: string, teacherId: string): Promise<void> {
    const share = await this.sharedReportRepo.findOne({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Shared report ${shareId} not found`);
    }

    if (share.sharedWithId !== teacherId) {
      throw new ForbiddenException('You do not have access to this shared report');
    }

    if (!share.viewedAt) {
      share.viewedAt = new Date();
      await this.sharedReportRepo.save(share);
      this.logger.log(`Shared report ${shareId} marked as viewed by ${teacherId}`);
    }
  }

  /**
   * Revoke a shared report
   */
  async revokeShare(shareId: string, teacherId: string): Promise<void> {
    const share = await this.sharedReportRepo.findOne({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Shared report ${shareId} not found`);
    }

    if (share.sharedById !== teacherId) {
      throw new ForbiddenException('You can only revoke shares you created');
    }

    share.isRevoked = true;
    await this.sharedReportRepo.save(share);
    this.logger.log(`Share ${shareId} revoked by ${teacherId}`);
  }

  /**
   * Update share permission
   */
  async updateSharePermission(
    shareId: string,
    teacherId: string,
    permission: SharePermission,
  ): Promise<SharedReportResponseDto> {
    const share = await this.sharedReportRepo.findOne({
      where: { id: shareId },
      relations: ['report'],
    });

    if (!share) {
      throw new NotFoundException(`Shared report ${shareId} not found`);
    }

    if (share.sharedById !== teacherId) {
      throw new ForbiddenException('You can only modify shares you created');
    }

    share.permission = permission;
    const updated = await this.sharedReportRepo.save(share);

    return this.mapToResponseDto(updated, share.report);
  }

  /**
   * Check if a teacher has access to a report (either owns it or it's shared with them)
   */
  async canAccessReport(reportId: string, teacherId: string): Promise<{
    canAccess: boolean;
    canDownload: boolean;
    isOwner: boolean;
  }> {
    // Check if owner
    const report = await this.teacherReportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return { canAccess: false, canDownload: false, isOwner: false };
    }

    if (report.teacherId === teacherId) {
      return { canAccess: true, canDownload: true, isOwner: true };
    }

    // Check if shared with this teacher
    const now = new Date();
    const share = await this.sharedReportRepo.findOne({
      where: {
        reportId,
        sharedWithId: teacherId,
        isRevoked: false,
      },
    });

    if (!share) {
      return { canAccess: false, canDownload: false, isOwner: false };
    }

    // Check expiration
    if (share.expiresAt && share.expiresAt < now) {
      return { canAccess: false, canDownload: false, isOwner: false };
    }

    return {
      canAccess: true,
      canDownload: share.permission === SharePermission.DOWNLOAD,
      isOwner: false,
    };
  }

  /**
   * Get share count for a report
   */
  async getShareCount(reportId: string, teacherId: string): Promise<number> {
    // Verify ownership
    const report = await this.teacherReportRepo.findOne({
      where: { id: reportId },
    });

    if (!report || report.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return this.sharedReportRepo.count({
      where: { reportId, isRevoked: false },
    });
  }

  /**
   * Clean up expired shares (could be run as a cron job)
   */
  async cleanupExpiredShares(): Promise<number> {
    const now = new Date();

    const result = await this.sharedReportRepo
      .createQueryBuilder()
      .update(SharedReport)
      .set({ isRevoked: true })
      .where('expires_at < :now', { now })
      .andWhere('is_revoked = false')
      .execute();

    const affected = result.affected || 0;
    if (affected > 0) {
      this.logger.log(`Cleaned up ${affected} expired shares`);
    }

    return affected;
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(share: SharedReport, report?: TeacherReport): SharedReportResponseDto {
    return {
      id: share.id,
      report_id: share.reportId,
      report_name: report?.reportName || 'Unknown Report',
      report_type: report?.reportType || 'unknown',
      report_format: report?.reportFormat || 'unknown',
      shared_by_id: share.sharedById,
      shared_with_id: share.sharedWithId,
      permission: share.permission,
      message: share.message,
      viewed_at: share.viewedAt?.toISOString() || null,
      expires_at: share.expiresAt?.toISOString() || null,
      is_revoked: share.isRevoked,
      created_at: share.createdAt.toISOString(),
    };
  }
}
