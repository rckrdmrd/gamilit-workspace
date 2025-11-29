import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationTypeEnum } from '@shared/constants/enums.constants';

export class GetNotificationsQueryDto {
  @ApiProperty({
    description: 'Filter by notification type',
    enum: NotificationTypeEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationTypeEnum)
    type?: NotificationTypeEnum;

  @ApiProperty({
    description: 'Filter by read status',
    required: false,
    enum: ['read', 'unread', 'all'],
    example: 'all',
  })
  @IsOptional()
  @IsIn(['read', 'unread', 'all'])
    status?: 'read' | 'unread' | 'all';

  @ApiProperty({
    description: 'Page number (1-indexed)',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
    page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
    limit?: number = 20;
}
