import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { AnthropicProvider } from './anthropic.provider';
import type { AiChatProvider } from './ai-chat-provider.interface';
import type { AiProviderConfig, AiProviderId } from './ai-provider.types';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

const logger = new Logger('AiProviderFactory');

const PLACEHOLDER_KEYS = new Set([
  'your_api_key_here',
  'your_groq_api_key_here',
  'your_openai_api_key_here',
  'your_anthropic_api_key_here',
]);

const DEFAULT_BASE_URL: Partial<Record<AiProviderId, string>> = {
  groq: 'https://api.groq.com/openai/v1',
  ollama: 'http://localhost:11434/v1',
  mistral: 'https://api.mistral.ai/v1',
};

const DEFAULT_MODEL: Record<AiProviderId, string> = {
  groq: 'meta-llama/llama-4-scout-17b-16e-instruct',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  ollama: 'llama3.2',
  mistral: 'mistral-small-latest',
};

const OPENAI_COMPATIBLE: AiProviderId[] = [
  'groq',
  'openai',
  'ollama',
  'mistral',
];

function normalizeProviderId(raw: string | undefined): AiProviderId {
  const id = (raw ?? 'groq').toLowerCase().trim();
  if (
    id === 'groq' ||
    id === 'openai' ||
    id === 'anthropic' ||
    id === 'ollama' ||
    id === 'mistral'
  ) {
    return id;
  }
  logger.warn(
    `Unknown AI_PROVIDER "${raw}", falling back to groq. Supported: groq, openai, anthropic, ollama, mistral`,
  );
  return 'groq';
}

function isValidApiKey(
  apiKey: string | undefined,
  providerId: AiProviderId,
): boolean {
  if (providerId === 'ollama') {
    return true;
  }
  if (!apiKey || PLACEHOLDER_KEYS.has(apiKey)) {
    return false;
  }
  return apiKey.length > 0;
}

export function resolveAiProviderConfig(
  config: ConfigService,
): AiProviderConfig | null {
  const providerId = normalizeProviderId(config.get<string>('AI_PROVIDER'));
  const apiKey = config.get<string>('AI_API_KEY') ?? '';
  const model =
    config.get<string>('AI_MODEL')?.trim() || DEFAULT_MODEL[providerId];
  const baseUrl = config.get<string>('AI_BASE_URL')?.trim() || undefined;

  if (!isValidApiKey(apiKey, providerId)) {
    return null;
  }

  return {
    providerId,
    apiKey: providerId === 'ollama' && !apiKey ? 'ollama' : apiKey,
    model,
    baseUrl,
  };
}

export function createAiChatProvider(
  providerConfig: AiProviderConfig,
): AiChatProvider {
  const { providerId, apiKey, model, baseUrl } = providerConfig;

  if (providerId === 'anthropic') {
    return new AnthropicProvider(apiKey, model);
  }

  if (!OPENAI_COMPATIBLE.includes(providerId)) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  const resolvedBaseUrl =
    baseUrl ?? DEFAULT_BASE_URL[providerId as keyof typeof DEFAULT_BASE_URL];

  return new OpenAiCompatibleProvider(
    providerId,
    apiKey,
    model,
    resolvedBaseUrl,
  );
}

export function createAiChatProviderFromEnv(
  config: ConfigService,
): AiChatProvider | null {
  const providerConfig = resolveAiProviderConfig(config);
  if (!providerConfig) {
    return null;
  }
  return createAiChatProvider(providerConfig);
}
