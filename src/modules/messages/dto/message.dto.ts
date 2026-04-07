import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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

export class MessageStatusQueryDto {
  @ApiPropertyOptional({
    example: 'msg-000001',
    description:
      'Consulta opcional por identificador externo enviado por Plataforma A.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  externalMessageId?: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Consulta opcional por identificador interno generado por la base de datos.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  internalMessageId?: number;
}

export class UpdateMessageDto implements Partial<CreateMessageDto> {}
