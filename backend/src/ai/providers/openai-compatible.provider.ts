import OpenAI, { APIError, RateLimitError } from 'openai';
import type { AiChatProvider } from './ai-chat-provider.interface';
import type {
  AiProviderId,
  ChatMessage,
  CompleteChatParams,
} from './ai-provider.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nestedMessage(error: RateLimitError): string | undefined {
  const err = error.error;
  if (isRecord(err)) {
    const nested = err.error;
    if (
      isRecord(nested) &&
      typeof nested.message === 'string' &&
      nested.message.length > 0
    ) {
      return nested.message;
    }
    if (typeof err.message === 'string' && err.message.length > 0) {
      return err.message;
    }
  }
  return error.message.length > 0 ? error.message : undefined;
}

/**
 * OpenAI Chat Completions API — used by Groq, OpenAI, Ollama, Mistral, and other compatible hosts.
 */
export class OpenAiCompatibleProvider implements AiChatProvider {
  private readonly client: OpenAI;

  constructor(
    readonly id: AiProviderId,
    apiKey: string,
    private readonly model: string,
    baseURL?: string,
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async complete(params: CompleteChatParams): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('AI provider returned an empty response');
    }
    return content;
  }

  isRateLimitError(error: unknown): boolean {
    if (error instanceof RateLimitError) {
      return true;
    }
    if (error instanceof APIError && error.status === 429) {
      return true;
    }
    return false;
  }

  getErrorMessage(error: unknown): string | undefined {
    if (error instanceof RateLimitError) {
      return nestedMessage(error);
    }
    if (error instanceof APIError && typeof error.message === 'string') {
      return error.message.length > 0 ? error.message : undefined;
    }
    if (error instanceof Error && error.message.length > 0) {
      return error.message;
    }
    return undefined;
  }
}

export function splitSystemMessages(messages: ChatMessage[]): {
  system: string | undefined;
  conversation: ChatMessage[];
} {
  const systemParts: string[] = [];
  const conversation: ChatMessage[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      systemParts.push(message.content);
    } else {
      conversation.push(message);
    }
  }

  return {
    system:
      systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
    conversation,
  };
}
