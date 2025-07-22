import {
  users,
  databaseSchemas,
  queries,
  sharedQueries,
  type User,
  type UpsertUser,
  type InsertDatabaseSchema,
  type DatabaseSchema,
  type InsertQuery,
  type Query,
  type InsertSharedQuery,
  type SharedQuery,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Database Schema operations
  createSchema(schema: InsertDatabaseSchema): Promise<DatabaseSchema>;
  getSchema(id: number): Promise<DatabaseSchema | undefined>;
  getUserSchemas(userId: string): Promise<DatabaseSchema[]>;
  updateSchema(id: number, updates: Partial<InsertDatabaseSchema>): Promise<DatabaseSchema | undefined>;
  deleteSchema(id: number): Promise<boolean>;

  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getQuery(id: number): Promise<Query | undefined>;
  getUserQueries(userId: string, limit?: number): Promise<Query[]>;
  getUserFavoriteQueries(userId: string): Promise<Query[]>;
  updateQuery(id: number, updates: Partial<InsertQuery>): Promise<Query | undefined>;
  deleteQuery(id: number): Promise<boolean>;
  toggleQueryFavorite(id: number): Promise<Query | undefined>;
  searchQueries(userId: string, searchTerm: string): Promise<Query[]>;

  // Shared Query operations
  createSharedQuery(sharedQuery: InsertSharedQuery): Promise<SharedQuery>;
  getSharedQuery(shareId: string): Promise<SharedQuery | undefined>;
  getSharedQueryWithQuery(shareId: string): Promise<(SharedQuery & { query: Query }) | undefined>;
  deactivateSharedQuery(shareId: string): Promise<boolean>;
  cleanupExpiredSharedQueries(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Database Schema operations
  async createSchema(schema: InsertDatabaseSchema): Promise<DatabaseSchema> {
    const [newSchema] = await db
      .insert(databaseSchemas)
      .values(schema)
      .returning();
    return newSchema as DatabaseSchema;
  }

  async getSchema(id: number): Promise<DatabaseSchema | undefined> {
    const [schema] = await db
      .select()
      .from(databaseSchemas)
      .where(eq(databaseSchemas.id, id));
    return schema as DatabaseSchema;
  }

  async getUserSchemas(userId: string): Promise<DatabaseSchema[]> {
    const schemas = await db
      .select()
      .from(databaseSchemas)
      .where(eq(databaseSchemas.userId, userId))
      .orderBy(desc(databaseSchemas.createdAt));
    return schemas as DatabaseSchema[];
  }

  async updateSchema(id: number, updates: Partial<InsertDatabaseSchema>): Promise<DatabaseSchema | undefined> {
    const [schema] = await db
      .update(databaseSchemas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(databaseSchemas.id, id))
      .returning();
    return schema;
  }

  async deleteSchema(id: number): Promise<boolean> {
    const result = await db
      .delete(databaseSchemas)
      .where(eq(databaseSchemas.id, id));
    return result.rowCount > 0;
  }

  // Query operations
  async createQuery(query: InsertQuery): Promise<Query> {
    const [newQuery] = await db
      .insert(queries)
      .values(query)
      .returning();
    return newQuery;
  }

  async getQuery(id: number): Promise<Query | undefined> {
    const [query] = await db
      .select()
      .from(queries)
      .where(eq(queries.id, id));
    return query;
  }

  async getUserQueries(userId: string, limit = 50): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.userId, userId))
      .orderBy(desc(queries.createdAt))
      .limit(limit);
  }

  async getUserFavoriteQueries(userId: string): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(and(eq(queries.userId, userId), eq(queries.isFavorite, true)))
      .orderBy(desc(queries.createdAt));
  }

  async updateQuery(id: number, updates: Partial<InsertQuery>): Promise<Query | undefined> {
    const [query] = await db
      .update(queries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(queries.id, id))
      .returning();
    return query;
  }

  async deleteQuery(id: number): Promise<boolean> {
    const result = await db
      .delete(queries)
      .where(eq(queries.id, id));
    return result.rowCount > 0;
  }

  async toggleQueryFavorite(id: number): Promise<Query | undefined> {
    const [query] = await db
      .update(queries)
      .set({ isFavorite: sql`NOT ${queries.isFavorite}`, updatedAt: new Date() })
      .where(eq(queries.id, id))
      .returning();
    return query;
  }

  async searchQueries(userId: string, searchTerm: string): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(
        and(
          eq(queries.userId, userId),
          or(
            ilike(queries.naturalLanguage, `%${searchTerm}%`),
            ilike(queries.sqlQuery, `%${searchTerm}%`),
            ilike(queries.explanation, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(queries.createdAt));
  }

  // Shared Query operations
  async createSharedQuery(sharedQuery: InsertSharedQuery): Promise<SharedQuery> {
    const [newSharedQuery] = await db
      .insert(sharedQueries)
      .values(sharedQuery)
      .returning();
    return newSharedQuery;
  }

  async getSharedQuery(shareId: string): Promise<SharedQuery | undefined> {
    const [sharedQuery] = await db
      .select()
      .from(sharedQueries)
      .where(
        and(
          eq(sharedQueries.shareId, shareId),
          eq(sharedQueries.isActive, true),
          or(
            eq(sharedQueries.expiresAt, null),
            sql`${sharedQueries.expiresAt} > NOW()`
          )
        )
      );
    return sharedQuery;
  }

  async getSharedQueryWithQuery(shareId: string): Promise<(SharedQuery & { query: Query }) | undefined> {
    const [result] = await db
      .select()
      .from(sharedQueries)
      .innerJoin(queries, eq(sharedQueries.queryId, queries.id))
      .where(
        and(
          eq(sharedQueries.shareId, shareId),
          eq(sharedQueries.isActive, true),
          or(
            eq(sharedQueries.expiresAt, null),
            sql`${sharedQueries.expiresAt} > NOW()`
          )
        )
      );
    
    if (!result) return undefined;
    
    return {
      ...result.shared_queries,
      query: result.queries,
    };
  }

  async deactivateSharedQuery(shareId: string): Promise<boolean> {
    const result = await db
      .update(sharedQueries)
      .set({ isActive: false })
      .where(eq(sharedQueries.shareId, shareId));
    return result.rowCount > 0;
  }

  async cleanupExpiredSharedQueries(): Promise<number> {
    const result = await db
      .update(sharedQueries)
      .set({ isActive: false })
      .where(
        and(
          eq(sharedQueries.isActive, true),
          sql`${sharedQueries.expiresAt} <= NOW()`
        )
      );
    return result.rowCount;
  }
}

export const storage = new DatabaseStorage();
