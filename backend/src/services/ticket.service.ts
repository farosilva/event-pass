import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error.middleware';
import { verifyToken, signToken } from '../utils/jwt';
import { randomUUID } from 'crypto';

export class TicketService {
    async buyTicket(userId: string, eventId: string) {
        // START ATOMIC TRANSACTION
        return prisma.$transaction(async (tx: any) => {
            // 1. Check Event availability
            const event = await tx.event.findUnique({
                where: { id: eventId },
            });

            if (!event) {
                throw new AppError('Event not found', 404);
            }

            if (event.availableTickets <= 0) {
                throw new AppError('Event sold out', 400);
            }

            // 2. Check if user already has a ticket
            const existingTicket = await tx.ticket.findUnique({
                where: {
                    userId_eventId: {
                        userId,
                        eventId,
                    },
                },
            });

            if (existingTicket) {
                throw new AppError('User already has a ticket for this event', 400);
            }

            // 3. Generate Secure Code
            const ticketId = randomUUID();

            // 4. Create Ticket & Decrement Counter
            const ticket = await tx.ticket.create({
                data: {
                    id: ticketId,
                    userId,
                    eventId,
                    code: signToken({ ticketId, userId, eventId }), // Generate JWT with ticket info
                },
            });

            await tx.event.update({
                where: { id: eventId },
                data: {
                    availableTickets: {
                        decrement: 1,
                    },
                },
            });

            return ticket;
        });
    }

    async listMyTickets(userId: string) {
        return prisma.ticket.findMany({
            where: { userId },
            include: {
                event: true,
            },
        });
    }

    // Admin Only
    async validateCheckIn(code: string) {
        let ticketId: string;

        try {
            // The payload for a ticket token is expected to contain 'ticketId'.
            // If checking in via raw ID, verifyToken might fail if it's not a JWT.
            // But requirement says QR content IS a JWT.
            const payload = verifyToken(code);
            if (typeof payload === 'object' && payload !== null && 'ticketId' in payload) {
                ticketId = (payload as any).ticketId;
            } else {
                throw new Error('Invalid token payload');
            }
        } catch (e) {
            throw new AppError('Invalid QR Code', 400);
        }

        // Now that we have the ticketId, we can proceed with validation
        return prisma.$transaction(async (tx: any) => {
            const ticket = await tx.ticket.findUnique({
                where: { id: ticketId },
                include: {
                    event: true,
                    user: true,
                },
            });

            if (!ticket) {
                throw new AppError('Ticket not found', 404);
            }

            if (ticket.checkedInAt) {
                throw new AppError('Ticket already checked in', 400);
            }

            // Mark ticket as checked in
            await tx.ticket.update({
                where: { id: ticketId },
                data: { checkedInAt: new Date() },
            });

            return {
                message: 'Ticket successfully checked in',
                ticket: {
                    id: ticket.id,
                    eventId: ticket.eventId,
                    userId: ticket.userId,
                    checkedInAt: new Date(),
                    event: {
                        name: ticket.event.name,
                        date: ticket.event.date,
                    },
                    user: {
                        email: ticket.user.email,
                    },
                },
            };
        });
    }
}
