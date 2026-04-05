import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from '../messages/entities/message.entity';
import { MessagesService } from '../messages/messages.service';

const MAX_MESSAGES_PER_SECOND = 100;

@Injectable()
export class DispatcherService {
  private isProcessing = false;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {}

  async dispatchMessages() {
    if (this.isProcessing) {
      return {
        processed: 0,
        sent: 0,
        failed: 0,
        maxPerSecond: MAX_MESSAGES_PER_SECOND,
      };
    }

    this.isProcessing = true;

    try {
      const messagesToSend = await this.messagesService.findMessagesToSend(
        MAX_MESSAGES_PER_SECOND,
      );
      let sent = 0;
      let failed = 0;

      for (const message of messagesToSend) {
        try {
          await this.sendMessageToMockProvider(message);
          await this.messagesService.markAsSent(message);
          sent += 1;
        } catch (error) {
          console.error(`Error sending message ID ${message.id}:`, error);
          const errorDetail =
            error instanceof Error ? error.message : 'Unknown provider error';

          await this.messagesService.markAsFailed(message, errorDetail);
          failed += 1;
        }
      }

      return {
        processed: messagesToSend.length,
        sent,
        failed,
        maxPerSecond: MAX_MESSAGES_PER_SECOND,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendMessageToMockProvider(message: Message) {
    const port = this.configService.get<number>('port') ?? 3000;
    const mockProviderMessageUrl = `http://localhost:${port}/mock-provider/messages`;

    const response = await fetch(mockProviderMessageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: message.id,
        recipient: message.recipient,
        content: message.content,
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.text();

      throw new Error(
        `Provider C responded with status ${response.status}: ${errorDetail}`,
      );
    }

    return response;
  }
}
