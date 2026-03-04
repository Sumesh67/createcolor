// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10 per hour
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // If no record or window has passed, reset
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Check if within limit
  if (record.count < config.maxRequests) {
    record.count += 1;
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetIn: record.resetTime - now,
    };
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetIn: record.resetTime - now,
  };
}

export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from session, fall back to IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}
