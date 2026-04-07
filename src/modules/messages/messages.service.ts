import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/message.dto';
import { MessageStatus } from './enums/message-status.enum';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async acceptMessage(createMessageDto: CreateMessageDto) {
    const existingMessage = await this.messageRepository.findOne({
      where: { externalMessageId: createMessageDto.externalMessageId },
    });

    if (existingMessage) {
      console.log(
        `Duplicate message ignored for externalMessageId "${createMessageDto.externalMessageId}"`,
      );
      return existingMessage;
    }

    const message = this.messageRepository.create({
      externalMessageId: createMessageDto.externalMessageId,
      recipient: createMessageDto.recipient,
      content: createMessageDto.content,
      status: MessageStatus.RECEIVED,
    });

    try {
      return await this.messageRepository.save(message);
    } catch (error) {
      const duplicatedMessage = await this.messageRepository.findOne({
        where: { externalMessageId: createMessageDto.externalMessageId },
      });

      if (!duplicatedMessage) {
        throw error;
      }

      console.log(
        `Duplicate message ignored for externalMessageId "${createMessageDto.externalMessageId}"`,
      );
      return duplicatedMessage;
    }
  }

  async findNextMessageToProcess() {
    return this.messageRepository.findOne({
      where: [
        { status: MessageStatus.RECEIVED, sentAt: IsNull() },
        { status: MessageStatus.RETRYING, sentAt: IsNull() },
      ],
      order: { id: 'ASC' },
    });
  }

  async markAsSent(message: Message) {
    const now = new Date();

    message.status = MessageStatus.SENT;
    message.attempts += 1;
    message.lastAttemptAt = now;
    message.sentAt = now;

    return this.messageRepository.save(message);
  }

  async markAsRetrying(message: Message, errorDetail: string) {
    message.status = MessageStatus.RETRYING;
    message.attempts += 1;
    message.errorDetail = errorDetail;
    message.lastAttemptAt = new Date();
    message.sentAt = null;

    return this.messageRepository.save(message);
  }
}
