import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateUiDto {
  @IsString()
  @IsNotEmpty({ message: 'Prompt must not be empty' })
  @MinLength(3, { message: 'Prompt must be at least 3 characters' })
  @MaxLength(5000, { message: 'Prompt must be at most 5000 characters' })
  prompt!: string;
}
