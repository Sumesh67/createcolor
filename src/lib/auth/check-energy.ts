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
