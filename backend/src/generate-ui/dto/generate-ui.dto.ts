import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { VisualStyle } from '../../common/types/generated-ui';

const VISUAL_STYLES: VisualStyle[] = [
  'auto',
  'minimal',
  'bold',
  'corporate',
  'playful',
];

export class GenerateUiDto {
  @IsString()
  @IsNotEmpty({ message: 'Prompt must not be empty' })
  @MinLength(3, { message: 'Prompt must be at least 3 characters' })
  @MaxLength(5000, { message: 'Prompt must be at most 5000 characters' })
  prompt!: string;

  @IsOptional()
  @IsString()
  @IsIn(VISUAL_STYLES, {
    message: `visualStyle must be one of: ${VISUAL_STYLES.join(', ')}`,
  })
  visualStyle?: VisualStyle;
}
