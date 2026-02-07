import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

export class EmailService {
    private transporter;

    constructor() {
        // Create a transporter using Ethereal (fake SMTP service) for development
        // In production, this should be replaced with a real SMTP configuration via environment variables
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'dock.kautzer41@ethereal.email', // This is a placeholder. In real app, generate one or use env vars
                pass: 'w1e2r3t4y5' // Placeholder
            }
        });

        // Use console.log for now as we don't have real Ethereal creds generated dynamically
        // Ideally we would use nodemailer.createTestAccount() but let's keep it simple and safe for now
        // by actually mocking the sendMail if no real config is present, or using a simple console logger if preferred.

        // REVISION: To ensure it works without external dependencies setup, let's stick to a console-based approach for "Dev" 
        // if no env vars are present, or try to use a real test account.
        // For this task, user wants "implementation", so let's implement the structure.
    }

    async sendWelcomeEmail(email: string, name: string) {
        logger.info(`[EmailService] Attempting to send welcome email to ${email}`);

        // In a real scenario, we would generate a test account if not provided
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        const info = await transporter.sendMail({
            from: '"EventPass Team" <no-reply@eventpass.com>', // sender address
            to: email, // list of receivers
            subject: "Bem-vindo ao EventPass! 🎟️", // Subject line
            text: `Olá ${name},\n\nSeja bem-vindo ao EventPass! Estamos muito felizes em tê-lo conosco.\n\nExplore os eventos e garanta seus ingressos.\n\nAtenciosamente,\nEquipe EventPass`, // plain text body
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1>Olá ${name}! 👋</h1>
                    <p>Seja bem-vindo ao <strong>EventPass</strong>! Estamos muito felizes em tê-lo conosco.</p>
                    <p>Explore os eventos em destaque e garanta seus ingressos gratuitos.</p>
                    <br>
                    <p>Atenciosamente,</p>
                    <p><strong>Equipe EventPass</strong></p>
                </div>
            `, // html body
        });

        logger.info(`[EmailService] Message sent: ${info.messageId}`);
        logger.info(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
}
