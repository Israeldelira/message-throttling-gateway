import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateMessageDto, MessageStatusQueryDto } from './dto/message.dto';
import { Message } from './entities/message.entity';
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

  async getStatusOverview(query: MessageStatusQueryDto) {
    if (query.externalMessageId && query.internalMessageId) {
      throw new BadRequestException(
        'Use internalMessageId or externalMessageId, but not both at the same time.',
      );
    }

    const [total, received, retrying, sent, failed] = await Promise.all([
      this.messageRepository.count(),
      this.messageRepository.countBy({ status: MessageStatus.RECEIVED }),
      this.messageRepository.countBy({ status: MessageStatus.RETRYING }),
      this.messageRepository.countBy({ status: MessageStatus.SENT }),
      this.messageRepository.countBy({ status: MessageStatus.FAILED }),
    ]);

    const response = {
      metrics: {
        total,
        queueDepth: received + retrying,
        received,
        retrying,
        sent,
        failed,
      },
    };

    if (!query.externalMessageId && !query.internalMessageId) {
      return response;
    }

    const message = await this.findOneForStatus(query);

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    return {
      ...response,
      message: {
        internalMessageId: message.id,
        externalMessageId: message.externalMessageId,
        recipient: message.recipient,
        status: message.status,
        attempts: message.attempts,
        errorDetail: message.errorDetail,
        receivedAt: message.receivedAt,
        lastAttemptAt: message.lastAttemptAt,
        sentAt: message.sentAt,
        updatedAt: message.updatedAt,
      },
    };
  }

  private findOneForStatus(query: MessageStatusQueryDto) {
    if (query.internalMessageId) {
      return this.messageRepository.findOne({
        where: { id: query.internalMessageId },
      });
    }

    return this.messageRepository.findOne({
      where: { externalMessageId: query.externalMessageId },
    });
  }
}
