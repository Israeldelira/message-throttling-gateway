import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MockProviderService } from './mock-provider.service';

@ApiTags('mock-provider')
@Controller('mock-provider')
export class MockProviderController {
  constructor(private readonly mockProviderService: MockProviderService) {}

  @Post('messages')
  @ApiOperation({
    summary: 'Mock de Plataforma C',
    description:
      'Recibe un mensaje desde el dispatcher y responde exito para simular al proveedor externo.',
  })
  @ApiBody({
    schema: {
      example: {
        messageId: 1,
        recipient: '+521234000000',
        content: 'Test message number 1',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Respuesta simulada del proveedor externo.',
    schema: {
      example: {
        accepted: true,
        providerMessageId: 'mock-1',
        receivedAt: '2026-04-05T12:00:00.000Z',
      },
    },
  })
  createMessage(
    @Body()
    body: {
      messageId: number;
      recipient: string;
      content: string;
    },
  ) {
    return this.mockProviderService.receiveMessage(body);
  }
}
