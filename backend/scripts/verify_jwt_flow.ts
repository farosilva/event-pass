import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { TicketService } from '../src/services/ticket.service';
import { verifyToken } from '../src/utils/jwt';
import { randomUUID } from 'crypto';

async function main() {
    console.log('Starting JWT Flow Verification...');
    const ticketService = new TicketService();

    // 1. Setup Test Data
    const userId = randomUUID();
    const eventId = randomUUID();
    const userEmail = `test-${userId}@example.com`;

    try {
        console.log('Creating test user and event...');
        await prisma.user.create({
            data: {
                id: userId,
                email: userEmail,
                name: 'Test User',
                password: 'hashed-password',
            },
        });

        await prisma.event.create({
            data: {
                id: eventId,
                title: 'Test Event',
                description: 'Test Description',
                date: new Date(),
                location: 'Test Location',
                totalTickets: 10,
                availableTickets: 10,
            },
        });

        // 2. Buy Ticket
        console.log(' buying ticket...');
        const ticket = await ticketService.buyTicket(userId, eventId);

        console.log('Ticket created with code:', ticket.code);

        // 3. Verify Code is JWT
        console.log('Verifying ticket code is a valid JWT...');
        const payload = verifyToken(ticket.code) as any;

        if (payload.ticketId !== ticket.id) {
            throw new Error(`JWT payload ticketId mismatch. Expected ${ticket.id}, got ${payload.ticketId}`);
        }
        if (payload.userId !== userId) {
            throw new Error('JWT payload userId mismatch');
        }
        if (payload.eventId !== eventId) {
            throw new Error('JWT payload eventId mismatch');
        }
        console.log('JWT Verification Successful! Payload:', payload);

        // 4. Validate Check-in
        console.log('Testing validateCheckIn with the JWT code...');
        const checkInResult = await ticketService.validateCheckIn(ticket.code);

        if (!checkInResult.ticket.checkedInAt) {
            throw new Error('Check-in failed: Ticket not marked as checked in');
        }
        console.log('Check-in Successful!');

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        console.log('Cleaning up test data...');
        await prisma.ticket.deleteMany({ where: { userId } });
        await prisma.event.delete({ where: { id: eventId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
    }
}

main();
