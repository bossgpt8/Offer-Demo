import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const giveawayEntriesTable = pgTable("giveaway_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  state: text("state").notNull(),
  network: text("network").notNull(),
  consentToTerms: boolean("consent_to_terms").notNull(),
  consentToContact: boolean("consent_to_contact").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});