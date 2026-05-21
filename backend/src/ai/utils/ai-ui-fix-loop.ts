import type Groq from 'groq-sdk';
import { buildDesignFixUserMessage } from './design-fix-prompt';
import { extractUiCode } from './extract-ui-code';
import {
  prepareUiCode,
  type ValidateUiCodeResult,
} from './validate-ui-code';

export const DEFAULT_MAX_AI_FIX_ATTEMPTS = 3;

export interface AiUiFixLoopParams {
  groq: Groq;
  model: string;
  systemPrompt: string;
  userContent: string;
  initialAssistantCode: string;
  maxAttempts?: number;
  onAttempt?: (attempt: number, error: string) => void;
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
    groq,
    model,
    systemPrompt,
    userContent,
    initialAssistantCode,
    maxAttempts = DEFAULT_MAX_AI_FIX_ATTEMPTS,
    onAttempt,
  } = params;

  let assistantCode = initialAssistantCode;
  let { code, validation } = prepareUiCode(assistantCode);
  let attempts = 0;

  while (!validation.valid && attempts < maxAttempts) {
    attempts += 1;
    const errorDetail = validation.error ?? 'unknown validation error';
    onAttempt?.(attempts, errorDetail);

    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
        { role: 'assistant', content: assistantCode },
        { role: 'user', content: buildDesignFixUserMessage(errorDetail) },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
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
    ({ code, validation } = prepareUiCode(extracted));
  }

  return { code, validation, attempts };
}
