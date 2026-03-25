import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const majlisInvitesTable = pgTable("majlis_invites", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const majlisUsersTable = pgTable("majlis_users", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().unique().references(() => profilesTable.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isBanned: boolean("is_banned").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const majlisMessagesTable = pgTable("majlis_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => majlisUsersTable.id),
  content: text("content").notNull(),
  replyToId: integer("reply_to_id"),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  editedAt: timestamp("edited_at"),
});

export type MajlisInvite = typeof majlisInvitesTable.$inferSelect;
export type MajlisUser = typeof majlisUsersTable.$inferSelect;
export type MajlisMessage = typeof majlisMessagesTable.$inferSelect;
