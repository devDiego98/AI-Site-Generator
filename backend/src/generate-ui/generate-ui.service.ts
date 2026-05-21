import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AiService } from '../ai/ai.service';
import type { GeneratedUi } from '../common/types/generated-ui';

@Injectable()
export class GenerateUiService {
  constructor(private readonly aiService: AiService) {}

  async generate(prompt: string): Promise<GeneratedUi> {
    const trimmedPrompt = prompt.trim();
    const code = await this.aiService.generateUiCode(trimmedPrompt);

    return {
      id: randomUUID(),
      prompt: trimmedPrompt,
      code,
      createdAt: new Date().toISOString(),
    };
  }

  async modify(instruction: string, currentCode: string): Promise<GeneratedUi> {
    const trimmedInstruction = instruction.trim();
    const code = await this.aiService.modifyUiCode(
      trimmedInstruction,
      currentCode,
    );

    return {
      id: randomUUID(),
      prompt: trimmedInstruction,
      code,
      createdAt: new Date().toISOString(),
    };
  }
}
