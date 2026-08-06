const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 10, windowMs: 60000 }
): { success: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: options.maxRequests - entry.count };
}