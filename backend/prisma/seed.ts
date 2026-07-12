import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@talha.com' },
    update: {},
    create: {
      email: 'admin@talha.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
  });

  console.log('Admin user created:', admin.email);

  await prisma.knowledgeBase.createMany({
    data: [
      {
        question: 'What are your business hours?',
        answer: 'Our business hours are Monday to Friday, 9:00 AM to 6:00 PM.',
        category: 'general',
      },
      {
        question: 'How can I track my order?',
        answer:
          'You can track your order using the tracking link sent to your email. If you need further assistance, please provide your order number.',
        category: 'orders',
      },
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy for unused items in original packaging.',
        category: 'support',
      },
    ],
  });

  console.log('Knowledge base seeded');

  await prisma.setting.createMany({
    data: [
      { key: 'business_name', value: 'Talha Business' },
      { key: 'business_hours', value: 'Mon-Fri 9AM-6PM' },
      { key: 'ai_enabled', value: 'true' },
      { key: 'default_language', value: 'en' },
    ],
  });

  console.log('Settings seeded');
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
