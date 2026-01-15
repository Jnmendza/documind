import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Matches Clerk ID
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  isPro: boolean("is_pro").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  originalPrompt: text("original_prompt").notNull(),
  aiOutput: text("ai_output").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  generations: many(generations),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
  document: one(documents, {
    fields: [generations.documentId],
    references: [documents.id],
  }),
}));
