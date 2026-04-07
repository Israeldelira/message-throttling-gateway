import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const MAX_MESSAGES_PER_BATCH = 100_000;

export class CreateMessageDto {
  @ApiProperty({
    example: 'msg-000001',
    description:
      'Identificador unico enviado por Plataforma A y usado como clave de idempotencia.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  externalMessageId!: string;

  @ApiProperty({
    example: '+521234000000',
    description: 'Destinatario final del mensaje.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipient!: string;

  @ApiProperty({
    example: 'Hola desde Plataforma A',
    description: 'Payload o contenido del mensaje a entregar.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateMessageDto implements Partial<CreateMessageDto> {}
