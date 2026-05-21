import type { AiProviderId } from './ai-provider.types';
import type { CompleteChatParams } from './ai-provider.types';

export interface AiChatProvider {
  readonly id: AiProviderId;
  complete(params: CompleteChatParams): Promise<string>;
  isRateLimitError(error: unknown): boolean;
  getErrorMessage(error: unknown): string | undefined;
}
