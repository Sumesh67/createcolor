import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export interface EnergyError {
  code: 'NO_ENERGY';
  message: string;
}

export interface EnergyStatus {
  success: boolean;
  remaining: number;
  resetAt?: Date;
}

/**
 * Check if a week has passed since the last Sunday-night reset
 */
function isNewWeek(lastReset: Date): boolean {
  const now = new Date();
  // Find the most recent Sunday at midnight
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay()); // rewind to Sunday
  lastSunday.setHours(0, 0, 0, 0);
  return new Date(lastReset) < lastSunday;
}

/**
 * Get next Sunday midnight (the next weekly reset time)
 */
function getNextSundayReset(): Date {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
}

/**
 * Check if a day has passed since the last energy reset
 */
function isNewDay(lastReset: Date): boolean {
  const now = new Date();
  const last = new Date(lastReset);

  // Compare dates (ignoring time)
  return (
    now.getFullYear() !== last.getFullYear() ||
    now.getMonth() !== last.getMonth() ||
    now.getDate() !== last.getDate()
  );
}

/**
 * Get the next reset time (midnight local time)
 */
function getNextResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Check and deduct magic energy from a user
 * @param userId - The MongoDB user ID
 * @returns true if energy was successfully deducted
 * @throws EnergyError if user has no energy remaining
 */
export async function checkAndDeductEnergy(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we need to reset energy (new day)
  if (isNewDay(user.lastEnergyReset)) {
    console.log(`[Energy] Resetting energy for user ${userId} (new day)`);
    user.magicEnergy = 5;
    user.lastEnergyReset = new Date();
    await user.save();
  }

  // Check if user has energy
  if (user.magicEnergy <= 0) {
    const error: EnergyError = {
      code: 'NO_ENERGY',
      message: 'Your Magic Wand needs to rest! ✨ Come back tomorrow for more coloring fun!',
    };
    throw error;
  }

  // Deduct energy
  user.magicEnergy -= 1;
  await user.save();

  console.log(`[Energy] User ${userId} used 1 energy, ${user.magicEnergy} remaining`);

  return {
    success: true,
    remaining: user.magicEnergy,
    resetAt: getNextResetTime(),
  };
}

/**
 * Get the current energy status for a user without deducting
 */
export async function getEnergyStatus(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we need to reset energy (new day)
  if (isNewDay(user.lastEnergyReset)) {
    user.magicEnergy = 5;
    user.lastEnergyReset = new Date();
    await user.save();
  }

  return {
    success: user.magicEnergy > 0,
    remaining: user.magicEnergy,
    resetAt: getNextResetTime(),
  };
}

/**
 * Add energy to a user (for premium features or rewards)
 */
export async function addEnergy(userId: string, amount: number = 1): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.magicEnergy += amount;
  await user.save();

  console.log(`[Energy] Added ${amount} energy to user ${userId}, now has ${user.magicEnergy}`);

  return {
    success: true,
    remaining: user.magicEnergy,
  };
}

/**
 * Check and deduct storybook usage from a user (2 per day limit)
 * @param userId - The MongoDB user ID
 * @returns true if storybook was successfully deducted
 * @throws EnergyError if user has reached daily storybook limit
 */
export async function checkAndDeductStorybook(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we need to reset storybook count (new day)
  if (isNewDay(user.lastStorybookReset)) {
    console.log(`[Storybook] Resetting storybook count for user ${userId} (new day)`);
    user.storybookCount = 0;
    user.lastStorybookReset = new Date();
    await user.save();
  }

  // Check if user has reached daily limit (2 storybooks per day)
  if (user.storybookCount >= 2) {
    const error: EnergyError = {
      code: 'NO_ENERGY',
      message: 'You\'ve created 2 storybooks today! 📖 Come back tomorrow for more magical stories!',
    };
    throw error;
  }

  // Increment storybook count
  user.storybookCount += 1;
  await user.save();

  console.log(`[Storybook] User ${userId} created storybook, ${2 - user.storybookCount} remaining today`);

  return {
    success: true,
    remaining: 2 - user.storybookCount,
    resetAt: getNextResetTime(),
  };
}

