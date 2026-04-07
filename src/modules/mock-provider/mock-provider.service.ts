import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ONE_SECOND_WINDOW_MS = 1000;

@Injectable()
export class MockProviderService {
  private windowStartedAt = Date.now();
  private messagesInCurrentWindow = 0;
  private readonly receivedMessages: {
    messageId: number;
    recipient: string;
    content: string;
    receivedAt: string;
  }[] = [];

  constructor(private readonly configService: ConfigService) {}

  receiveMessage(message: {
    messageId: number;
    recipient: string;
    content: string;
  }) {
    this.validateRateLimit();

    const receivedAt = new Date().toISOString();

    this.receivedMessages.push({
      ...message,
      receivedAt,
    });

    return {
      accepted: true,
      providerMessageId: `mock-${message.messageId}`,
      receivedAt,
    };
  }

  private validateRateLimit() {
    const maxMessagesPerSecond = this.configService.get<number>(
      'mockProvider.maxMessagesPerSecond',
    )!;
    const now = Date.now();

    if (now - this.windowStartedAt >= ONE_SECOND_WINDOW_MS) {
      this.windowStartedAt = now;
      this.messagesInCurrentWindow = 0;
    }

    if (this.messagesInCurrentWindow >= maxMessagesPerSecond) {
      throw new HttpException(
        'Mock provider rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.messagesInCurrentWindow += 1;
  }
}
