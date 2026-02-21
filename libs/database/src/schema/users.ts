import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enum for "user" table

export const role = pgEnum('role', ['USER', 'ORGANIZER', 'ADMIN']);

// Tables

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', {length:255}).notNull().unique(),
    password: varchar('password', {length:255}).notNull(),
    name: varchar('name', {length:255}).notNull(),
    role : role('role').notNull().default('USER'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;