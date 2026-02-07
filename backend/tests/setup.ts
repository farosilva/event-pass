import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

import { prisma } from '../src/lib/prisma';

// Clean DB before all tests
beforeAll(async () => {
    // Connect
});

afterAll(async () => {
    await prisma.$disconnect();
});