/**
 * Unified Magic Sparks system — shared pool for Magic Lens + Storybook (2/day)
 */
export async function checkAndConsumeSpark(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Admins have unlimited sparks
  if (user.role === 'ADMIN') {
    console.log(`[Sparks] Admin user ${userId} — no limit applied`);
    return { success: true, remaining: 99, resetAt: undefined };
  }

  if (isNewDay(user.lastSparkReset ?? new Date(0))) {
    console.log(`[Sparks] Resetting sparks for user ${userId} (new day)`);
    user.magicSparks = 2;
    user.lastSparkReset = new Date();
    await user.save();
  }

  if ((user.magicSparks ?? 2) <= 0) {
    const error: EnergyError = {
      code: 'NO_ENERGY',
      message: 'Your Magic Wand needs to rest ✨ Come back tomorrow!',
    };
    throw error;
  }

  user.magicSparks = (user.magicSparks ?? 2) - 1;
  await user.save();

  console.log(`[Sparks] User ${userId} used 1 spark, ${user.magicSparks} remaining`);

  return {
    success: true,
    remaining: user.magicSparks,
    resetAt: getNextResetTime(),
  };
}

export async function getSparkStatus(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Admins have unlimited sparks
  if (user.role === 'ADMIN') {
    return { success: true, remaining: 99, resetAt: undefined };
  }

  if (isNewDay(user.lastSparkReset ?? new Date(0))) {
    user.magicSparks = 2;
    user.lastSparkReset = new Date();
    await user.save();
  }

  const remaining = user.magicSparks ?? 2;

  return {
    success: remaining > 0,
    remaining,
    resetAt: getNextResetTime(),
  };
}

export const WEEKLY_CHALKBOARD_CREDITS = 5;

/**
 * Check and deduct a Chalkboard Credit for teacher worksheet generation (5/week, resets Sunday)
 */
export async function checkAndConsumeChalkboardCredit(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.role !== 'TEACHER') {
    throw new Error('Chalkboard Credits are only available for teacher accounts');
  }

  if (isNewWeek(user.lastCreditReset ?? new Date(0))) {
    console.log(`[Chalkboard] Resetting credits for teacher ${userId} (new week)`);
    user.chalkboardCredits = WEEKLY_CHALKBOARD_CREDITS;
    user.lastCreditReset = new Date();
    await user.save();
  }

  const credits = user.chalkboardCredits ?? WEEKLY_CHALKBOARD_CREDITS;

  if (credits <= 0) {
    const error: EnergyError = {
      code: 'NO_ENERGY',
      message: 'You\'ve used all 5 Chalkboard Credits for this week! Credits reset every Sunday. ✏️',
    };
    throw error;
  }

  user.chalkboardCredits = credits - 1;
  await user.save();

  console.log(`[Chalkboard] Teacher ${userId} used 1 credit, ${user.chalkboardCredits} remaining this week`);

  return {
    success: true,
    remaining: user.chalkboardCredits,
    resetAt: getNextSundayReset(),
  };
}

export async function getChalkboardStatus(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.role !== 'TEACHER') {
    return { success: false, remaining: 0 };
  }

  if (isNewWeek(user.lastCreditReset ?? new Date(0))) {
    user.chalkboardCredits = WEEKLY_CHALKBOARD_CREDITS;
    user.lastCreditReset = new Date();
    await user.save();
  }

  const remaining = user.chalkboardCredits ?? WEEKLY_CHALKBOARD_CREDITS;

  return {
    success: remaining > 0,
    remaining,
    resetAt: getNextSundayReset(),
  };
}

/**
 * Get the current storybook status for a user without deducting
 */
export async function getStorybookStatus(userId: string): Promise<EnergyStatus> {
  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we need to reset storybook count (new day)
  if (isNewDay(user.lastStorybookReset)) {
    user.storybookCount = 0;
    user.lastStorybookReset = new Date();
    await user.save();
  }

  const remaining = Math.max(0, 2 - user.storybookCount);

  return {
    success: remaining > 0,
    remaining,
    resetAt: getNextResetTime(),
  };
}
