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
    user.magicEnergy = 100;
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
    user.magicEnergy = 100;
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
