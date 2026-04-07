import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SimulationResult = {
  accepted: boolean;
  error?: string;
};

@Injectable()
export class SimulatorService {
  constructor(private readonly configService: ConfigService) {}

  async simulateBurst() {
    const port = this.configService.get<number>('port')!;
    const total = this.configService.get<number>(
      'batchProcess.defaultTotalMessages',
    )!;
    const concurrency = this.configService.get<number>(
      'batchProcess.requestConcurrency',
    )!;
    const targetUrl = `http://localhost:${port}/messages`;
    const startedAt = new Date();
    const stats = {
      totalRequested: total,
      accepted: 0,
      failed: 0,
      concurrency,
      targetUrl,
      startedAt,
      finishedAt: startedAt,
      durationMs: 0,
    };

    for (let offset = 0; offset < total; offset += concurrency) {
      const batchSize = Math.min(concurrency, total - offset);
      const results = await Promise.all(
        Array.from({ length: batchSize }, (_, index) => {
          const sequence = offset + index + 1;

          return this.sendMessageToIngress(targetUrl, sequence);
        }),
      );

      for (const result of results) {
        if (result.error) {
          stats.failed += 1;
          continue;
        }

        if (result.accepted) {
          stats.accepted += 1;
        }
      }
    }

    stats.finishedAt = new Date();
    stats.durationMs = stats.finishedAt.getTime() - stats.startedAt.getTime();

    return stats;
  }

  private async sendMessageToIngress(
    targetUrl: string,
    sequence: number,
  ): Promise<SimulationResult> {
    const externalMessageId = `msg-${String(sequence).padStart(6, '0')}`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalMessageId,
          recipient: '+521234000000',
          content: `Simulated burst message ${sequence}`,
        }),
      });

      if (!response.ok) {
        return {
          accepted: false,
          error: `Ingress responded with status ${response.status}: ${await response.text()}`,
        };
      }

      return {
        accepted: true,
      };
    } catch (error) {
      return {
        accepted: false,
        error: error instanceof Error ? error.message : 'Unknown ingress error',
      };
    }
  }
}
