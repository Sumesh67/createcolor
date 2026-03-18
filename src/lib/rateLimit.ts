// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Daily limit storage (resets at midnight)
const dailyLimitMap = new Map<string, { count: number; resetDate: string }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Get today's date string (YYYY-MM-DD) for daily reset
function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Get milliseconds until midnight
function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Daily rate limit check (20 images per day, resets at midnight)
export function checkDailyLimit(
  identifier: string,
  maxPerDay: number = 20
): { allowed: boolean; remaining: number; resetIn: number; used: number } {
  const today = getTodayString();
  const record = dailyLimitMap.get(identifier);

  // If no record or new day, reset
  if (!record || record.resetDate !== today) {
    dailyLimitMap.set(identifier, {
      count: 1,
      resetDate: today,
    });
    return {
      allowed: true,
      remaining: maxPerDay - 1,
      resetIn: getMsUntilMidnight(),
      used: 1,
    };
  }

  // Check if within daily limit
  if (record.count < maxPerDay) {
    record.count += 1;
    return {
      allowed: true,
      remaining: maxPerDay - record.count,
      resetIn: getMsUntilMidnight(),
      used: record.count,
    };
  }

  // Daily limit reached
  return {
    allowed: false,
    remaining: 0,
    resetIn: getMsUntilMidnight(),
    used: record.count,
  };
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
