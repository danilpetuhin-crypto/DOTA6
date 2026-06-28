import { prisma } from '../lib/prisma.js';

async function verify() {
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log('✅ Connected to database!');
    console.log(`📊 Users in database: ${count}`);
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

verify();
