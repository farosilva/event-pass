import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

export interface TokenPayload {
    userId: string;
    role: string;
}

export const signToken = (payload: object, expiresIn: string | number = '7d'): string => {
    return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = <T>(token: string): T => {
    return jwt.verify(token, SECRET) as T;
};
