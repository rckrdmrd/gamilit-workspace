/**
 * ParentAuthController
 *
 * EXT-011 Parent Portal - Authentication Controller
 *
 * @description Handles parent authentication endpoints (public).
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ParentAuthService } from '../services/parent-auth.service';
import { ParentRegisterDto } from '../dto/parent-register.dto';
import { ParentLoginDto } from '../dto/parent-login.dto';
import { ParentAuthResponseDto, ParentAuthTokensDto } from '../dto/parent-response.dto';

@ApiTags('Parent Portal - Auth')
@Controller('parent-portal/auth')
export class ParentAuthController {
  constructor(private readonly authService: ParentAuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register parent account',
    description: 'Creates a new parent account with email and password',
  })
  @ApiBody({ type: ParentRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Parent account created successfully',
    type: ParentAuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: ParentRegisterDto): Promise<ParentAuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login to parent account',
    description: 'Authenticates parent and returns JWT tokens',
  })
  @ApiBody({ type: ParentLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ParentAuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: ParentLoginDto): Promise<ParentAuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Gets a new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ParentAuthTokensDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<ParentAuthTokensDto> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends password reset email to parent',
  })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(email);
    return { message: 'Si existe una cuenta con ese email, recibiras un correo para restablecer tu contrasena' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies parent email using verification token',
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body('token') token: string): Promise<{ message: string }> {
    await this.authService.verifyEmail(token);
    return { message: 'Email verificado correctamente' };
  }
}
