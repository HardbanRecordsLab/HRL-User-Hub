/**
 * Prosty rate limiter po stronie klienta
 * Zapobiega nadmiernemu wysyłaniu requestów
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Sprawdza czy request może być wykonany
 * @param key - unikalny klucz dla operacji (np. 'api:generate-content')
 * @param config - konfiguracja limitu
 * @returns true jeśli request jest dozwolony
 */
export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Reset jeśli okno czasowe minęło
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Sprawdź limit
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Inkrementuj licznik
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
};

/**
 * Wrapper dla funkcji z rate limitingiem
 */
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string,
  config?: RateLimitConfig
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const { allowed, remaining, resetIn } = checkRateLimit(key, config);

    if (!allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 1000)} seconds.`
      );
    }

    console.debug(`Rate limit: ${remaining} requests remaining for ${key}`);
    return fn(...args);
  };
};

/**
 * Hook-friendly rate limit check
 */
export const useRateLimitCheck = (key: string, config?: RateLimitConfig) => {
  return () => checkRateLimit(key, config);
};

/**
 * Domyślne limity dla różnych operacji
 */
export const RATE_LIMITS = {
  AI_GENERATION: { maxRequests: 5, windowMs: 60000 }, // 5 req/min
  API_CALL: { maxRequests: 30, windowMs: 60000 }, // 30 req/min
  FILE_UPLOAD: { maxRequests: 10, windowMs: 300000 }, // 10 req/5min
  AUTH: { maxRequests: 5, windowMs: 300000 }, // 5 req/5min
};
