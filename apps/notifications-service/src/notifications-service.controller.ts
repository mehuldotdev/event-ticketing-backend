import { Controller, Get, Logger } from '@nestjs/common';
import { NotificationsServiceService } from './notifications-service.service';
import { KAFKA_TOPICS } from '@app/kafka';
import { EventPattern } from '@nestjs/microservices/decorators/event-pattern.decorator';
import { Payload } from '@nestjs/microservices/decorators/payload.decorator';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);
  
  constructor(private readonly notificationsServiceService: NotificationsServiceService) {}

  @Get("health")
  healthCheck() {
    return { status: 'ok', service: 'Notifications Service' };
  }

  @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
  async handleUserRegistered(
    @Payload() data: {
      userId: string;
      email: string;
      name: string;
    },
  ) {
    this.logger.log(`Received user registered event: ${JSON.stringify(data)}`);
    await this.notificationsServiceService.sendWelcomeEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_PURCHASED)
  async handleTicketPurchased(
    @Payload() data: {
      ticketId: string;
      eventId: string;
      userId: string;
      timestamp: string;
      totalPrice: number;
    },
  ) {
    this.logger.log(`Received ticket purchase event: ${JSON.stringify(data)}`);
    this.logger.log('Ticket purchase notification would be sent here');
  }

  @EventPattern(KAFKA_TOPICS.TICKET_CANCELLED)
  async handleTicketCancelled(
    @Payload() data: {
      ticketId: string;
      eventId: string;
    },
  ) {
    this.logger.log(`Received ticket cancelled event: ${JSON.stringify(data)}`);
    this.logger.log('Ticket cancellation notification would be sent here');
  }
}
