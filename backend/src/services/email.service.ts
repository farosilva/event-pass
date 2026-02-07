import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

export class EmailService {
    private transporter;
    private logoPath: string;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        this.logoPath = path.join(__dirname, '../assets/logo.png');

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

    private async generateQRCode(content: string): Promise<Buffer> {
        return QRCode.toBuffer(content, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    }

    private async sendEmail(to: string, subject: string, html: string, text: string, attachments: any[] = []) {
        if (!this.transporter) {
            logger.warn(`[EmailService] Skipped sending email to ${to} (No SMTP config)`);
            return;
        }

        try {
            // Always attach logo if it exists
            if (fs.existsSync(this.logoPath)) {
                attachments.push({
                    filename: 'logo.png',
                    path: this.logoPath,
                    cid: 'logo' // same cid value as in the html img src
                });
            }

            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"EventPass" <no-reply@eventpass.com>',
                to,
                subject,
                text,
                html,
                attachments
            });

            logger.info(`[EmailService] Message sent: ${info.messageId}`);

            if (process.env.SMTP_HOST?.includes('ethereal')) {
                logger.info(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        } catch (err) {
            logger.error(`[EmailService] Failed to send email to ${to}:`, err);
        }
    }

    private getBaseTemplate(title: string, content: string, name: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background-color: #1a1a1a; padding: 20px; text-align: center; }
                    .header img { height: 40px; }
                    .content { padding: 40px 30px; color: #333333; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                    h1 { color: #10b981; margin-top: 0; font-size: 24px; }
                    p { line-height: 1.6; margin-bottom: 20px; }
                    .btn { display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
                    .info-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .qr-container { text-align: center; margin: 30px 0; }
                    .qr-image { width: 200px; height: 200px; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:logo" alt="EventPass">
                    </div>
                    <div class="content">
                        <h1>${title}</h1>
                        <p>Olá <strong>${name}</strong>,</p>
                        ${content}
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} EventPass. Todos os direitos reservados.</p>
                        <p>Este é um e-mail automático, por favor não responda.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    async sendWelcomeEmail(email: string, name: string) {
        const subject = "Bem-vindo ao EventPass! 🎟️";
        const content = `
            <p>Seja bem-vindo ao <strong>EventPass</strong>! Estamos muito felizes em tê-lo conosco.</p>
            <p>Sua conta foi criada com sucesso. Agora você pode explorar os melhores eventos da sua região e garantir seus ingressos gratuitos.</p>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">Acessar Plataforma</a>
            </div>
        `;
        const html = this.getBaseTemplate('Bem-vindo a bordo!', content, name);
        await this.sendEmail(email, subject, html, `Bem-vindo ao EventPass, ${name}!`);
    }

    async sendTicketPurchasedEmail(email: string, name: string, eventTitle: string, ticketId: string) { // ticketId here acts as the code for QR
        const subject = `Seu ingresso para ${eventTitle} está garantido! ✅`;

        // Generate QR Code
        const qrBuffer = await this.generateQRCode(ticketId);

        const content = `
            <p>Você garantiu seu ingresso para o evento <strong>${eventTitle}</strong>.</p>
            
            <div class="qr-container">
                <p style="margin-bottom: 10px; font-weight: bold;">Seu QR Code de Acesso:</p>
                <img src="cid:qrcode" alt="QR Code" class="qr-image">
                <p style="font-family: monospace; color: #6b7280; font-size: 14px; margin-top: 5px;">${ticketId.substring(0, 8)}...</p>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; font-weight: bold;">Instruções:</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Apresente este QR Code na entrada do evento. Você também pode acessá-lo através do aplicativo na seção "Meus Ingressos".</p>
            </div>
        `;

        const html = this.getBaseTemplate('Ingresso Confirmado! 🎫', content, name);

        await this.sendEmail(email, subject, html, `Seu ingresso para ${eventTitle} está aqui!`, [
            {
                filename: 'qrcode.png',
                content: qrBuffer,
                cid: 'qrcode'
            }
        ]);
    }

    async sendTicketValidatedEmail(email: string, name: string, eventTitle: string, checkedInAt: Date) {
        const subject = `Check-in realizado: ${eventTitle} 🚀`;
        const time = checkedInAt.toLocaleTimeString('pt-BR');

        const content = `
            <p>Seu check-in no evento <strong>${eventTitle}</strong> foi confirmado com sucesso.</p>
            <div class="info-box">
                <p style="margin: 0;"><strong>Horário de entrada:</strong> ${time}</p>
            </div>
            <p>Esperamos que você aproveite o evento!</p>
        `;

        const html = this.getBaseTemplate('Check-in Confirmado! ✅', content, name);
        await this.sendEmail(email, subject, html, `Check-in confirmado em ${eventTitle} às ${time}.`);
    }
}
