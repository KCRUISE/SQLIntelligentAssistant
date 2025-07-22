import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, Trash2, Play, Clock, Database } from "lucide-react";
import SQLCodeBlock from "./sql-code-block";
import { Query } from "@shared/schema";

interface QueryCardProps {
  query: Query;
  onToggleFavorite: () => void;
  onShare: () => void;
  onDelete: () => void;
  onExecute?: () => void;
}

export default function QueryCard({ 
  query, 
  onToggleFavorite, 
  onShare, 
  onDelete, 
  onExecute 
}: QueryCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              {query.naturalLanguage}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">
                <Database className="w-3 h-3 mr-1" />
                {query.dialect.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(query.createdAt!).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-8 w-8 p-0"
            >
              <Heart className={`w-4 h-4 ${query.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="h-8 w-8 p-0"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <SQLCodeBlock
          sqlQuery={query.sqlQuery}
          dialect={query.dialect}
          onExecute={onExecute}
        />
        
        {query.explanation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Query Explanation:</h4>
            <p className="text-sm text-muted-foreground">
              {query.explanation}
            </p>
          </div>
        )}
        
        {query.executionResult && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Last Execution Result:</h4>
            <div className="text-xs text-muted-foreground">
              <pre className="overflow-x-auto">
                {JSON.stringify(query.executionResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {onExecute && (
          <div className="flex justify-end">
            <Button onClick={onExecute} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Execute Query
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
