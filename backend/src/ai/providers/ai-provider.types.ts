export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompleteChatParams {
  messages: ChatMessage[];
  temperature: number;
  maxTokens: number;
}

export type AiProviderId =
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'ollama'
  | 'mistral';

export interface AiProviderConfig {
  providerId: AiProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string;
}
