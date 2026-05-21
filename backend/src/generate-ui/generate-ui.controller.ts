import { Body, Controller, Post } from '@nestjs/common';
import type { GeneratedUi } from '../common/types/generated-ui';
import { GenerateUiDto } from './dto/generate-ui.dto';
import { ModifyUiDto } from './dto/modify-ui.dto';
import { GenerateUiService } from './generate-ui.service';

@Controller()
export class GenerateUiController {
  constructor(private readonly generateUiService: GenerateUiService) {}

  @Post('generate-ui')
  generate(@Body() dto: GenerateUiDto): Promise<GeneratedUi> {
    return this.generateUiService.generate(dto.prompt);
  }

  @Post('modify-ui')
  modify(@Body() dto: ModifyUiDto): Promise<GeneratedUi> {
    return this.generateUiService.modify(dto.instruction, dto.currentCode);
  }
}
