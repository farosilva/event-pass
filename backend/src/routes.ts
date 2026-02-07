import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { EventController } from './controllers/event.controller';
import { TicketController } from './controllers/ticket.controller';
import { authMiddleware, adminMiddleware } from './middlewares/auth.middleware';

export const routes = Router();
const authController = new AuthController();
const eventController = new EventController();
const ticketController = new TicketController();

routes.get('/health', (req, res) => {
    return res.json({ status: 'ok', timestamp: new Date() });
});

// Auth
routes.post('/auth/register', authController.register);
routes.post('/auth/login', authController.login);
routes.post('/auth/admin', authMiddleware, adminMiddleware, authController.createAdmin);

// Events
routes.get('/events', eventController.list);
routes.get('/events/:id', eventController.getById);
routes.post('/events', authMiddleware, adminMiddleware, eventController.create);

// Tickets
routes.post('/tickets', authMiddleware, ticketController.buy);
routes.get('/tickets/me', authMiddleware, ticketController.listMyTickets);
routes.post('/tickets/validate', authMiddleware, adminMiddleware, ticketController.validate);
