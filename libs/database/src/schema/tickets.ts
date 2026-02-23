import {pgTable, uuid, varchar, timestamp, pgEnum, integer} from "drizzle-orm/pg-core";
import { users } from "./users";
import { events } from "./events";

export const ticketStatusEnum = pgEnum('ticket_status', [
    'PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN']);

export const tickets = pgTable('tickets', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').notNull().references(() => events.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    status: ticketStatusEnum('status').notNull().default('PENDING'),
    ticketCode: varchar('ticket_code', {length:255}).notNull().unique(),
    purchasedAt: timestamp('purchased_at').notNull().defaultNow(),
    totalPrice: integer('total_price').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;