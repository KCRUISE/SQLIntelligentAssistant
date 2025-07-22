import OpenAI from "openai";
import { SQLGenerationRequest, SQLGenerationResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export class OpenAIService {
  async generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.dialect, request.schemaData);
      const userPrompt = this.buildUserPrompt(request.naturalLanguage);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sqlQuery: result.sql_query || "",
        explanation: result.explanation || "",
        dialect: request.dialect,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate SQL query: " + (error as Error).message);
    }
  }

  async explainSQL(sqlQuery: string, dialect: string): Promise<string> {
    try {
      const systemPrompt = `You are a SQL expert. Explain the given SQL query in clear, simple terms in Korean language. Focus on what the query does, how it works, and any important details about its structure or performance implications. Use the ${dialect} dialect context. IMPORTANT: All explanations must be written in Korean language (한국어).`;
      
      const userPrompt = `Please explain this SQL query in Korean language:\n\n${sqlQuery}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      });

      return response.choices[0].message.content || "쿼리 설명을 생성할 수 없습니다.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to explain SQL query: " + (error as Error).message);
    }
  }

  async convertSQLDialect(sqlQuery: string, fromDialect: string, toDialect: string): Promise<string> {
    try {
      const systemPrompt = `You are a SQL expert specializing in database dialect conversion. Convert the given SQL query from ${fromDialect} to ${toDialect}. Ensure the converted query maintains the same functionality while using the appropriate syntax and features for the target dialect.`;
      
      const userPrompt = `Convert this ${fromDialect} query to ${toDialect}:\n\n${sqlQuery}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      });

      return response.choices[0].message.content || sqlQuery;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to convert SQL dialect: " + (error as Error).message);
    }
  }

  private buildSystemPrompt(dialect: string, schemaData?: any): string {
    let prompt = `You are an expert SQL assistant specialized in ${dialect}. Your task is to convert natural language queries into accurate SQL statements.

Rules:
1. Generate valid ${dialect} SQL syntax
2. Always respond in JSON format with keys: "sql_query", "explanation", "confidence"
3. The "sql_query" should be clean, properly formatted SQL
4. The "explanation" should describe what the query does and how it works IN KOREAN LANGUAGE
5. The "confidence" should be a number between 0 and 1 indicating how confident you are in the result
6. Use appropriate ${dialect} specific functions and syntax
7. Always include proper error handling and edge cases
8. Format the SQL query with proper indentation and line breaks for readability
9. ALL explanations and descriptions MUST be written in Korean language (한국어)`;

    if (schemaData && typeof schemaData === 'object') {
      prompt += `\n\nDatabase Schema:\n${JSON.stringify(schemaData, null, 2)}`;
    }

    return prompt;
  }

  private buildUserPrompt(naturalLanguage: string): string {
    return `Convert this natural language query to SQL: "${naturalLanguage}"

Please provide the response in JSON format with the following structure:
{
  "sql_query": "SELECT ... FROM ... WHERE ...",
  "explanation": "이 쿼리는 ... 를 조회합니다 (MUST be in Korean)",
  "confidence": 0.95
}

IMPORTANT: All explanations must be written in Korean language (한국어).`;
  }
}

export const openaiService = new OpenAIService();
