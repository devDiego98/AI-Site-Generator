import type { ConfigService } from '@nestjs/config';
import {
  createAiChatProvider,
  resolveAiProviderConfig,
} from './ai-provider.factory';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

function mockConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

describe('resolveAiProviderConfig', () => {
  it('returns null when API key is missing for groq', () => {
    expect(
      resolveAiProviderConfig(
        mockConfig({ AI_PROVIDER: 'groq', AI_API_KEY: undefined }),
      ),
    ).toBeNull();
  });

  it('allows ollama without an API key', () => {
    const config = resolveAiProviderConfig(
      mockConfig({
        AI_PROVIDER: 'ollama',
        AI_MODEL: 'llama3.2',
      }),
    );
    expect(config).toEqual({
      providerId: 'ollama',
      apiKey: 'ollama',
      model: 'llama3.2',
      baseUrl: undefined,
    });
  });

  it('uses provider-specific default model', () => {
    const config = resolveAiProviderConfig(
      mockConfig({
        AI_PROVIDER: 'anthropic',
        AI_API_KEY: 'sk-ant-test',
      }),
    );
    expect(config?.model).toBe('claude-sonnet-4-20250514');
  });
});

describe('createAiChatProvider', () => {
  it('creates OpenAiCompatibleProvider for groq', () => {
    const provider = createAiChatProvider({
      providerId: 'groq',
      apiKey: 'gsk_test',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    });
    expect(provider).toBeInstanceOf(OpenAiCompatibleProvider);
    expect(provider.id).toBe('groq');
  });

  it('creates AnthropicProvider for anthropic', () => {
    const provider = createAiChatProvider({
      providerId: 'anthropic',
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-20250514',
    });
    expect(provider).toBeInstanceOf(AnthropicProvider);
    expect(provider.id).toBe('anthropic');
  });
});
