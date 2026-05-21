import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ModifyUiDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  instruction: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  currentCode: string;
}
