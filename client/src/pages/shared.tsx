import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Share, ExternalLink, Clock, Database, Copy } from "lucide-react";
import { Query, SharedQuery } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SQLCodeBlock from "@/components/query/sql-code-block";

export default function SharedQueriesPage() {
  const [shareId, setShareId] = useState("");
  const [sharedQuery, setSharedQuery] = useState<(SharedQuery & { query: Query }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLookupSharedQuery = async () => {
    if (!shareId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a share ID or URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Extract share ID from URL if full URL is provided
      const extractedId = shareId.includes('/shared/') 
        ? shareId.split('/shared/')[1] 
        : shareId;

      const response = await apiRequest('GET', `/api/shared/${extractedId}`);
      const data = await response.json();
      setSharedQuery(data);
      toast({
        title: "Query Found",
        description: "Shared query loaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Shared query not found or has expired.",
        variant: "destructive",
      });
      setSharedQuery(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuery = () => {
    if (sharedQuery?.query.sqlQuery) {
      navigator.clipboard.writeText(sharedQuery.query.sqlQuery);
      toast({
        title: "Copied",
        description: "SQL query copied to clipboard.",
      });
    }
  };

  const handleExecuteQuery = () => {
    // Placeholder for query execution
    toast({
      title: "Execute Query",
      description: "Query execution would happen here with your database connection.",
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shared Queries</h1>
          <p className="text-muted-foreground">
            Access and view SQL queries that have been shared with you.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Lookup Shared Query</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Input
                placeholder="Enter share ID or full share URL"
                value={shareId}
                onChange={(e) => setShareId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLookupSharedQuery()}
                className="flex-1"
              />
              <Button 
                onClick={handleLookupSharedQuery}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Lookup"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Paste a share URL like: https://your-app.com/shared/abc123 or just the ID: abc123
            </p>
          </CardContent>
        </Card>

        {/* Query Result */}
        {sharedQuery && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {sharedQuery.query.naturalLanguage}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Database className="w-4 h-4" />
                      <span>{sharedQuery.query.dialect.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Created {new Date(sharedQuery.query.createdAt!).toLocaleDateString()}</span>
                    </div>
                    {sharedQuery.expiresAt && (
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          Expires {new Date(sharedQuery.expiresAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCopyQuery}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy SQL
                  </Button>
                  <Button size="sm" onClick={handleExecuteQuery}>
                    Execute
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sharedQuery.query.explanation && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Explanation</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {sharedQuery.query.explanation}
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">SQL Query</h4>
                <SQLCodeBlock
                  sqlQuery={sharedQuery.query.sqlQuery}
                  dialect={sharedQuery.query.dialect}
                  onExecute={handleExecuteQuery}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!sharedQuery && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Query Loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Enter a share ID or URL above to view a shared SQL query.
                </p>
                <div className="text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-2">How to use:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Get a share link from someone who shared a query</li>
                    <li>• Paste the full URL or just the share ID</li>
                    <li>• View, copy, and execute the shared query</li>
                    <li>• Some shared queries may have expiration dates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}