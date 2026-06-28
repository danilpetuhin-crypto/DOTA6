import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Тестовый пользователь (пароль: test123)
  const user = await prisma.user.upsert({
    where: { login: 'test' },
    update: {},
    create: {
      login: 'test',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      ip: '127.0.0.1',
      subscription: 'free',
      analysesToday: 0
    }
  });

  console.log('✅ Created user:', user.login);

  // Тестовая сессия
  const session = await prisma.session.upsert({
    where: { id: 'test-session' },
    update: {},
    create: {
      id: 'test-session',
      userId: user.id,
      name: 'Тестовая сессия'
    }
  });

  console.log('✅ Created session:', session.name);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
