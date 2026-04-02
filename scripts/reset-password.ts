import * as readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

// Define User schema
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: String,
  magicEnergy: Number,
  lastEnergyReset: Date,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get email
    const email = await question('Enter email address: ');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log(`\n✗ No user found with email: ${email}`);
      await cleanup();
      return;
    }

    console.log(`\n✓ Found user: ${user.name || 'No name'} (${user.email})`);

    // Get new password
    const newPassword = await question('Enter new password (min 6 characters): ');

    if (newPassword.length < 6) {
      console.log('\n✗ Password must be at least 6 characters long');
      await cleanup();
      return;
    }

    // Confirm
    const confirm = await question(`\nReset password for ${email}? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n✗ Password reset cancelled');
      await cleanup();
      return;
    }

    // Hash new password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user
    user.password = hashedPassword;
    await user.save();

    console.log('\n✓ Password reset successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}`);

    await cleanup();
  } catch (error) {
    console.error('\n✗ Error resetting password:', error);
    await cleanup();
    process.exit(1);
  }
}

async function cleanup() {
  rl.close();
  await mongoose.disconnect();
  console.log('\n✓ Disconnected from MongoDB');
}

// Run the script
resetPassword();
