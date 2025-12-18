import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserDeviceService } from '../services/user-device.service';
import { PushNotificationService } from '../services/push-notification.service';
import { JwtAuthGuard } from '@/modules/auth/guards';
import {
  RegisterDeviceDto,
  UpdateDeviceNameDto,
  DeviceResponseDto,
  DevicesListResponseDto,
} from '../dto/devices';
import { AuthRequest } from '@shared/types';

/**
 * NotificationDevicesController
 *
 * @description Controller para dispositivos de push notifications (EXT-003)
 * @version 1.0 (2025-11-13)
 *
 * Rutas: /notifications/devices/*
 *
 * Endpoints:
 * - POST /devices - Registrar dispositivo
 * - GET /devices - Obtener dispositivos del usuario
 * - GET /devices/:id - Obtener dispositivo específico
 * - PATCH /devices/:id - Actualizar nombre del dispositivo
 * - DELETE /devices/:id - Eliminar dispositivo
 *
 * Seguridad:
 * - Todos los endpoints requieren autenticación JWT
 * - Usuario solo puede gestionar sus propios dispositivos
 *
 * IMPORTANTE:
 * - userId se extrae del JWT (req.user.sub)
 * - Device tokens se ocultan parcialmente en responses
 * - Solo dispositivos activos reciben push notifications
 */
@ApiTags('notifications-devices')
@Controller('notifications/devices')
export class NotificationDevicesController {
  constructor(
    private readonly deviceService: UserDeviceService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  /**
   * GET /notifications/devices/vapid-public-key
   *
   * Obtener clave pública VAPID para subscripciones de push
   *
   * Este endpoint NO requiere autenticación ya que la clave pública
   * es necesaria ANTES de que el usuario pueda autenticarse
   *
   * El frontend usa esta clave para crear PushSubscriptions
   */
  @Get('vapid-public-key')
  @ApiOperation({
    summary: 'Get VAPID public key',
    description:
      'Returns the VAPID public key needed for creating push subscriptions in the browser',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns VAPID public key',
    schema: {
      type: 'object',
      properties: {
        vapidPublicKey: {
          type: 'string',
          example:
            'BN4GvZtEZiZuqaaObWga7lEP-S1WCv7L1c_qfPPaZ6M7V...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Push notifications not configured',
  })
  getVapidPublicKey() {
    const key = this.pushNotificationService.getVapidPublicKey();
    if (!key) {
      throw new BadRequestException('Push notifications not configured');
    }
    return { vapidPublicKey: key };
  }

  /**
   * POST /notifications/devices
   *
   * Registrar dispositivo para push notifications
   *
   * Flujo:
   * 1. App obtiene PushSubscription del navegador
   * 2. App convierte subscription a JSON y lo envía a este endpoint
   * 3. Backend registra con upsert (actualiza si existe)
   * 4. Usuario queda habilitado para recibir push
   *
   * IMPORTANTE:
   * - Usa patrón upsert: actualiza last_used_at si ya existe
   * - Device tokens ahora son JSON strings de PushSubscription
   * - Cliente debe re-registrar cuando obtiene nueva subscription
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar dispositivo',
    description:
      'Registra un dispositivo para recibir push notifications. ' +
      'Usa patrón upsert (actualiza si ya existe).',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispositivo registrado exitosamente',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o tipo de dispositivo no soportado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async registerDevice(
    @Body() registerDto: RegisterDeviceDto,
      @Request() req: AuthRequest,
  ): Promise<DeviceResponseDto> {
    const userId = req.user!.id;

    const device = await this.deviceService.registerDevice({
      userId,
      deviceToken: registerDto.deviceToken,
      deviceType: registerDto.deviceType,
      deviceName: registerDto.deviceName,
    });

    // Ocultar parcialmente el token por seguridad
    return {
      ...device,
      deviceToken: this.maskToken(device.deviceToken),
    } as DeviceResponseDto;
  }

  /**
   * GET /notifications/devices
   *
   * Obtener todos los dispositivos del usuario
   *
   * Por defecto, solo retorna dispositivos activos
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener dispositivos del usuario',
    description: 'Retorna lista de dispositivos registrados (solo activos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de dispositivos obtenida exitosamente',
    type: DevicesListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getUserDevices(@Request() req: AuthRequest): Promise<DevicesListResponseDto> {
    const userId = req.user!.id;
    const devices = await this.deviceService.getUserDevices(userId, false);

    // Ocultar parcialmente los tokens
    const devicesWithMaskedTokens = devices.map((device) => ({
      ...device,
      deviceToken: this.maskToken(device.deviceToken),
    }));

    return {
      devices: devicesWithMaskedTokens as DeviceResponseDto[],
    };
  }

  /**
   * GET /notifications/devices/:id
   *
   * Obtener dispositivo específico
   *
   * Valida ownership automáticamente
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener dispositivo por ID',
    description: 'Retorna dispositivo específico si pertenece al usuario',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del dispositivo',
    example: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispositivo encontrado',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dispositivo no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getDeviceById(
    @Param('id') deviceId: string,
      @Request() req: AuthRequest,
  ): Promise<DeviceResponseDto> {
    const userId = req.user!.id;
    const device = await this.deviceService.getDeviceById(deviceId, userId);

    return {
      ...device,
      deviceToken: this.maskToken(device.deviceToken),
    } as DeviceResponseDto;
  }

  /**
   * PATCH /notifications/devices/:id
   *
   * Actualizar nombre del dispositivo
   *
   * Permite al usuario personalizar el nombre del dispositivo
   * para identificarlo más fácilmente en settings
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar nombre del dispositivo',
    description: 'Actualiza el nombre descriptivo del dispositivo',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del dispositivo',
    example: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispositivo actualizado exitosamente',
    type: DeviceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dispositivo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async updateDeviceName(
    @Param('id') deviceId: string,
      @Body() updateDto: UpdateDeviceNameDto,
      @Request() req: AuthRequest,
  ): Promise<DeviceResponseDto> {
    const userId = req.user!.id;

    const device = await this.deviceService.updateDeviceName(
      deviceId,
      userId,
      updateDto.deviceName,
    );

    return {
      ...device,
      deviceToken: this.maskToken(device.deviceToken),
    } as DeviceResponseDto;
  }

  /**
   * DELETE /notifications/devices/:id
   *
   * Eliminar dispositivo
   *
   * Casos de uso:
   * - Usuario ya no usa ese dispositivo
   * - Usuario quiere dejar de recibir push en ese dispositivo
   * - Dispositivo perdido/robado
   *
   * IMPORTANTE:
   * - Elimina permanentemente el registro
   * - Usuario debe re-registrar si quiere recibir push nuevamente
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar dispositivo',
    description:
      'Elimina un dispositivo registrado. ' +
      'El dispositivo dejará de recibir push notifications.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del dispositivo',
    example: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  })
  @ApiResponse({
    status: 204,
    description: 'Dispositivo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Dispositivo no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async deleteDevice(
    @Param('id') deviceId: string,
      @Request() req: AuthRequest,
  ): Promise<void> {
    const userId = req.user!.id;
    await this.deviceService.deleteDevice(deviceId, userId);
  }

  /**
   * Ocultar parcialmente el device token por seguridad
   *
   * Muestra solo los primeros 20 caracteres + "..."
   *
   * @private
   * @param token - Token completo
   * @returns Token parcialmente oculto
   */
  private maskToken(token: string): string {
    if (!token || token.length <= 20) {
      return token;
    }
    return token.substring(0, 20) + '...';
  }
}
