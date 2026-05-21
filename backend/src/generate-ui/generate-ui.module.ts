import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { GenerateUiController } from './generate-ui.controller';
import { GenerateUiService } from './generate-ui.service';

@Module({
  imports: [AiModule],
  controllers: [GenerateUiController],
  providers: [GenerateUiService],
})
export class GenerateUiModule {}
