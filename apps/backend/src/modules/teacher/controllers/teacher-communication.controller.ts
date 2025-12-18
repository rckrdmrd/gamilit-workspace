import { Controller, Get, Post, Param, Query, Body, UseGuards, Req, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import { TeacherMessagesService } from '../services/teacher-messages.service';
import {
  SendMessageDto,
  SendClassroomAnnouncementDto,
  SendPrivateFeedbackDto,
  GetMessagesQueryDto,
  MessageResponseDto,
  MessagesListResponseDto,
  ConversationDto,
  UnreadCountDto,
} from '../dto/teacher-messages.dto';

/**
 * TeacherCommunicationController
 *
 * @description Controller para comunicación entre teachers y estudiantes
 * @module teacher
 *
 * Endpoints disponibles:
 * - GET /teacher/messages - Listar mensajes con filtros
 * - POST /teacher/messages - Enviar mensaje directo
 * - GET /teacher/messages/conversations - Obtener conversaciones
 * - GET /teacher/messages/unread-count - Contador de no leídos
 * - GET /teacher/messages/:id - Obtener mensaje específico
 * - POST /teacher/messages/:id/read - Marcar como leído
 * - POST /teacher/messages/classroom/:classroomId/announcement - Anuncio a classroom
 * - POST /teacher/messages/student/:studentId/feedback - Feedback privado
 *
 * Autenticación:
 * - Requiere JWT token válido
 * - Requiere rol: ADMIN_TEACHER o SUPER_ADMIN
 *
 * @see Service: TeacherMessagesService
 * @see DTOs: teacher-messages.dto.ts
 * @see Entities: Message, MessageParticipant
 */
@ApiTags('Teacher - Comunicación')
@ApiBearerAuth()
@Controller('teacher/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
export class TeacherCommunicationController {
  constructor(private readonly messagesService: TeacherMessagesService) {}

  /**
   * Obtener listado de mensajes con filtros
   *
   * Permite filtrar por:
   * - classroom_id: Mensajes de un classroom específico
   * - type: Tipo de mensaje
   * - unread: Solo no leídos
   * - search: Búsqueda en subject, content o sender
   *
   * Soporta paginación con limit y offset.
   *
   * @param query - Filtros y paginación
   * @param req - Request con información del usuario
   * @returns Lista paginada de mensajes
   */
  @Get()
  @ApiOperation({ summary: 'Obtener listado de mensajes con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes obtenida', type: MessagesListResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async getMessages(@Query() query: GetMessagesQueryDto, @Req() req: Request & { user: any }): Promise<MessagesListResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.getMessages(teacherId, tenantId, query);
  }

  /**
   * Enviar mensaje directo a estudiantes
   *
   * Permite enviar mensajes a uno o varios estudiantes.
   * Opcionalmente puede asociarse a un classroom o assignment.
   *
   * @param dto - Datos del mensaje
   * @param req - Request con información del usuario
   * @returns Mensaje creado
   */
  @Post()
  @ApiOperation({ summary: 'Enviar mensaje directo' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: Request & { user: any }): Promise<MessageResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.sendMessage(teacherId, tenantId, dto);
  }

  /**
   * Obtener conversaciones agrupadas
   *
   * Agrupa mensajes en conversaciones con otros usuarios.
   * Incluye contador de mensajes no leídos por conversación.
   *
   * @param req - Request con información del usuario
   * @returns Lista de conversaciones
   */
  @Get('conversations')
  @ApiOperation({ summary: 'Obtener conversaciones agrupadas' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones obtenida', type: [ConversationDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async getConversations(@Req() req: Request & { user: any }): Promise<ConversationDto[]> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.getConversations(teacherId, tenantId);
  }

  /**
   * Obtener contador de mensajes no leídos
   *
   * Utiliza la función SQL get_unread_count(user_id) para obtener
   * el total de mensajes no leídos del teacher.
   *
   * @param req - Request con información del usuario
   * @returns Contador de no leídos
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener conteo de mensajes no leídos' })
  @ApiResponse({ status: 200, description: 'Contador obtenido', type: UnreadCountDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async getUnreadCount(@Req() req: Request & { user: any }): Promise<UnreadCountDto> {
    const teacherId = req.user.sub;
    return this.messagesService.getUnreadCount(teacherId);
  }

  /**
   * Obtener detalle de mensaje específico
   *
   * @param id - UUID del mensaje
   * @param req - Request con información del usuario
   * @returns Mensaje completo con recipients
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de mensaje específico' })
  @ApiParam({ name: 'id', description: 'UUID del mensaje', type: String })
  @ApiResponse({ status: 200, description: 'Mensaje obtenido', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async getMessage(@Param('id') id: string, @Req() req: Request & { user: any }): Promise<MessageResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.getMessageById(id, teacherId, tenantId);
  }

  /**
   * Marcar mensaje como leído
   *
   * Actualiza el estado de lectura del mensaje para el teacher.
   * Si todos los recipients lo han leído, actualiza también el mensaje.
   *
   * @param id - UUID del mensaje
   * @param req - Request con información del usuario
   * @returns Mensaje de confirmación
   */
  @Post(':id/read')
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  @ApiParam({ name: 'id', description: 'UUID del mensaje', type: String })
  @ApiResponse({ status: 200, description: 'Mensaje marcado como leído' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  async markAsRead(@Param('id') id: string, @Req() req: Request & { user: any }): Promise<{ message: string }> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    await this.messagesService.markAsRead(id, teacherId, tenantId);
    return { message: 'Mensaje marcado como leído' };
  }

  /**
   * Enviar anuncio a classroom completo
   *
   * Envía un mensaje tipo 'classroom_announcement' a todos los estudiantes
   * del classroom especificado.
   *
   * @param classroomId - UUID del classroom
   * @param dto - Datos del anuncio
   * @param req - Request con información del usuario
   * @returns Mensaje creado
   */
  @Post('classroom/:classroomId/announcement')
  @ApiOperation({ summary: 'Enviar anuncio a classroom completo' })
  @ApiParam({ name: 'classroomId', description: 'UUID del classroom', type: String })
  @ApiResponse({ status: 201, description: 'Anuncio enviado', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'No hay estudiantes en el classroom' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado al classroom' })
  async sendClassroomAnnouncement(
    @Param('classroomId') classroomId: string,
      @Body() dto: SendClassroomAnnouncementDto,
      @Req() req: Request & { user: any },
  ): Promise<MessageResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.sendClassroomAnnouncement(classroomId, teacherId, tenantId, dto);
  }

  /**
   * Enviar feedback privado a estudiante
   *
   * Envía un mensaje tipo 'private_feedback' a un estudiante específico.
   * Opcionalmente puede asociarse a un assignment o submission.
   *
   * @param studentId - UUID del estudiante
   * @param dto - Datos del feedback
   * @param req - Request con información del usuario
   * @returns Mensaje creado
   */
  @Post('student/:studentId/feedback')
  @ApiOperation({ summary: 'Enviar feedback privado a estudiante' })
  @ApiParam({ name: 'studentId', description: 'UUID del estudiante', type: String })
  @ApiResponse({ status: 201, description: 'Feedback enviado', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async sendPrivateFeedback(
    @Param('studentId') studentId: string,
      @Body() dto: SendPrivateFeedbackDto,
      @Req() req: Request & { user: any },
  ): Promise<MessageResponseDto> {
    const teacherId = req.user.sub;
    const tenantId = req.user.tenant_id;
    return this.messagesService.sendPrivateFeedback(studentId, teacherId, tenantId, dto);
  }
}
