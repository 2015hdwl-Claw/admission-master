/**
 * Shared AI API helper with retry logic and fallback support.
 * Centralizes GLM API calls so all routes benefit from consistent error handling.
 */

const AI_API_BASE =
  process.env.AI_API_BASE_URL ||
  process.env.NEXT_PUBLIC_AI_BASE_URL ||
  'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY =
  process.env.AI_API_KEY ||
  process.env.NEXT_PUBLIC_AI_API_KEY ||
  '';
const AI_MODEL =
  process.env.AI_MODEL ||
  process.env.NEXT_PUBLIC_AI_MODEL ||
  'glm-4.7-flash';

/** Models to try in order of preference */
const MODEL_FALLBACKS = [AI_MODEL, 'glm-4.5-air', 'glm-4-flash'];

const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 30000;

export interface AIRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface AIResponse {
  ok: boolean;
  content: string | null;
  error: string | null;
  usedFallback: boolean;
  isRateLimited: boolean;
}

/**
 * Call the AI API with retry and model fallback logic.
 * Returns structured result instead of throwing, so callers can handle fallbacks.
 */
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  if (!AI_API_KEY) {
    return {
      ok: false,
      content: null,
      error: 'AI API key not configured',
      usedFallback: false,
      isRateLimited: false,
    };
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userPrompt });

  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Try each model
  for (const model of MODEL_FALLBACKS) {
    const result = await tryModel(model, messages, options.temperature ?? 0.5, timeoutMs);
    if (result.ok) return result;

    // If rate limited on this model, try next model
    if (result.isRateLimited) {
      console.error(`AI model ${model} rate limited, trying next model`);
      continue;
    }

    // Other error (model not found, balance insufficient) - try next model
    console.error(`AI model ${model} error: ${result.error}`);
    continue;
  }

  // All models failed - try retry on original model once
  const retryResult = await tryModel(AI_MODEL, messages, options.temperature ?? 0.5, timeoutMs);
  if (retryResult.ok) {
    return { ...retryResult, usedFallback: true };
  }

  return {
    ok: false,
    content: null,
    error: retryResult.error ?? 'All AI models unavailable',
    usedFallback: false,
    isRateLimited: retryResult.isRateLimited,
  };
}

async function tryModel(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  timeoutMs: number,
): Promise<AIResponse> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${AI_API_BASE}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        const errorCode = extractErrorCode(errBody);

        if (response.status === 429 || errorCode === '1302') {
          return {
            ok: false,
            content: null,
            error: 'Rate limited - please wait a moment and try again',
            usedFallback: false,
            isRateLimited: true,
          };
        }

        return {
          ok: false,
          content: null,
          error: `API error ${response.status}: ${errBody.slice(0, 200)}`,
          usedFallback: false,
          isRateLimited: false,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return {
          ok: false,
          content: null,
          error: 'Empty response from AI',
          usedFallback: false,
          isRateLimited: false,
        };
      }

      return { ok: true, content, error: null, usedFallback: false, isRateLimited: false };
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : 'Unknown error';

      // Don't retry on abort (timeout)
      if (msg.includes('abort') || msg.includes('timeout')) {
        return {
          ok: false,
          content: null,
          error: 'Request timed out',
          usedFallback: false,
          isRateLimited: false,
        };
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES) {
        console.error(`AI request attempt ${attempt + 1} failed: ${msg}, retrying...`);
        continue;
      }

      return {
        ok: false,
        content: null,
        error: `Request failed: ${msg}`,
        usedFallback: false,
        isRateLimited: false,
      };
    }
  }

  // Should not reach here, but satisfy TypeScript
  return {
    ok: false,
    content: null,
    error: 'Max retries exhausted',
    usedFallback: false,
    isRateLimited: false,
  };
}

function extractErrorCode(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.code ?? null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON from AI response, handling malformed JSON.
 */
export function parseAIJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
