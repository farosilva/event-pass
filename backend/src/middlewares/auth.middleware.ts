import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError } from './error.middleware';

// Extend Express Request interface
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('No token provided', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verifyToken<TokenPayload>(token);
        req.user = decoded;
        return next();
    } catch (_err) {
        throw new AppError('Invalid token', 401);
    }
};

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        throw new AppError('Access denied. Admins only.', 403);
    }
    next();
};
