import { ApiProperty } from '@nestjs/swagger';
import { ModuleProgressDetailDto } from './module-progress-detail.dto';
import { RecentSubmissionDto } from './recent-submission.dto';

/**
 * DTO for user info in student progress
 */
export class UserInfoDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'Display name' })
  display_name!: string;

  @ApiProperty({ description: 'Email' })
  email!: string;

  @ApiProperty({ description: 'User status' })
  status!: string;

  @ApiProperty({ description: 'Current level' })
  level!: number;

  @ApiProperty({ description: 'Total XP' })
  total_xp!: number;

  @ApiProperty({ description: 'ML Coins balance' })
  ml_coins!: number;

  @ApiProperty({ description: 'Exercises completed' })
  exercises_completed!: number;

  @ApiProperty({ description: 'Modules completed' })
  modules_completed!: number;

  @ApiProperty({ description: 'Current streak days' })
  streak_days!: number;

  @ApiProperty({ description: 'Maximum streak days' })
  max_streak!: number;

  @ApiProperty({ description: 'Achievements earned' })
  achievements_earned!: number;

  @ApiProperty({ description: 'Last activity timestamp', nullable: true })
  last_activity_at!: string | null;
}

/**
 * DTO for comprehensive student progress data
 * Includes user info, module progress, and recent submissions
 */
export class StudentProgressDto {
  @ApiProperty({
    description: 'User information and statistics',
    type: UserInfoDto,
  })
  user_info!: UserInfoDto;

  @ApiProperty({
    description: 'Module progress details',
    type: [ModuleProgressDetailDto],
  })
  modules_progress!: ModuleProgressDetailDto[];

  @ApiProperty({
    description: 'Recent exercise submissions',
    type: [RecentSubmissionDto],
  })
  recent_submissions!: RecentSubmissionDto[];
}
