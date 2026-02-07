import { EmailService } from './email.service';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import fs from 'fs';

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: mockSendMail
});

// Mock QRCode
jest.mock('qrcode', () => ({
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-qr-buffer'))
}));

// Mock fs
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true) // Pretend logo exists
}));

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

    it('should send welcome email with logo', async () => {
        await emailService.sendWelcomeEmail('test@test.com', 'Test User');

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('Bem-vindo'),
            attachments: expect.arrayContaining([
                expect.objectContaining({ cid: 'logo' })
            ])
        }));
    });

    it('should send ticket purchased email with QR code and logo', async () => {
        await emailService.sendTicketPurchasedEmail('test@test.com', 'Test User', 'Concerto', 'ticket-123');

        expect(QRCode.toBuffer).toHaveBeenCalledWith('ticket-123', expect.any(Object));

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('ingresso para Concerto'),
            attachments: expect.arrayContaining([
                expect.objectContaining({ cid: 'logo' }),
                expect.objectContaining({ cid: 'qrcode', content: expect.any(Buffer) })
            ])
        }));
    });

    it('should send ticket validated email with logo', async () => {
        const date = new Date();
        await emailService.sendTicketValidatedEmail('test@test.com', 'Test User', 'Concerto', date);

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@test.com',
            subject: expect.stringContaining('Check-in realizado'),
            attachments: expect.arrayContaining([
                expect.objectContaining({ cid: 'logo' })
            ])
        }));
    });
});
