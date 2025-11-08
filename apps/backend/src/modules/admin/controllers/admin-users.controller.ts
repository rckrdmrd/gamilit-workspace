import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminUsersService } from '../services/admin-users.service';
import {
  ListUsersDto,
  UpdateUserDto,
  SuspendUserDto,
  PaginatedUsersDto,
  UserStatsDto,
} from '../dto/users';
import { User } from '@modules/auth/entities/user.entity';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users with filters and pagination' })
  async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
    return await this.adminUsersService.listUsers(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(): Promise<UserStatsDto> {
    return await this.adminUsersService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  async getUserDetails(@Param('id') id: string): Promise<User> {
    return await this.adminUsersService.getUserDetails(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user information' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<User> {
    return await this.adminUsersService.updateUser(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.adminUsersService.deleteUser(id);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  async suspendUser(
    @Param('id') id: string,
    @Body() suspendDto: SuspendUserDto,
  ): Promise<User> {
    return await this.adminUsersService.suspendUser(id, suspendDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate suspended user account' })
  async activateUser(@Param('id') id: string): Promise<User> {
    return await this.adminUsersService.activateUser(id);
  }

  @Post(':id/unsuspend')
  @ApiOperation({
    summary: 'Unsuspend user account',
    description: 'Removes suspension from a user account, restoring normal access. Alias for activate endpoint.',
  })
  async unsuspendUser(@Param('id') id: string): Promise<User> {
    return await this.adminUsersService.unsuspendUser(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate user account',
    description: 'Temporarily deactivate a user account without full suspension. User can be reactivated later.',
  })
  async deactivateUser(
    @Param('id') id: string,
    @Body() deactivateDto: SuspendUserDto,
  ): Promise<User> {
    return await this.adminUsersService.deactivateUser(id, deactivateDto);
  }
}
