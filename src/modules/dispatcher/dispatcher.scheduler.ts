import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DispatcherService } from './dispatcher.service';

const DISPATCH_INTERVAL_MS = 1000;

@Injectable()
export class DispatcherScheduler {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @Interval(DISPATCH_INTERVAL_MS)
  async runAutomaticDispatch() {
    await this.dispatcherService.dispatchMessages();
  }
}
