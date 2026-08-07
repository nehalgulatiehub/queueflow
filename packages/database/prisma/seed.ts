import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding QueueFlow PostgreSQL Database with Real Production Entities...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });

  // 2. Create Project
  const project = await prisma.project.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'core-production',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Core Production Engine',
      slug: 'core-production',
      description: 'Main production message processing queues',
    },
  });

  // 3. Create Queues
  const userNotifQueue = await prisma.queue.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: 'user-notifications',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'user-notifications',
      description: 'Transactional email and SMS notification queue',
      maxConcurrency: 20,
      rateLimitMs: 10,
    },
  });

  const billingQueue = await prisma.queue.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: 'billing-engine',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'billing-engine',
      description: 'Subscription billing & invoice PDF generation',
      maxConcurrency: 10,
      rateLimitMs: 50,
    },
  });

  const paymentSyncQueue = await prisma.queue.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: 'payment-sync',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'payment-sync',
      description: 'Stripe & PayPal webhook synchronization',
      maxConcurrency: 15,
      rateLimitMs: 5,
    },
  });

  const mediaQueue = await prisma.queue.upsert({
    where: {
      projectId_name: {
        projectId: project.id,
        name: 'media-processor',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'media-processor',
      description: 'Image thumbnail resizing & video encoding',
      maxConcurrency: 5,
      rateLimitMs: 100,
    },
  });

  // 4. Create Sample Real Jobs
  const sampleJobs = [
    { name: 'send-welcome-email', queueId: userNotifQueue.id, priority: 'CRITICAL' as const, status: 'COMPLETED' as const },
    { name: 'generate-monthly-invoice-pdf', queueId: billingQueue.id, priority: 'HIGH' as const, status: 'COMPLETED' as const },
    { name: 'sync-stripe-webhooks', queueId: paymentSyncQueue.id, priority: 'CRITICAL' as const, status: 'COMPLETED' as const },
    { name: 'resize-avatar-asset', queueId: mediaQueue.id, priority: 'NORMAL' as const, status: 'COMPLETED' as const },
    { name: 'dispatch-push-notification', queueId: userNotifQueue.id, priority: 'HIGH' as const, status: 'RUNNING' as const },
  ];

  for (const j of sampleJobs) {
    await prisma.job.create({
      data: {
        projectId: project.id,
        queueId: j.queueId,
        name: j.name,
        payload: { userId: 'usr-48192', timestamp: Date.now() },
        priority: j.priority,
        status: j.status,
        startedAt: new Date(Date.now() - 5000),
        completedAt: j.status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  console.log('✅ PostgreSQL Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
