import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

export class EmailService {
    private transporter;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            logger.warn('[EmailService] SMTP credentials not provided. Emails will not be sent.');
            this.transporter = null;
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }

    private async sendEmail(to: string, subject: string, html: string, text: string) {
        if (!this.transporter) {
            logger.warn(`[EmailService] Skipped sending email to ${to} (No SMTP config)`);
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"EventPass" <no-reply@eventpass.com>',
                to,
                subject,
                text,
                html
            });

            logger.info(`[EmailService] Message sent: ${info.messageId}`);

            // If using Ethereal, log preview URL
            if (process.env.SMTP_HOST?.includes('ethereal')) {
                logger.info(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        } catch (err) {
            logger.error(`[EmailService] Failed to send email to ${to}:`, err);
        }
    }

    async sendWelcomeEmail(email: string, name: string) {
        const subject = "Bem-vindo ao EventPass! 🎟️";
        const text = `Olá ${name},\n\nSeja bem-vindo ao EventPass! Estamos muito felizes em tê-lo conosco.\n\nExplore os eventos e garanta seus ingressos.\n\nAtenciosamente,\nEquipe EventPass`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Olá ${name}! 👋</h1>
                <p>Seja bem-vindo ao <strong>EventPass</strong>! Estamos muito felizes em tê-lo conosco.</p>
                <p>Explore os eventos em destaque e garanta seus ingressos gratuitos.</p>
                <br>
                <p>Atenciosamente,</p>
                <p><strong>Equipe EventPass</strong></p>
            </div>
        `;
        await this.sendEmail(email, subject, html, text);
    }

    async sendTicketPurchasedEmail(email: string, name: string, eventTitle: string, ticketId: string) {
        const subject = `Seu ingresso para ${eventTitle} está garantido! ✅`;
        const text = `Olá ${name},\n\nVocê garantiu seu ingresso para o evento "${eventTitle}".\n\nCódigo do ingresso: ${ticketId}\n\nAcesse "Meus Ingressos" no app para ver o QR Code.\n\nBom evento!\nEquipe EventPass`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Ingresso Confirmado! 🎫</h1>
                <p>Olá <strong>${name}</strong>,</p>
                <p>Você garantiu seu ingresso para o evento <strong>${eventTitle}</strong>.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">ID do Ingresso:</p>
                    <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 18px; font-weight: bold;">${ticketId}</p>
                </div>
                <p>Acesse a seção <strong>Meus Ingressos</strong> no aplicativo para visualizar seu QR Code.</p>
                <br>
                <p>Bom evento!</p>
                <p><strong>Equipe EventPass</strong></p>
            </div>
        `;
        await this.sendEmail(email, subject, html, text);
    }

    async sendTicketValidatedEmail(email: string, name: string, eventTitle: string, checkedInAt: Date) {
        const subject = `Check-in realizado: ${eventTitle} 🚀`;
        const time = checkedInAt.toLocaleTimeString('pt-BR');
        const text = `Olá ${name},\n\nSeu check-in no evento "${eventTitle}" foi confirmado às ${time}.\n\nAproveite o evento!\nEquipe EventPass`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Check-in Confirmado! ✅</h1>
                <p>Olá <strong>${name}</strong>,</p>
                <p>Seu check-in no evento <strong>${eventTitle}</strong> foi realizado com sucesso.</p>
                <p><strong>Horário:</strong> ${time}</p>
                <br>
                <p>Aproveite o evento!</p>
                <p><strong>Equipe EventPass</strong></p>
            </div>
        `;
        await this.sendEmail(email, subject, html, text);
    }
}
