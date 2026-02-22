import { integer, pgEnum, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { pgTable } from "drizzle-orm/pg-core";


export const eventStatusEnum = pgEnum('event_status',[
    'DRAFT',
    'PUBLISHED',
    'CANCELLED']);

    export const events = pgTable('events',{
        id: uuid('id').defaultRandom().primaryKey(),
        title: varchar('title', {length:255}).notNull(),
        description: varchar('description', {length:1000}).notNull(),
        date: timestamp('date').notNull(),
        location: varchar('location', {length:255}).notNull(),
        capacity: integer('capacity').notNull(),
        price: integer('price').notNull().default(0),
        status: eventStatusEnum('status').notNull().default('DRAFT'),
        organizerId: uuid('organizer_id').notNull().references(() => users.id),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    })

    export type Event = typeof events.$inferSelect;
    export type NewEvent = typeof events.$inferInsert;

