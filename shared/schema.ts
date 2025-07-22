import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Database schemas table
export const databaseSchemas = pgTable("database_schemas", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  dialect: text("dialect").notNull(), // mysql, postgresql, sqlite, etc.
  schemaData: jsonb("schema_data").notNull(), // JSON representation of schema
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Queries table
export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  schemaId: integer("schema_id").references(() => databaseSchemas.id),
  naturalLanguage: text("natural_language").notNull(),
  sqlQuery: text("sql_query").notNull(),
  explanation: text("explanation"),
  dialect: text("dialect").notNull(),
  executionResult: jsonb("execution_result"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shared queries table
export const sharedQueries = pgTable("shared_queries", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => queries.id),
  shareId: text("share_id").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  queries: many(queries),
  schemas: many(databaseSchemas),
}));

export const databaseSchemasRelations = relations(databaseSchemas, ({ one, many }) => ({
  user: one(users, {
    fields: [databaseSchemas.userId],
    references: [users.id],
  }),
  queries: many(queries),
}));

export const queriesRelations = relations(queries, ({ one, many }) => ({
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),
  schema: one(databaseSchemas, {
    fields: [queries.schemaId],
    references: [databaseSchemas.id],
  }),
  sharedQueries: many(sharedQueries),
}));

export const sharedQueriesRelations = relations(sharedQueries, ({ one }) => ({
  query: one(queries, {
    fields: [sharedQueries.queryId],
    references: [queries.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertDatabaseSchemaSchema = createInsertSchema(databaseSchemas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSharedQuerySchema = createInsertSchema(sharedQueries).omit({
  id: true,
  createdAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectDatabaseSchemaSchema = createSelectSchema(databaseSchemas);
export const selectQuerySchema = createSelectSchema(queries);
export const selectSharedQuerySchema = createSelectSchema(sharedQueries);

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertDatabaseSchema = z.infer<typeof insertDatabaseSchemaSchema>;
export type DatabaseSchema = z.infer<typeof selectDatabaseSchemaSchema>;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = z.infer<typeof selectQuerySchema>;
export type InsertSharedQuery = z.infer<typeof insertSharedQuerySchema>;
export type SharedQuery = z.infer<typeof selectSharedQuerySchema>;

// API request/response types
export interface SQLGenerationRequest {
  naturalLanguage: string;
  dialect: string;
  schemaId?: number;
  schemaData?: any;
}

export interface SQLGenerationResponse {
  sqlQuery: string;
  explanation: string;
  dialect: string;
  confidence: number;
}

export interface QueryExecutionRequest {
  sqlQuery: string;
  dialect: string;
  schemaId?: number;
}

export interface QueryExecutionResponse {
  success: boolean;
  data?: any[];
  error?: string;
  executionTime: number;
  rowCount?: number;
}

export interface ShareQueryRequest {
  queryId: number;
  expiresAt?: Date;
}

export interface ShareQueryResponse {
  shareId: string;
  shareUrl: string;
  expiresAt?: Date;
}
