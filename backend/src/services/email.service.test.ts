import { EmailService } from './email.service';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: mockSendMail
});

describe('EmailService', () => {
    let emailService: EmailService;
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...OLD_ENV,
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: '587',
            SMTP_USER: 'user',
            SMTP_PASS: 'pass'
        };
        emailService = new EmailService();
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should send welcome email', async () => {
        await emailService.sendWelcomeEmail('test@test.com', 'Test User');
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('Bem-vindo')
        }));
    });

    it('should send ticket purchased email', async () => {
        await emailService.sendTicketPurchasedEmail('test@test.com', 'Test User', 'Concerto', 'ticket-123');
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('ingresso para Concerto')
        }));
    });

    it('should send ticket validated email', async () => {
        const date = new Date();
        await emailService.sendTicketValidatedEmail('test@test.com', 'Test User', 'Concerto', date);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('Check-in realizado')
        }));
    });
});
