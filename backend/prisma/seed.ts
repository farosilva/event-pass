import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Admin
    const adminEmail = 'admin@eventpass.com';
    const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!adminExists) {
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: adminEmail,
                password: await bcrypt.hash('admin123', 10),
                role: 'ADMIN',
            },
        });
        console.log('Admin created');
    }

    // 2. Create Events
    const events = [
        {
            title: 'Tech Summit 2026',
            description: 'The biggest tech conference of the year.',
            date: new Date('2026-12-10T09:00:00Z'),
            location: 'Convention Center',
            totalTickets: 100,
            availableTickets: 100,
        },
        {
            title: 'Workshop React Advanced',
            description: 'Learn deep internals of React.',
            date: new Date('2026-11-20T14:00:00Z'),
            location: 'Tech Hub',
            totalTickets: 30,
            availableTickets: 30,
        },
        {
            title: 'Music Festival',
            description: 'Live bands and good vibes.',
            date: new Date('2026-06-15T18:00:00Z'),
            location: 'City Park',
            totalTickets: 500,
            availableTickets: 500,
        },
    ];

    for (const event of events) {
        const existing = await prisma.event.findFirst({ where: { title: event.title } });
        if (!existing) {
            await prisma.event.create({ data: event });
            console.log(`Event created: ${event.title}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
