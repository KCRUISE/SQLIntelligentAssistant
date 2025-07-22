import { useState, useEffect } from "react";
import ChatInterface from "@/components/chat/chat-interface";
import ResultsPanel from "@/components/chat/results-panel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { SQLGenerationResponse, QueryExecutionResponse } from "@shared/schema";

export default function ChatPage() {
  const [selectedDialect, setSelectedDialect] = useState("oracle");
  const [currentResult, setCurrentResult] = useState<QueryExecutionResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState<SQLGenerationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  const handleSendMessage = async (message: string) => {
    const messageToSend = message || inputValue;
    if (!messageToSend.trim()) return;

    setIsLoading(true);
    setCurrentQuery(null);
    setCurrentResult(null);
    setInputValue("");

    try {
      // Send SQL generation request
      sendMessage({
        type: 'generate_sql',
        payload: {
          naturalLanguage: messageToSend,
          dialect: selectedDialect,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleExecuteQuery = async (sqlQuery: string) => {
    if (!sqlQuery.trim()) return;

    setIsLoading(true);
    setCurrentResult(null);

    try {
      sendMessage({
        type: 'execute_query',
        payload: {
          sqlQuery,
          dialect: selectedDialect,
        },
      });
    } catch (error) {
      console.error('Error executing query:', error);
      setIsLoading(false);
    }
  };

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        switch (data.type) {
          case 'sql_generated':
            setCurrentQuery(data.payload);
            setIsLoading(false);
            break;
          case 'query_executed':
            setCurrentResult(data.payload);
            setIsLoading(false);
            break;
          case 'error':
            console.error('WebSocket error:', data.message);
            setIsLoading(false);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setIsLoading(false);
      }
    }
  }, [lastMessage]);

  return (
    <div className="flex h-full overflow-hidden">
      <ChatInterface
        onSendMessage={handleSendMessage}
        onExecuteQuery={handleExecuteQuery}
        selectedDialect={selectedDialect}
        currentQuery={currentQuery}
        currentResult={currentResult}
        isLoading={isLoading}
        connectionStatus={connectionStatus}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
    </div>
  );
}
