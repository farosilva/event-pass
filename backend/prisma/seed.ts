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

    // Helper to get random date X months from now
    const getDateInMonths = (months: number) => {
        const date = new Date();
        date.setMonth(date.getMonth() + months);

        // Set random day of the month
        date.setDate(Math.floor(Math.random() * 28) + 1);
        return date;
    };

    // 2. Create Events (15 events, 5 regions, 6-8 months future)
    const events = [
        // NORTE
        {
            title: 'Festival Folclórico de Parintins 2026',
            description: 'O maior festival folclórico a céu aberto do mundo, celebrando a cultura amazônica.',
            date: getDateInMonths(6),
            location: 'Bumbódromo, Parintins - AM',
            totalTickets: 3000,
            availableTickets: 3000,
        },
        {
            title: 'Círio de Nazaré: A Procissão',
            description: 'Uma das maiores manifestações católicas do mundo, reunindo milhões de fiéis.',
            date: getDateInMonths(7),
            location: 'Centro Histórico, Belém - PA',
            totalTickets: 5000,
            availableTickets: 5000,
        },
        {
            title: 'Expedição Amazônia Tech',
            description: 'Imersão tecnológica no coração da floresta, focada em sustentabilidade e bioeconomia.',
            date: getDateInMonths(8),
            location: 'Teatro Amazonas, Manaus - AM',
            totalTickets: 200,
            availableTickets: 200,
        },

        // NORDESTE
        {
            title: 'Carnaval de Salvador 2027: O Aquecimento',
            description: 'Prévia do maior carnaval do mundo com trios elétricos e muito axé.',
            date: getDateInMonths(6),
            location: 'Circuito Barra-Ondina, Salvador - BA',
            totalTickets: 2000,
            availableTickets: 2000,
        },
        {
            title: 'São João de Caruaru',
            description: 'O maior e melhor São João do mundo, com muito forró e comidas típicas.',
            date: getDateInMonths(7),
            location: 'Pátio de Eventos, Caruaru - PE',
            totalTickets: 1500,
            availableTickets: 1500,
        },
        {
            title: 'Fortal 2026',
            description: 'A micareta mais aguardada do ano em Fortaleza.',
            date: getDateInMonths(8),
            location: 'Cidade Fortal, Fortaleza - CE',
            totalTickets: 2500,
            availableTickets: 2500,
        },

        // CENTRO-OESTE
        {
            title: 'Festival de Música de Brasília',
            description: 'Celebrando o rock nacional na capital do país.',
            date: getDateInMonths(6),
            location: 'Estádio Mané Garrincha, Brasília - DF',
            totalTickets: 800,
            availableTickets: 800,
        },
        {
            title: 'ExpoAgro Goiânia',
            description: 'A maior feira agropecuária do centro-oeste, com shows sertanejos imperdíveis.',
            date: getDateInMonths(7),
            location: 'Parque de Exposições, Goiânia - GO',
            totalTickets: 1200,
            availableTickets: 1200,
        },
        {
            title: 'Pantanal EcoTrip',
            description: 'Encontro de ecoturismo e fotografia no Pantanal.',
            date: getDateInMonths(8),
            location: 'Poconé - MT',
            totalTickets: 50,
            availableTickets: 50,
        },

        // SUDESTE
        {
            title: 'Tech Conference São Paulo',
            description: 'O evento definitivo para desenvolvedores e líderes de tecnologia.',
            date: getDateInMonths(6),
            location: 'São Paulo Expo, São Paulo - SP',
            totalTickets: 500,
            availableTickets: 500,
        },
        {
            title: 'Rock in Rio 2026: Dia do Metal',
            description: 'As maiores bandas de heavy metal do mundo no palco mundo.',
            date: getDateInMonths(7),
            location: 'Cidade do Rock, Rio de Janeiro - RJ',
            totalTickets: 1000,
            availableTickets: 1000,
        },
        {
            title: 'Inova Minas',
            description: 'Feira de inovação e startups de Minas Gerais.',
            date: getDateInMonths(8),
            location: 'Expominas, Belo Horizonte - MG',
            totalTickets: 300,
            availableTickets: 300,
        },

        // SUL
        {
            title: 'Oktoberfest Blumenau 2026',
            description: 'A maior festa alemã das Américas, com muito chopp e tradição.',
            date: getDateInMonths(6),
            location: 'Parque Vila Germânica, Blumenau - SC',
            totalTickets: 2000,
            availableTickets: 2000,
        },
        {
            title: 'Festival de Cinema de Gramado',
            description: 'O charme da serra gaúcha com o melhor do cinema latino.',
            date: getDateInMonths(7),
            location: 'Palácio dos Festivais, Gramado - RS',
            totalTickets: 400,
            availableTickets: 400,
        },
        {
            title: 'Curitiba Jazz Festival',
            description: 'Música instrumental de qualidade nos parques de Curitiba.',
            date: getDateInMonths(8),
            location: 'Ópera de Arame, Curitiba - PR',
            totalTickets: 600,
            availableTickets: 600,
        },
    ];

    for (const event of events) {
        // Only create if title doesn't exist to avoid duplicates on re-runs
        const existing = await prisma.event.findFirst({ where: { title: event.title } });
        if (!existing) {
            await prisma.event.create({ data: event });
            console.log(`Event created: ${event.title}`);
        } else {
            console.log(`Event already exists: ${event.title}`);
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
