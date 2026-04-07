import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DispatcherService } from './dispatcher.service';

@ApiTags('dispatcher')
@Controller('dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}
}
