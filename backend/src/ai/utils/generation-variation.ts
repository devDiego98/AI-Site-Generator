import { randomInt } from 'node:crypto';

/** Unique per API call — drives layout/background/image variety for the same user prompt. */
export interface GenerationVariation {
  seed: number;
  nonce: string;
}

export function createGenerationVariation(): GenerationVariation {
  const seed = randomInt(0, 2 ** 32);
  const nonce = `${Date.now().toString(36)}-${randomInt(0, 36 ** 6).toString(36)}`;
  return { seed, nonce };
}

export function pickFromVariationPool<T>(
  pool: readonly T[],
  variation: GenerationVariation,
  salt = 0,
): T {
  if (!pool.length) {
    throw new Error('pickFromVariationPool: empty pool');
  }
  const index = (variation.seed + salt) % pool.length;
  return pool[index] ?? pool[0];
}
