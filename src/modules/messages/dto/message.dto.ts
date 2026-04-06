import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const MAX_MESSAGES_PER_BATCH = 100_000;

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipient!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateMessageDto implements Partial<CreateMessageDto> {}
