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
      'Lee hasta 100 mensajes con status received en orden ascendente por id, los envia al mock de Plataforma C y actualiza el resultado a sent o failed.',
  })
  @ApiOkResponse({
    description: 'Resumen del procesamiento manual del lote solicitado.',
    schema: {
      example: {
        processed: 100,
        sent: 95,
        failed: 5,
        maxPerSecond: 100,
      },
    },
  })
  process() {
    return this.dispatcherService.dispatchMessages();
  }
}
