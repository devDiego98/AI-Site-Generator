import type { AiChatProvider } from '../providers/ai-chat-provider.interface';
import { buildDesignFixUserMessage } from './design-fix-prompt';
import { extractUiCode } from './extract-ui-code';
import { prepareUiCode, type ValidateUiCodeResult } from './validate-ui-code';

export const DEFAULT_MAX_AI_FIX_ATTEMPTS = 3;

export interface AiUiFixLoopParams {
  provider: AiChatProvider;
  systemPrompt: string;
  userContent: string;
  initialAssistantCode: string;
  maxAttempts?: number;
  onAttempt?: (attempt: number, error: string) => void;
  forModification?: boolean;
}

export interface AiUiFixLoopResult {
  code: string;
  validation: ValidateUiCodeResult;
  attempts: number;
}

/**
 * Re-prompts the AI with validation/design errors until code passes or max attempts.
 */
export async function runAiUiFixLoop(
  params: AiUiFixLoopParams,
): Promise<AiUiFixLoopResult> {
  const {
    provider,
    systemPrompt,
    userContent,
    initialAssistantCode,
    maxAttempts = DEFAULT_MAX_AI_FIX_ATTEMPTS,
    onAttempt,
    forModification,
  } = params;

  const prepareOptions = { forModification };
  let assistantCode = initialAssistantCode;
  let { code, validation } = prepareUiCode(assistantCode, prepareOptions);
  let attempts = 0;

  while (!validation.valid && attempts < maxAttempts) {
    attempts += 1;
    const errorDetail = validation.error ?? 'unknown validation error';
    onAttempt?.(attempts, errorDetail);

    const raw = await provider.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
        { role: 'assistant', content: assistantCode },
        {
          role: 'user',
          content: buildDesignFixUserMessage(errorDetail),
        },
      ],
      temperature: 0.4,
      maxTokens: 4096,
    });

    const extracted = raw ? extractUiCode(raw) : null;
    if (!extracted) {
      validation = {
        valid: false,
        error:
          'AI fix attempt returned empty or unparseable UI code. Retrying may help.',
      };
      continue;
    }

    assistantCode = extracted;
    ({ code, validation } = prepareUiCode(extracted, prepareOptions));
  }

  return { code, validation, attempts };
}
