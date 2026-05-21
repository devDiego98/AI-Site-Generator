import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq, { RateLimitError } from 'groq-sdk';
import { UI_GENERATION_SYSTEM_PROMPT } from './prompts/ui-generation.prompt';
import { UI_MODIFICATION_SYSTEM_PROMPT } from './prompts/ui-modification.prompt';
import { extractUiCode } from './utils/extract-ui-code';
import {
  applyRandomBackgroundSwap,
  isRandomBackgroundChangeRequest,
} from './utils/random-background-swap';
import { createGenerationVariation } from './utils/generation-variation';
import { augmentUserPromptForGeneration } from './utils/prompt-generation-profile';
import { applyPromptThemedGeneration } from './utils/prompt-themed-generation';
import {
  DEFAULT_MAX_AI_FIX_ATTEMPTS,
  runAiUiFixLoop,
} from './utils/ai-ui-fix-loop';
import { prepareUiCode } from './utils/validate-ui-code';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groq: Groq | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('AI_API_KEY');
    this.model =
      this.config.get<string>('AI_MODEL') ??
      'meta-llama/llama-4-scout-17b-16e-instruct';

    if (!apiKey || apiKey === 'your_api_key_here') {
      this.groq = null;
      this.logger.warn(
        'AI_API_KEY is not configured. UI generation will fail until a valid key is set.',
      );
    } else {
      this.groq = new Groq({ apiKey });
    }
  }

  async generateUiCode(userPrompt: string): Promise<string> {
    const variation = createGenerationVariation();
    return this.completeUiRequest(
      UI_GENERATION_SYSTEM_PROMPT,
      augmentUserPromptForGeneration(userPrompt, variation),
      'generate',
      userPrompt,
      variation,
    );
  }

  async modifyUiCode(
    instruction: string,
    currentCode: string,
  ): Promise<string> {
    const trimmedInstruction = instruction.trim();
    const userMessage = `Current UI code:\n\n${currentCode}\n\nModification request:\n${trimmedInstruction}`;

    let code = await this.completeUiRequest(
      UI_MODIFICATION_SYSTEM_PROMPT,
      userMessage,
      'modify',
    );

    if (isRandomBackgroundChangeRequest(trimmedInstruction)) {
      const swapped = applyRandomBackgroundSwap(code);
      code = swapped.code;
      this.logger.log(`Random background swap applied: ${swapped.component}`);
    }

    return code;
  }

  private async completeUiRequest(
    systemPrompt: string,
    userContent: string,
    operation: 'generate' | 'modify',
    sourcePrompt?: string,
    variation?: ReturnType<typeof createGenerationVariation>,
  ): Promise<string> {
    if (!this.groq) {
      throw new ServiceUnavailableException(
        'AI provider is not configured. Set AI_API_KEY in backend/.env',
      );
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        temperature: operation === 'modify' ? 0.8 : 1,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) {
        throw new BadGatewayException(
          'AI provider returned an empty response. Try again or adjust your prompt.',
        );
      }

      const extracted = extractUiCode(raw);
      if (!extracted) {
        throw new BadGatewayException(
          'AI provider returned empty UI code. Try again or adjust your prompt.',
        );
      }

      let { code, validation } = prepareUiCode(extracted);

      if (!validation.valid) {
        this.logger.warn(
          `AI returned invalid UI code (initial, will retry up to ${DEFAULT_MAX_AI_FIX_ATTEMPTS}x):\n${validation.error ?? 'unknown error'}`,
        );

        const fixResult = await runAiUiFixLoop({
          groq: this.groq,
          model: this.model,
          systemPrompt,
          userContent,
          initialAssistantCode: extracted,
          onAttempt: (attempt, error) => {
            this.logger.warn(
              `AI design fix attempt ${attempt}/${DEFAULT_MAX_AI_FIX_ATTEMPTS} failed:\n${error}`,
            );
          },
        });

        code = fixResult.code;
        validation = fixResult.validation;

        if (validation.valid) {
          this.logger.log(
            `AI design fixes succeeded after ${fixResult.attempts} attempt(s)`,
          );
        }
      }

      if (!validation.valid) {
        this.logger.warn(
          `AI returned invalid UI code after ${DEFAULT_MAX_AI_FIX_ATTEMPTS} fix attempts:\n${validation.error ?? 'unknown error'}`,
        );
        throw new BadGatewayException(
          validation.error ??
            'AI generated UI code that could not be rendered. Try again or adjust your prompt.',
        );
      }

      if (operation === 'generate') {
        const promptForAssets = sourcePrompt ?? userContent;
        const pexelsApiKey = this.config.get<string>('PEXELS_API_KEY');
        const themed = await applyPromptThemedGeneration(
          promptForAssets,
          code,
          {
            pexelsApiKey,
            variation,
          },
        );
        code = themed.code;
        this.logger.log(
          `Prompt-themed assets applied (background=${themed.background ?? 'ai-chosen'}, images=topic${pexelsApiKey ? '+pexels' : ''})`,
        );
      }

      return code;
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      if (error instanceof RateLimitError) {
        const body = error.error as
          | { error?: { message?: string } }
          | undefined;
        const message = body?.error?.message ?? error.message;
        this.logger.error('Groq rate limit exceeded', message);
        throw new BadGatewayException(
          message ??
            'AI request exceeded rate limits. Wait a moment and try again.',
        );
      }

      this.logger.error('Groq API call failed', error);
      throw new BadGatewayException(
        'Failed to generate UI from the AI provider. Please try again later.',
      );
    }
  }
}
