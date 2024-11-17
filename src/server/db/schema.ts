import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { userRoleEnumValues, userVerifiedEnumValues } from "@/server/db/enums";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const userVerifiedEnum = pgEnum(
  "user_verified_enum",
  userVerifiedEnumValues
);
export const userRoleEnum = pgEnum("user_role_enum", userRoleEnumValues);
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("USER"),
  verified_status: userVerifiedEnum("verified_status")
    .notNull()
    .default("UNVERIFIED"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = pgTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  title: varchar("title").notNull(),
  description: varchar("description").notNull(),
  maxTenants: integer("max_tenants").notNull(),
  current_capacity: integer("current_capacity").notNull(),
  monthly_price: integer("monthly_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  uploadedBy: text("uploadedBy")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});

export const listingFiles = pgTable(
  "listing_files",
  {
    // listing may have more files
    listingId: uuid("listingId").references(() => listings.id, {
      onDelete: "cascade",
    }),
    fileId: uuid("fileId").references(() => files.id, {
      onDelete: "cascade",
    }),
  },
  (table) => ({
    pk: primaryKey({
      name: "listingFilesId",
      columns: [table.listingId, table.fileId],
    }),
  })
);

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  bio: text("bio").notNull(),
});
