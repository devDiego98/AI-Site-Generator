import Anthropic from '@anthropic-ai/sdk';
import { APIError, RateLimitError } from '@anthropic-ai/sdk';
import type { AiChatProvider } from './ai-chat-provider.interface';
import type { CompleteChatParams } from './ai-provider.types';
import { splitSystemMessages } from './openai-compatible.provider';

type AnthropicRole = 'user' | 'assistant';

export class AnthropicProvider implements AiChatProvider {
  readonly id = 'anthropic' as const;
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(params: CompleteChatParams): Promise<string> {
    const { system, conversation } = splitSystemMessages(params.messages);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      system,
      messages: conversation.map((m) => ({
        role: m.role as AnthropicRole,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const content =
      textBlock && textBlock.type === 'text' ? textBlock.text.trim() : '';
    if (!content) {
      throw new Error('AI provider returned an empty response');
    }
    return content;
  }

  isRateLimitError(error: unknown): boolean {
    return error instanceof RateLimitError;
  }

  getErrorMessage(error: unknown): string | undefined {
    if (error instanceof APIError && error.message.length > 0) {
      return error.message;
    }
    if (error instanceof Error && error.message.length > 0) {
      return error.message;
    }
    return undefined;
  }
}
