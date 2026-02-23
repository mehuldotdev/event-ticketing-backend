import { PurchaseTicketDto } from '@app/common/dto/purchase-ticket.dto';
import { DatabaseService } from '@app/database/database.service';
import { tickets } from '@app/database/schema/tickets';
import { KAFKA_TOPICS } from '@app/kafka';
import { KAFKA_SERVICE } from '@app/kafka/kafka.module';
import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { and, eq, ne, sql } from 'drizzle-orm';

@Injectable()
export class TicketsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private generateTicketCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }

  async purchase(purchaseDto: PurchaseTicketDto, userId: string) {
    const { eventId, quantity } = purchaseDto;

    const [event] = await this.dbService.db
      .select()
      .from(this.dbService.schema.events)
      .where(eq(this.dbService.schema.events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not published yet');
    }

    const soldTickets = await this.dbService.db
      .select({ total: sql<number>`COALESCE(COUNT(*), 0)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.eventId, eventId),
          ne(tickets.status, 'CANCELLED')
        )
      )
      .limit(1);

    const currentSold = Number(soldTickets[0]?.total || 0);
    if (currentSold + quantity > event.capacity) {
      throw new BadRequestException('Not enough tickets available');
    }

    const remaining = event.capacity - currentSold;

    if (quantity > remaining) {
      throw new BadRequestException(`Only ${remaining} tickets are available`);
    }

    const totalPrice = event.price * quantity;

    // Create multiple ticket records for the quantity
    const ticketRecords: Array<typeof tickets.$inferSelect> = [];
    for (let i = 0; i < quantity; i++) {
      const [ticket] = await this.dbService.db
        .insert(tickets)
        .values({
          eventId,
          userId,
          totalPrice: event.price,
          ticketCode: this.generateTicketCode(),
          status: 'CONFIRMED',
        })
        .returning();
      
      ticketRecords.push(ticket);
    }

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, {
      ticketId: ticketRecords[0].id,
      eventId: ticketRecords[0].eventId,
      userId: ticketRecords[0].userId,
      quantity: quantity,
      totalPrice: totalPrice,
      ticketCode: ticketRecords.map(t => t.ticketCode).join(', '),
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Ticket purchased successfully',
      tickets: ticketRecords.map(ticket => ({
        id: ticket.id,
        eventTitle: event.title,
        eventId: ticket.eventId,
        userId: ticket.userId,
        totalPrice: ticket.totalPrice,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
      })),
      summary: {
        quantity: quantity,
        totalPrice: totalPrice,
      }
    };
  }

  async findMyTickets(userId: string) {
    const userTickets = await this.dbService.db
      .select({
        id: tickets.id,
        eventId: tickets.eventId,
        totalPrice: tickets.totalPrice,
        ticketCode: tickets.ticketCode,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        eventTitle: this.dbService.schema.events.title,
      })
      .from(tickets)
      .innerJoin(this.dbService.schema.events, eq(this.dbService.schema.events.id, tickets.eventId))
      .where(eq(tickets.userId, userId));

    return userTickets;
  }

  async findOne(id: string, userId: string) {
    const [ticket] = await this.dbService.db.select({
      id: tickets.id,
      eventId: tickets.eventId,
      totalPrice: tickets.totalPrice,
      ticketCode: tickets.ticketCode,
      status: tickets.status,
      purchasedAt: tickets.purchasedAt,
      eventTitle: this.dbService.schema.events.title,
      eventDate: this.dbService.schema.events.date,
      eventLocation: this.dbService.schema.events.location,
    })
      .from(tickets)
      .innerJoin(this.dbService.schema.events, eq(this.dbService.schema.events.id, tickets.eventId))
      .where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async cancel(id: string, userId: string) {
    const [ticket] = await this.dbService.db.select({
      id: tickets.id,
      status: tickets.status,
      eventId: tickets.eventId,
    })
      .from(tickets)
      .where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    if(ticket.status === 'CHECKED_IN'){ {
      throw new BadRequestException('Used tickets cannot be cancelled');
    }}

    const cancelled = await this.dbService.db.update(tickets)
      .set({ status: 'CANCELLED' })
      .where(eq(tickets.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, {
      ticketId: cancelled[0].id,
      eventId: cancelled[0].eventId,
      userId: userId,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Ticket cancelled successfully',
      ticketId: cancelled[0].id,
    };
  }
    async checkIn(ticketCode: string, organizerId: string) {
      const [ticket] = await this.dbService.db.select({
        id: tickets.id,
        status: tickets.status,
        eventId: tickets.eventId,
      })
        .from(tickets)
        .innerJoin(this.dbService.schema.events, eq(this.dbService.schema.events.id, tickets.eventId))
        .where(and(eq(tickets.ticketCode, ticketCode), eq(this.dbService.schema.events.organizerId, organizerId)))
        .limit(1);

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      if (ticket.status === 'CANCELLED') {
        throw new BadRequestException('Cancelled tickets cannot be checked in');
      }

      if (ticket.status === 'CHECKED_IN') {
        throw new BadRequestException('Ticket is already checked in');
      }

      const checkedIn = await this.dbService.db.update(tickets)
        .set({ status: 'CHECKED_IN' })
        .where(eq(tickets.id, ticket.id))
        .returning();

      this.kafkaClient.emit(KAFKA_TOPICS.TICKET_CHECKED_IN, {
        ticketId: checkedIn[0].id,
        eventId: checkedIn[0].eventId,
        organizerId: organizerId,
        timestamp: new Date().toISOString(),
      });

      return {
        message: 'Ticket checked in successfully',
        ticket: {
          id: checkedIn[0].id,
          eventId: checkedIn[0].eventId,
          status: checkedIn[0].status,
          checkedInAt: new Date().toISOString(),
          ticketCode: checkedIn[0].ticketCode,
        }
      };
    }
    async findEventTickets(eventId: string, organizerId: string) {
      const [event] = await this.dbService.db.select({
        id: this.dbService.schema.events.id,
        title: this.dbService.schema.events.title,
      })
        .from(this.dbService.schema.events)
        .where(and(eq(this.dbService.schema.events.id, eventId), eq(this.dbService.schema.events.organizerId, organizerId)))
        .limit(1);

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const eventTickets = await this.dbService.db.select({
        id: tickets.id,
        userId: tickets.userId,
        status: tickets.status,
        ticketCode: tickets.ticketCode,
        purchasedAt: tickets.purchasedAt,
      })
        .from(tickets)
        .where(eq(tickets.eventId, eventId));

      return {
        event: {
          id: event.id,
          title: event.title,
        },
        tickets: eventTickets,
      };
    }
  }

