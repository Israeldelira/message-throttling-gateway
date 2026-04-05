import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from './dispatcher.service';
import { MessagesService } from '../messages/messages.service';

describe('DispatcherService', () => {
  let service: DispatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatcherService,
        {
          provide: MessagesService,
          useValue: {
            findMessagesToSend: jest.fn(),
            markAsSent: jest.fn(),
            markAsFailed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DispatcherService>(DispatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
