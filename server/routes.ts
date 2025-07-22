import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { queryExecutor } from "./services/queryExecutor";
import { seedDatabase } from "./seedData";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  insertDatabaseSchemaSchema,
  insertQuerySchema,
  insertSharedQuerySchema,
  type SQLGenerationRequest,
  type QueryExecutionRequest,
  type ShareQueryRequest,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'generate_sql':
            await handleGenerateSQL(ws, data);
            break;
          case 'execute_query':
            await handleExecuteQuery(ws, data);
            break;
          case 'explain_sql':
            await handleExplainSQL(ws, data);
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message: ' + (error as Error).message 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // REST API Routes

  // Schema management
  app.post('/api/schemas', async (req, res) => {
    try {
      const schemaData = insertDatabaseSchemaSchema.parse(req.body);
      const schema = await storage.createSchema(schemaData);
      res.json(schema);
    } catch (error) {
      res.status(400).json({ message: "Invalid schema data: " + (error as Error).message });
    }
  });

  app.get('/api/schemas', async (req, res) => {
    try {
      // For development, use a default user ID
      const userId = req.query.userId as string || "demo-user";
      
      const schemas = await storage.getUserSchemas(userId);
      res.json(schemas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schemas: " + (error as Error).message });
    }
  });

  app.get('/api/schemas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = await storage.getSchema(id);
      
      if (!schema) {
        return res.status(404).json({ message: "Schema not found" });
      }
      
      res.json(schema);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schema: " + (error as Error).message });
    }
  });

  app.put('/api/schemas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDatabaseSchemaSchema.partial().parse(req.body);
      const schema = await storage.updateSchema(id, updates);
      
      if (!schema) {
        return res.status(404).json({ message: "Schema not found" });
      }
      
      res.json(schema);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data: " + (error as Error).message });
    }
  });

  app.delete('/api/schemas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSchema(id);
      
      if (!success) {
        return res.status(404).json({ message: "Schema not found" });
      }
      
      res.json({ message: "Schema deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete schema: " + (error as Error).message });
    }
  });

  // Query management
  app.post('/api/queries', async (req, res) => {
    try {
      const queryData = insertQuerySchema.parse(req.body);
      const query = await storage.createQuery(queryData);
      res.json(query);
    } catch (error) {
      res.status(400).json({ message: "Invalid query data: " + (error as Error).message });
    }
  });

  app.get('/api/queries', async (req, res) => {
    try {
      // For development, use a default user ID
      const userId = req.query.userId as string || "demo-user";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string;
      
      let queries;
      if (search) {
        queries = await storage.searchQueries(userId, search);
      } else {
        queries = await storage.getUserQueries(userId, limit);
      }
      
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queries: " + (error as Error).message });
    }
  });

  app.get('/api/queries/favorites', async (req, res) => {
    try {
      // For development, use a default user ID
      const userId = req.query.userId as string || "demo-user";
      
      const queries = await storage.getUserFavoriteQueries(userId);
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite queries: " + (error as Error).message });
    }
  });

  app.post('/api/queries/:id/favorite', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const query = await storage.toggleQueryFavorite(id);
      
      if (!query) {
        return res.status(404).json({ message: "Query not found" });
      }
      
      res.json(query);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle favorite: " + (error as Error).message });
    }
  });

  app.delete('/api/queries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuery(id);
      
      if (!success) {
        return res.status(404).json({ message: "Query not found" });
      }
      
      res.json({ message: "Query deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete query: " + (error as Error).message });
    }
  });

  // SQL generation
  app.post('/api/sql/generate', async (req, res) => {
    try {
      const request = z.object({
        naturalLanguage: z.string().min(1),
        dialect: z.string().min(1),
        schemaId: z.number().optional(),
        schemaData: z.any().optional(),
      }).parse(req.body);
      
      const result = await openaiService.generateSQL(request);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to generate SQL: " + (error as Error).message });
    }
  });

  app.post('/api/sql/explain', async (req, res) => {
    try {
      const { sqlQuery, dialect } = z.object({
        sqlQuery: z.string().min(1),
        dialect: z.string().min(1),
      }).parse(req.body);
      
      const explanation = await openaiService.explainSQL(sqlQuery, dialect);
      res.json({ explanation });
    } catch (error) {
      res.status(400).json({ message: "Failed to explain SQL: " + (error as Error).message });
    }
  });

  app.post('/api/sql/convert', async (req, res) => {
    try {
      const { sqlQuery, fromDialect, toDialect } = z.object({
        sqlQuery: z.string().min(1),
        fromDialect: z.string().min(1),
        toDialect: z.string().min(1),
      }).parse(req.body);
      
      const convertedQuery = await openaiService.convertSQLDialect(sqlQuery, fromDialect, toDialect);
      res.json({ convertedQuery });
    } catch (error) {
      res.status(400).json({ message: "Failed to convert SQL: " + (error as Error).message });
    }
  });

  // Query execution
  app.post('/api/sql/execute', async (req, res) => {
    try {
      const request = z.object({
        sqlQuery: z.string().min(1),
        dialect: z.string().min(1),
        schemaId: z.number().optional(),
      }).parse(req.body);
      
      const result = await queryExecutor.executeQuery(request);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to execute query: " + (error as Error).message });
    }
  });

  app.post('/api/sql/validate', async (req, res) => {
    try {
      const { sqlQuery, dialect } = z.object({
        sqlQuery: z.string().min(1),
        dialect: z.string().min(1),
      }).parse(req.body);
      
      const result = await queryExecutor.validateQuery(sqlQuery, dialect);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to validate query: " + (error as Error).message });
    }
  });

  // Query sharing
  app.post('/api/queries/:id/share', async (req, res) => {
    try {
      const queryId = parseInt(req.params.id);
      const { expiresAt } = z.object({
        expiresAt: z.string().optional(),
      }).parse(req.body);
      
      const shareId = nanoid(16);
      const sharedQuery = await storage.createSharedQuery({
        queryId,
        shareId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });
      
      const baseUrl = req.protocol + '://' + req.get('host');
      const shareUrl = `${baseUrl}/shared/${shareId}`;
      
      res.json({
        shareId,
        shareUrl,
        expiresAt: sharedQuery.expiresAt,
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to share query: " + (error as Error).message });
    }
  });

  app.get('/api/shared/:shareId', async (req, res) => {
    try {
      const shareId = req.params.shareId;
      const sharedQuery = await storage.getSharedQueryWithQuery(shareId);
      
      if (!sharedQuery) {
        return res.status(404).json({ message: "Shared query not found or expired" });
      }
      
      res.json(sharedQuery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shared query: " + (error as Error).message });
    }
  });

  // Cleanup task
  app.post('/api/cleanup/expired-shares', async (req, res) => {
    try {
      const count = await storage.cleanupExpiredSharedQueries();
      res.json({ message: `Cleaned up ${count} expired shared queries` });
    } catch (error) {
      res.status(500).json({ message: "Failed to cleanup expired shares: " + (error as Error).message });
    }
  });

  // Development seeding endpoint
  app.post('/api/seed', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: "Database seeded successfully with sample data" });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed database: " + (error as Error).message });
    }
  });

  // WebSocket message handlers
  async function handleGenerateSQL(ws: WebSocket, data: any) {
    try {
      const request: SQLGenerationRequest = data.payload;
      const result = await openaiService.generateSQL(request);
      
      // Save query to database for history
      try {
        await storage.createQuery({
          userId: "demo-user",
          naturalLanguage: request.naturalLanguage,
          sqlQuery: result.sqlQuery,
          dialect: result.dialect,
          explanation: result.explanation,
          schemaId: request.schemaId,
          isFavorite: false,
        });
      } catch (saveError) {
        console.error('Failed to save query to database:', saveError);
      }
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sql_generated',
          payload: result,
          requestId: data.requestId,
        }));
      }
    } catch (error) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to generate SQL: ' + (error as Error).message,
          requestId: data.requestId,
        }));
      }
    }
  }

  async function handleExecuteQuery(ws: WebSocket, data: any) {
    try {
      const request: QueryExecutionRequest = data.payload;
      const result = await queryExecutor.executeQuery(request);
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'query_executed',
          payload: result,
          requestId: data.requestId,
        }));
      }
    } catch (error) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to execute query: ' + (error as Error).message,
          requestId: data.requestId,
        }));
      }
    }
  }

  async function handleExplainSQL(ws: WebSocket, data: any) {
    try {
      const { sqlQuery, dialect } = data.payload;
      const explanation = await openaiService.explainSQL(sqlQuery, dialect);
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sql_explained',
          payload: { explanation },
          requestId: data.requestId,
        }));
      }
    } catch (error) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to explain SQL: ' + (error as Error).message,
          requestId: data.requestId,
        }));
      }
    }
  }

  return httpServer;
}
