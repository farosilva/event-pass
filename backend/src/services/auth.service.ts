import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['USER', 'ADMIN']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
    async register(data: RegisterInput) {
        const { email, password, name } = registerSchema.parse(data);

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new AppError('User already exists');
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'USER', // Always force USER role for public registration
            },
        });

        const token = signToken({ userId: user.id, role: user.role });

        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }

    async createAdmin(data: RegisterInput) {
        const { email, password, name } = registerSchema.parse(data);

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new AppError('User already exists');
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    async login(data: LoginInput) {
        const { email, password } = loginSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = signToken({ userId: user.id, role: user.role });

        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }
}
