import { Test, TestingModule } from '@nestjs/testing';
import { MockProviderController } from './mock-provider.controller';
import { MockProviderService } from './mock-provider.service';

describe('MockProviderController', () => {
  let controller: MockProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockProviderController],
      providers: [MockProviderService],
    }).compile();

    controller = module.get<MockProviderController>(MockProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
