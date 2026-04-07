import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DispatcherService } from './dispatcher.service';

@ApiTags('dispatcher')
@Controller('dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @Post('process')
  @ApiOperation({
    summary: 'Despacha manualmente mensajes al mock provider',
    description:
      'Procesa mensajes en orden estricto por id. En cada ciclo envia un mensaje a la vez y, si ocurre cualquier error, lo deja en retry hasta que pueda enviarse correctamente.',
  })
  @ApiOkResponse({
    description: 'Resumen del procesamiento manual del lote solicitado.',
    schema: {
      example: {
        processed: 3,
        sent: 2,
        retrying: 1,
        messageLimit: 100,
        intervalMs: 1000,
      },
    },
  })
  process() {
    return this.dispatcherService.dispatchMessages();
  }
}
