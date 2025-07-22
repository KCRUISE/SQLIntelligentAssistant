import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import MessageBubble from "./message-bubble";
import InputArea from "./input-area";
import { SQLGenerationResponse, QueryExecutionResponse } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sqlResponse?: SQLGenerationResponse;
  queryResult?: QueryExecutionResponse;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  onExecuteQuery: (sqlQuery: string) => void;
  selectedDialect: string;
  currentQuery?: SQLGenerationResponse | null;
  currentResult?: QueryExecutionResponse | null;
  isLoading: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  inputValue: string;
  setInputValue: (value: string) => void;
}

export default function ChatInterface({
  onSendMessage,
  onExecuteQuery,
  selectedDialect,
  currentQuery,
  currentResult,
  isLoading,
  connectionStatus,
  inputValue,
  setInputValue,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [executedQueries, setExecutedQueries] = useState<Map<string, QueryExecutionResponse>>(new Map());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add assistant message when query is generated (only for new queries, not executions)
  useEffect(() => {
    if (currentQuery && !isLoading) {
      // Check if we already have a message with this query to avoid duplicates
      const hasExistingMessage = messages.some(msg => 
        msg.sqlResponse?.sqlQuery === currentQuery.sqlQuery
      );
      
      if (!hasExistingMessage) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `요청하신 SQL 쿼리를 생성했습니다. 실행하려면 "Run Query" 버튼을 클릭하세요.`,
          timestamp: new Date(),
          sqlResponse: currentQuery,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    }
  }, [currentQuery, isLoading, messages]);

  // Store query results permanently when they arrive
  useEffect(() => {
    if (currentResult && currentQuery) {
      setExecutedQueries(prev => {
        const newMap = new Map(prev);
        newMap.set(currentQuery.sqlQuery, currentResult);
        return newMap;
      });
    }
  }, [currentResult, currentQuery]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Welcome to SQL Assistant</h3>
              <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                Ask me anything about your database in natural language, and I'll generate the perfect SQL query for you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
                <button 
                  onClick={() => setInputValue("지난주 모든 주문 조회")}
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 border border-border/50 transition-colors text-left"
                >
                  <p className="text-sm text-muted-foreground italic">
                    "지난주 모든 주문 조회"
                  </p>
                </button>
                <button 
                  onClick={() => setInputValue("주문이 5개 이상인 고객 찾기")}
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 border border-border/50 transition-colors text-left"
                >
                  <p className="text-sm text-muted-foreground italic">
                    "주문이 5개 이상인 고객 찾기"
                  </p>
                </button>
                <button 
                  onClick={() => setInputValue("제품 카테고리별 총 매출 조회")}
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 border border-border/50 transition-colors text-left"
                >
                  <p className="text-sm text-muted-foreground italic">
                    "제품 카테고리별 총 매출 조회"
                  </p>
                </button>
                <button 
                  onClick={() => setInputValue("이번 달 상위 10개 인기 제품 목록")}
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 border border-border/50 transition-colors text-left"
                >
                  <p className="text-sm text-muted-foreground italic">
                    "이번 달 상위 10개 인기 제품 목록"
                  </p>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-3 text-sm text-muted-foreground">
                <span className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}></span>
                <span className="font-medium">
                  {connectionStatus === 'connected' ? '연결됨' : 
                   connectionStatus === 'connecting' ? '연결 중...' : 
                   '연결 끊김'}
                </span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            onExecuteQuery={onExecuteQuery}
            selectedDialect={selectedDialect}
            queryResult={
              message.sqlResponse 
                ? executedQueries.get(message.sqlResponse.sqlQuery)
                : undefined
            }
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg p-4 max-w-md">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">SQL Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">SQL 생성 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        selectedDialect={selectedDialect}
      />
    </div>
  );
}
