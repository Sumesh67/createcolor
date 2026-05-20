import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not found in .env or .env.local');

  await mongoose.connect(MONGODB_URI);

  const users = await mongoose.connection.collection('users').find({}, {
    projection: { email: 1, name: 1, role: 1, createdAt: 1 }
  }).toArray();

  if (users.length === 0) {
    console.log('No users found in database.');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach(u => {
      console.log(`  email: ${u.email}  name: ${u.name ?? '(none)'}  role: ${u.role ?? 'PARENT'}`);
    });
  }

  await mongoose.disconnect();
}

main().catch(console.error);
