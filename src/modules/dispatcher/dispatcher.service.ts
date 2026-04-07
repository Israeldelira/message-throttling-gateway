import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class DispatcherService {
  private isProcessing = false;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {}

  async dispatchMessages() {
    const messageLimit = this.configService.get<number>('messageLimit')!;
    const intervalMs = this.configService.get<number>('dispatcher.intervalMs')!;
    const timeoutMs = this.configService.get<number>(
      'dispatcher.requestTimeoutMs',
    )!;
    const port = this.configService.get<number>('port')!;
    const providerUrl = `http://localhost:${port}/mock-provider/messages`;
    const delayBetweenMessagesMs = Math.ceil(intervalMs / messageLimit);

    if (this.isProcessing) {
      return {
        processed: 0,
        sent: 0,
        retrying: 0,
        messageLimit,
        intervalMs,
      };
    }

    this.isProcessing = true;
    const stats = { processed: 0, sent: 0, retrying: 0 };
    const cycleStartedAt = Date.now();

    try {
      while (Date.now() - cycleStartedAt < intervalMs) {
        if (stats.processed > 0) {
          await new Promise((resolve) => {
            setTimeout(resolve, delayBetweenMessagesMs);
          });
        }

        if (Date.now() - cycleStartedAt >= intervalMs) {
          break;
        }

        const message = await this.messagesService.findNextMessageToProcess();
        if (!message) break;

        stats.processed++;

        const abort = new AbortController();
        const timeoutId = setTimeout(() => abort.abort(), timeoutMs);

        try {
          const response = await fetch(providerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageId: message.id,
              recipient: message.recipient,
              content: message.content,
            }),
            signal: abort.signal,
          });

          if (!response.ok) {
            throw Object.assign(
              new Error(
                `Provider responded with status ${response.status}: ${await response.text()}`,
              ),
              { statusCode: response.status },
            );
          }

          await this.messagesService.markAsSent(message);
          stats.sent++;
        } catch (error) {
          console.error(`Error sending message ID ${message.id}:`, error);

          if ((error as { statusCode?: number })?.statusCode === 429) {
            console.warn(
              `Provider rate limit exceeded. Message ID ${message.id} remains pending for retry.`,
            );
          }

          await this.messagesService.markAsRetrying(
            message,
            'Provider request failed',
          );
          stats.retrying++;
          break;
        } finally {
          clearTimeout(timeoutId);
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { ...stats, messageLimit, intervalMs };
  }
}
