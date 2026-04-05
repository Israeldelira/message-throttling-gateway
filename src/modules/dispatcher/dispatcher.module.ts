import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherService } from './dispatcher.service';

@Module({
  imports: [MessagesModule],
  controllers: [DispatcherController],
  providers: [DispatcherService],
})
export class DispatcherModule {}
