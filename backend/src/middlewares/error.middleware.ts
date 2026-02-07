import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            issues: err.errors,
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    logger.error(err);

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
