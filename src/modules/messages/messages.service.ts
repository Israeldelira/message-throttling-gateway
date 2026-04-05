import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  async create(messageData: Partial<Message>) {
    const message = this.messagesRepository.create(messageData);

    return this.messagesRepository.save(message);
  }

  async findAll() {
    return this.messagesRepository.find({
      order: { receivedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.messagesRepository.findOne({
      where: { id },
    });
  }
}
