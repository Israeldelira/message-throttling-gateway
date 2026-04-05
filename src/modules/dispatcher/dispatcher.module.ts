import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherScheduler } from './dispatcher.scheduler';
import { DispatcherService } from './dispatcher.service';

@Module({
  imports: [MessagesModule],
  controllers: [DispatcherController],
  providers: [DispatcherService, DispatcherScheduler],
})
export class DispatcherModule {}
