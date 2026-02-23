import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    async onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'localhost',
            port: parseInt(process.env.EMAIL_PORT || '1025', 10),
            secure: false,
        });

        this.logger.log('Email transporter initialized');
    }

    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: '"EventflowApp" <noreply@eventflowapp.com>',
                to,
                subject,
                html: text,
            });
            this.logger.log(`Email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
}