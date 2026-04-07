import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SimulatorService } from '../simulator/simulator.service';
import { CreateMessageDto, MessageStatusQueryDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

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

  @Get('status')
  @ApiOperation({
    summary: 'Consulta trazabilidad y metricas basicas del gateway',
    description:
      'Devuelve metricas agregadas de la cola. Si se envia un identificador, tambien retorna el detalle de un mensaje especifico.',
  })
  @ApiQuery({
    name: 'externalMessageId',
    required: false,
    description:
      'Identificador original enviado por Plataforma A para consultar un mensaje especifico.',
  })
  @ApiQuery({
    name: 'internalMessageId',
    required: false,
    description:
      'Identificador interno generado por la base de datos para consultar un mensaje especifico.',
  })
  @ApiOkResponse({
    description:
      'Metricas agregadas del gateway y, opcionalmente, el estado de un mensaje.',
    schema: {
      example: {
        metrics: {
          total: 100000,
          queueDepth: 1200,
          received: 900,
          retrying: 300,
          sent: 98800,
          failed: 0,
        },
        message: {
          internalMessageId: 1,
          externalMessageId: 'msg-000001',
          recipient: '+521234000000',
          status: 'sent',
          attempts: 1,
          errorDetail: null,
          receivedAt: '2026-04-06T06:00:00.000Z',
          lastAttemptAt: '2026-04-06T06:00:01.000Z',
          sentAt: '2026-04-06T06:00:01.000Z',
          updatedAt: '2026-04-06T06:00:01.000Z',
        },
      },
    },
  })
  getStatus(@Query() query: MessageStatusQueryDto) {
    return this.messagesService.getStatusOverview(query);
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
        targetUrl: 'http://localhost:3002/messages',
      },
    },
  })
  batchProcess() {
    return this.simulatorService.simulateBurst();
  }
}
