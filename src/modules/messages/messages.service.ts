import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageStatus } from './enums/message-status.enum';

const CHUNK_SIZE = 1000;
const RECIPIENT_PHONE = '+521234000000';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource,
  ) {}

  //Metodo transaccional para asegurar la insersion total de los mensajes
  async insertMessages(total: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inserted = 0;

      for (let start = 0; start < total; start += CHUNK_SIZE) {
        const batchSize = CHUNK_SIZE;

        const chunk: {
          recipient: string;
          content: string;
          status: MessageStatus;
        }[] = [];

        for (let i = 0; i < batchSize; i++) {
          chunk.push({
            recipient: RECIPIENT_PHONE,
            content: `Test message number ${start + i + 1}`,
            status: MessageStatus.RECEIVED,
          });
        }

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Message)
          .values(chunk)
          .execute();

        inserted += batchSize;
      }

      await queryRunner.commitTransaction();

      return { total, inserted };
    } catch (error) {
      console.error('Error inserting messages:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
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
