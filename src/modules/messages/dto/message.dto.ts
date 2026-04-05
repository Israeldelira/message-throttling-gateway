import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  recipient!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
export class UpdateMessageDto implements Partial<CreateMessageDto> {}
