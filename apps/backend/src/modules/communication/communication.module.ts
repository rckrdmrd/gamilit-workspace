import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';

/**
 * CommunicationModule
 *
 * Manages conversation entities for the communication schema.
 * Currently entity-only (no services/controllers) — entities are consumed
 * by TeacherModule for teacher-student communication features.
 *
 * @entities Conversation, ConversationParticipant
 * @schema communication
 * @datasource communication
 * @ticket GAP-SOC-003, H-017
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Conversation, ConversationParticipant],
      'communication',
    ),
  ],
  exports: [TypeOrmModule],
})
export class CommunicationModule {}
