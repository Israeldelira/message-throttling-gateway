import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('batch-process')
  @ApiOperation({
    summary: 'Genera e inserta 100,000 mensajes de prueba',
    description:
      'Automatiza la primera etapa de la prueba tecnica: crea 100,000 mensajes con status received y los inserta en la bd por lotes.',
  })
  @ApiOkResponse({
    description:
      'Resumen del proceso de insercion masiva ejecutado sobre los mensajes generados automaticamente.',
    schema: {
      example: {
        total: 100000,
        inserted: 100000,
      },
    },
  })
  batchProcess() {
    const total = 100_000;
    return this.messagesService.insertMessages(total);
  }
}
