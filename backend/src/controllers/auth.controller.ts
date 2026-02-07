import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { logger } from '../lib/logger';

const authService = new AuthService();
const emailService = new EmailService();

export class AuthController {
    async register(req: Request, res: Response) {
        const result = await authService.register(req.body);

        // Send welcome email asynchronously (fire and forget)
        emailService.sendWelcomeEmail(result.user.email, result.user.name).catch(err => {
            logger.error('[AuthController] Failed to send welcome email:', err);
        });

        return res.status(201).json(result);
    }

    async login(req: Request, res: Response) {
        const result = await authService.login(req.body);
        return res.json(result);
    }

    async createAdmin(req: Request, res: Response) {
        const result = await authService.createAdmin(req.body);
        return res.status(201).json(result);
    }
}
