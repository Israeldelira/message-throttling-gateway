import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';
import { SimulatorService } from '../simulator/simulator.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly simulatorService: SimulatorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Recibe un mensaje desde Plataforma A',
    description:
      'Acepta el mensaje de forma asincrona: lo persiste rapidamente y deja el envio real a cargo del dispatcher.',
  })
  @ApiBody({ type: CreateMessageDto })
  @ApiAcceptedResponse({
    description:
      'Mensaje aceptado. Si llega de nuevo el mismo externalMessageId, se ignora sin insertar un duplicado.',
    schema: {
      example: {
        accepted: true,
        internalMessageId: 1,
        externalMessageId: 'msg-000001',
        status: 'received',
        receivedAt: '2026-04-06T06:00:00.000Z',
      },
    },
  })
  async create(@Body() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.acceptMessage(createMessageDto);

    return {
      accepted: true,
      internalMessageId: message.id,
      externalMessageId: message.externalMessageId,
      status: message.status,
      receivedAt: message.receivedAt,
    };
  }

  @Post('batch-process')
  @ApiOperation({
    summary: 'Simula la rafaga de Plataforma A contra el endpoint real',
    description:
      'Envia requests HTTP reales a POST /messages usando la configuracion definida en las variables de entorno del simulador.',
  })
  @ApiOkResponse({
    description:
      'Resumen de la rafaga simulada enviada al endpoint real de ingreso.',
    schema: {
      example: {
        totalRequested: 100000,
        accepted: 100000,
        failed: 0,
        concurrency: 200,
        targetUrl: 'http://localhost:3000/messages',
      },
    },
  })
  batchProcess() {
    return this.simulatorService.simulateBurst();
  }
}
