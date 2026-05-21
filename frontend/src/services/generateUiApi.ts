import type { GeneratedUi, VisualStyle } from '@/types/generatedUi'

export class GenerateUiApiError extends Error {
  readonly statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'GenerateUiApiError'
    this.statusCode = statusCode
  }
}

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_URL
  if (!baseUrl) {
    throw new GenerateUiApiError(
      'VITE_API_URL is not configured. Add it to frontend/.env',
    )
  }
  return baseUrl.replace(/\/$/, '')
}

function formatApiError(
  message: string | string[] | undefined,
  status: number,
): string {
  if (Array.isArray(message)) {
    return message.join(' ')
  }
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  if (status === 502) {
    return 'The AI provider failed to generate UI. Please try again.'
  }
  if (status === 503) {
    return 'The AI service is not configured on the server.'
  }
  return `Request failed (${status})`
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`
  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new GenerateUiApiError(
      `Could not reach the backend at ${url}. Is the API running?`,
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    throw new GenerateUiApiError(
      formatApiError(body?.message, response.status),
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export function generateUi(
  prompt: string,
  visualStyle?: VisualStyle,
): Promise<GeneratedUi> {
  return postJson<GeneratedUi>('/generate-ui', {
    prompt,
    ...(visualStyle && visualStyle !== 'auto' ? { visualStyle } : {}),
  })
}

export function modifyUi(
  instruction: string,
  currentCode: string,
): Promise<GeneratedUi> {
  return postJson<GeneratedUi>('/modify-ui', { instruction, currentCode })
}
