import { User, Bot, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SQLCodeBlock from "@/components/query/sql-code-block";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sqlResponse?: any;
  queryResult?: any;
}

interface MessageBubbleProps {
  message: Message;
  onExecuteQuery: (sqlQuery: string) => void;
  selectedDialect: string;
  queryResult?: any;
}

export default function MessageBubble({ message, onExecuteQuery, selectedDialect, queryResult }: MessageBubbleProps) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 max-w-md">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <Card className="max-w-4xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">SQL Assistant</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm">{message.content}</p>
            
            {message.sqlResponse && (
              <div className="space-y-4">
                <SQLCodeBlock
                  sqlQuery={message.sqlResponse.sqlQuery}
                  dialect={selectedDialect}
                  onExecute={() => onExecuteQuery(message.sqlResponse.sqlQuery)}
                />
                
                {message.sqlResponse.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">쿼리 설명:</h4>
                    <p className="text-sm text-muted-foreground">
                      {message.sqlResponse.explanation}
                    </p>
                  </div>
                )}

                {/* Display query results inline */}
                {queryResult && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">쿼리 실행 결과</h4>
                      <div className="flex items-center space-x-2">
                        {queryResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {queryResult.executionTime}ms
                        </span>
                      </div>
                    </div>

                    {queryResult.success && queryResult.data && queryResult.data.length > 0 ? (
                      <>
                        <div className="mb-3">
                          <Badge variant="secondary">
                            {queryResult.rowCount || queryResult.data.length}개 행
                          </Badge>
                        </div>
                        <div className="overflow-x-auto rounded border">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(queryResult.data[0]).map((header) => (
                                  <th key={header} className="px-3 py-2 text-left text-xs font-medium uppercase">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {queryResult.data.slice(0, 10).map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value, colIndex) => (
                                    <td key={colIndex} className="px-3 py-2">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {queryResult.data.length > 10 && (
                            <div className="p-2 text-center text-xs text-muted-foreground bg-muted/50">
                              처음 10개 행만 표시됨 (총 {queryResult.data.length}개 행)
                            </div>
                          )}
                        </div>
                      </>
                    ) : queryResult.error ? (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        <strong>오류:</strong> {queryResult.error}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
