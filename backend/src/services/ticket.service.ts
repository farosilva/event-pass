import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error.middleware';
import { verifyToken, signToken } from '../utils/jwt';
import { randomUUID } from 'crypto';
import { EmailService } from './email.service';
import { logger } from '../lib/logger';

export class TicketService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    async buyTicket(userId: string, eventId: string) {
        // START ATOMIC TRANSACTION
        const ticketWithDetails = await prisma.$transaction(async (tx: any) => {
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
                    code: signToken({ ticketId, userId, eventId, eventTitle: event.title }), // Generate JWT with ticket info
                },
                include: {
                    user: true,
                    event: true
                }
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

        // Send email asynchronously
        this.emailService.sendTicketPurchasedEmail(
            ticketWithDetails.user.email,
            ticketWithDetails.user.name,
            ticketWithDetails.event.title,
            ticketWithDetails.code // Sending the code/token as ID for now, or use ticketWithDetails.id
        ).catch(err => {
            logger.error('[TicketService] Failed to send purchase email:', err);
        });

        return ticketWithDetails;
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
        } catch (_e) {
            throw new AppError('Invalid QR Code', 400);
        }

        // Now that we have the ticketId, we can proceed with validation
        const result = await prisma.$transaction(async (tx: any) => {
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
            const updatedTicket = await tx.ticket.update({
                where: { id: ticketId },
                data: { checkedInAt: new Date() },
                include: {
                    event: true,
                    user: true
                }
            });

            return {
                message: 'Ticket successfully checked in',
                ticket: {
                    id: updatedTicket.id,
                    eventId: updatedTicket.eventId,
                    userId: updatedTicket.userId,
                    checkedInAt: updatedTicket.checkedInAt,
                    event: {
                        name: updatedTicket.event.title, // Fixed: accessing title not name if schema uses title
                        date: updatedTicket.event.date,
                    },
                    user: {
                        email: updatedTicket.user.email,
                        name: updatedTicket.user.name
                    },
                },
                rawTicket: updatedTicket // Passing full object for email
            };
        });

        // Send email asynchronously
        if (result.rawTicket.checkedInAt) {
            this.emailService.sendTicketValidatedEmail(
                result.rawTicket.user.email,
                result.rawTicket.user.name,
                result.rawTicket.event.title,
                result.rawTicket.checkedInAt
            ).catch(err => {
                logger.error('[TicketService] Failed to send validation email:', err);
            });
        }

        return {
            message: result.message,
            ticket: result.ticket
        };
    }
}
