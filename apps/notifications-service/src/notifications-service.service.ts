import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsServiceService {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(private readonly emailService: EmailService) { }

  async sendWelcomeEmail(data: {
    userId: string;
    email: string;
    name: string;
  }) {
    const subject = 'Welcome to EventflowApp!';
    const text = 
    `<p>Hi ${data.name},</p>
    <p>Welcome to EventflowApp! We're excited to have you on board.</p>
    <p>Best regards,<br/>The EventflowApp Team</p>`;
    await this.emailService.sendEmail(data.email, subject, text);
    this.logger.log(`Sent welcome email to user ${data.userId} at ${data.email}`);
  }

  async sendTicketConfirmationEmail(data: {
    userId: string;
    email: string;
    name: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
  }) {
    const subject = 'Your Event Ticket is Confirmed!';
    const html = `
      <h1>Ticket Confirmed!</h1>
      <p>Hi ${data.name},</p>
      <p>Your ticket for the event "${data.eventTitle}" has been confirmed.</p>
      <p>Event Details:</p>
      <ul>
        <li><strong>Date:</strong> ${data.eventDate}</li>
        <li><strong>Location:</strong> ${data.eventLocation}</li>
      </ul>
      <p>We look forward to seeing you at the event!</p>
      <p>Best regards,<br/>The EventflowApp Team</p>
    `;
      await this.emailService.sendEmail(data.email, subject, html);
    this.logger.log(`Sent ticket confirmation email to user ${data.userId} at ${data.email} for event "${data.eventTitle}"`);
  }

    async sendTicketCancellationEmail(data: {
    userId: string;
    email: string;
    name: string;
    eventTitle: string;
  }) {
    const subject = 'Your Event Ticket has been Cancelled';
    const text = `
      <h1>Ticket Cancelled</h1>
      <p>Hi ${data.name},</p>
      <p>Your ticket for the event "${data.eventTitle}" has been cancelled.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br/>The EventflowApp Team</p>
    `;
    await this.emailService.sendEmail(data.email, subject, text);
    this.logger.log(`Sent ticket cancellation email to user ${data.userId} at ${data.email} for event "${data.eventTitle}"`);
  }

    async sendEventCancellationEmail(data: {
    userId: string;
    email: string;
    name: string;
    eventTitle: string;
  }) {
    const subject = 'Event Cancellation Notice';
    const text = `
      <h1>Event Cancelled</h1>
      <p>Hi ${data.name},</p>
      <p>We regret to inform you that the event "${data.eventTitle}" has been cancelled.</p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
      <p>Best regards,<br/>The EventflowApp Team</p>
    `;
    await this.emailService.sendEmail(data.email, subject, text);
    this.logger.log(`Sent event cancellation email to user ${data.userId} at ${data.email} for event "${data.eventTitle}"`);
  }

}
