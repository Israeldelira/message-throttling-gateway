import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DispatcherService } from './dispatcher.service';

@Injectable()
export class DispatcherScheduler implements OnModuleInit, OnModuleDestroy {
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(
    private readonly dispatcherService: DispatcherService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const dispatchIntervalMs = this.configService.get<number>(
      'dispatcher.intervalMs',
    );
    this.intervalId = setInterval(() => {
      console.log('Running scheduled message dispatch...');
      void this.dispatcherService.dispatchMessages();
    }, dispatchIntervalMs);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
