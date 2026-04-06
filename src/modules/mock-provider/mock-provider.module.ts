import { Module } from '@nestjs/common';
import { MockProviderController } from './mock-provider.controller';
import { MockProviderService } from './mock-provider.service';

@Module({
  controllers: [MockProviderController],
  providers: [MockProviderService],
})
export class MockProviderModule {}
