import { Injectable } from '@nestjs/common';

@Injectable()
export class MockProviderService {
  private readonly receivedMessages: {
    messageId: number;
    recipient: string;
    content: string;
    receivedAt: string;
  }[] = [];

  receiveMessage(message: {
    messageId: number;
    recipient: string;
    content: string;
  }) {
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
}
