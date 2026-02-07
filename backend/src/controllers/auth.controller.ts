import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        const result = await authService.register(req.body);
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
