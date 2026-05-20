import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually without dotenv
function loadEnv(file: string) {
  try {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* file not found, skip */ }
}

loadEnv(resolve(__dirname, '../.env'));
loadEnv(resolve(__dirname, '../.env.local'));

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx ts-node --skip-project scripts/set-admin.ts <email>');
  process.exit(1);
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not found in .env or .env.local');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected');

  const result = await mongoose.connection.collection('users').updateOne(
    { email: email.toLowerCase().trim() },
    { $set: { role: 'ADMIN' } }
  );

  if (result.matchedCount === 0) {
    console.error(`✗ No user found with email: ${email}`);
  } else {
    console.log(`✅ ${email} is now ADMIN`);
  }

  await mongoose.disconnect();
  console.log('✓ Done');
}

main().catch(console.error);
