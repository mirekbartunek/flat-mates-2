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
import {
  listingStatusEnumValues,
  reservationStatusEnumValues,
  tenantSocialsEnumValues,
  userRoleEnumValues,
  userVerifiedEnumValues
} from "@/server/db/enums";
import { point } from "drizzle-orm/pg-core/columns/point";

export const userVerifiedEnum = pgEnum(
  "user_verified_enum",
  userVerifiedEnumValues
);
export const userRoleEnum = pgEnum("user_role_enum", userRoleEnumValues);
export const users = pgTable("user", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text("email").notNull(),
  emailVerified: timestamp({ mode: "date" }),
  image: text(),
  role: userRoleEnum().notNull().default("USER"),
  verified_status: userVerifiedEnum().notNull().default("UNVERIFIED"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  listings: many(listings),
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

export const listingStatusEnum = pgEnum("listing_status", listingStatusEnumValues)

export const listings = pgTable("listings", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  title: varchar().notNull(),
  description: varchar().notNull(),
  max_tenants: integer().notNull(),
  monthly_price: integer().notNull(),
  area: integer().notNull(),
  rooms: integer().notNull(),
  location: point({mode: "tuple"}).notNull(), // LONG LAT
  listing_status: listingStatusEnum().notNull().default("HIDDEN"),
  createdAt: timestamp().defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  key: text().notNull(),
  url: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  uploadedBy: text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});

export const listingFiles = pgTable("listing_files", {
  id: uuid().primaryKey().defaultRandom(),
  listingId: uuid()
    .references(() => listings.id, {
      onDelete: "cascade",
    })
    .notNull(),
  fileId: uuid()
    .references(() => files.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const tenants = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  bio: text().notNull(),
});

export const socialEnum = pgEnum("socials", tenantSocialsEnumValues);

export const tenantSocials = pgTable("tenant_socials", {
  id: uuid().primaryKey().defaultRandom(),
  tenantId: uuid()
    .references(() => tenants.id, {
      onDelete: "cascade",
    })
    .notNull(),
  social_enum: socialEnum().notNull(),
  url: text().notNull(),
});

export const listingTenants = pgTable("listing_tenants", {
  id: uuid().primaryKey().defaultRandom(),
  listingId: uuid()
    .references(() => listings.id, {
      onDelete: "cascade",
    })
    .notNull(),
  tenantId: uuid()
    .references(() => tenants.id, {
      onDelete: "cascade",
    })
    .notNull(),
});
export const reservationStatusEnum = pgEnum(
  "reservation_status",
  reservationStatusEnumValues
);

export const listingReservations = pgTable("listing_reservations", {
  id: uuid().primaryKey().defaultRandom(),
  listing_id: uuid()
    .notNull()
    .references(() => listings.id, {
      onDelete: "cascade",
    }),
  user_id: text()
    .notNull()
    .references(() => users.id),
  message: text(),
  status: reservationStatusEnum().notNull().default("pending"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const listingsRelations = relations(listings, ({ one, many }) => ({
  creator: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  files: many(listingFiles),
  tenants: many(listingTenants),
  reservations: many(listingReservations),
}));

export const filesRelations = relations(files, ({ many }) => ({
  listingFiles: many(listingFiles),
}));

export const listingFilesRelations = relations(listingFiles, ({ one }) => ({
  listing: one(listings, {
    fields: [listingFiles.listingId],
    references: [listings.id],
  }),
  file: one(files, {
    fields: [listingFiles.fileId],
    references: [files.id],
  }),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  socials: many(tenantSocials),
  listings: many(listingTenants),
}));

export const tenantSocialsRelations = relations(tenantSocials, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantSocials.tenantId],
    references: [tenants.id],
  }),
}));

export const listingTenantsRelations = relations(listingTenants, ({ one }) => ({
  listing: one(listings, {
    fields: [listingTenants.listingId],
    references: [listings.id],
  }),
  tenant: one(tenants, {
    fields: [listingTenants.tenantId],
    references: [tenants.id],
  }),
}));

export const listingReservationsRelations = relations(
  listingReservations,
  ({ one }) => ({
    listing: one(listings, {
      fields: [listingReservations.listing_id],
      references: [listings.id],
    }),
    user: one(users, {
      fields: [listingReservations.user_id],
      references: [users.id],
    }),
  })
);
