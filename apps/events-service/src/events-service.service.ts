import { CreateEventDto, UpdateEventDto } from '@app/common';
import { DatabaseService } from '@app/database/database.service';
import { events } from '@app/database/schema/events';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { ClientKafka } from '@nestjs/microservices';
import { eq } from 'drizzle-orm';
import { publish } from 'rxjs';

@Injectable()
export class EventsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async create(createEventDto: CreateEventDto, organizerId: string) {
    const [event] = await this.dbService.db
      .insert(events)
      .values({
        ...createEventDto,
        description: createEventDto.description || '',
        date: new Date(createEventDto.date),
        price: createEventDto.price || 0,
        organizerId,
      })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CREATED, {
      eventId: event.id,
      organizerId: event.organizerId,
      title: event.title,
      timestamp: new Date().toISOString(),
    });

    return event;
  }

  async findAll() {
    return this.dbService.db
      .select()
      .from(events)
      .where(eq(events.status, 'PUBLISHED'));
  }

  async findOne(id: string) {
    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string, userRole: string) {
    const event = await this.findOne(id);
    
    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update this event');
    }

    const updatedData: Record<string, unknown> = {...updateEventDto};
    if (updateEventDto.date) {
      updatedData.date = new Date(updateEventDto.date);
    }

    updatedData.updatesdAt = new Date();
      
    const [updated] = await this.dbService.db
      .update(events)
      .set(updatedData)
      .where(eq(events.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
      eventId: updated.id,
      organizerId: updated.organizerId,
      title: updated.title,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async publish(id: string, userId: string, userRole: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to publish this event');
    }

    const [published] = await this.dbService.db
      .update(events)
      .set({ status: 'PUBLISHED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    return published;
  }

  async cancel(id: string, userId: string, userRole: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to cancel this event');
    }

    const [cancelled] = await this.dbService.db
      .update(events)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
      eventId: cancelled.id,
      organizerId: cancelled.organizerId,
      title: cancelled.title,
      timestamp: new Date().toISOString(),
    });
    
    return cancelled;
  }

  async findMyEvents(organizerId: string) {
    return this.dbService.db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId));
  }
}
