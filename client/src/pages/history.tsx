import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Heart, Share } from "lucide-react";
import QueryCard from "@/components/query/query-card";
import { Query } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queries, isLoading, refetch } = useQuery<Query[]>({
    queryKey: ['/api/queries', { userId: 'demo-user', search: searchTerm }],
    enabled: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (queryId: number) => {
      await apiRequest('DELETE', `/api/queries/${queryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      toast({
        title: "Query Deleted",
        description: "Query has been removed from your history.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete query: " + error.message,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (queryId: number) => {
      await apiRequest('POST', `/api/queries/${queryId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queries/favorites'] });
      toast({
        title: "Updated",
        description: "Query favorite status updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorite: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuery = async (queryId: number) => {
    deleteMutation.mutate(queryId);
  };

  const handleToggleFavorite = async (queryId: number) => {
    favoriteMutation.mutate(queryId);
  };

  const handleShareQuery = async (queryId: number) => {
    try {
      const response = await apiRequest('POST', `/api/queries/${queryId}/share`);
      const data = await response.json();
      navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Query List */}
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Query History</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {queries?.map((query: Query) => (
            <Card
              key={query.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedQuery?.id === query.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedQuery(query)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {query.naturalLanguage}
                  </CardTitle>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(query.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Heart className={`w-4 h-4 ${query.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareQuery(query.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuery(query.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {query.dialect.toUpperCase()} • {new Date(query.createdAt!).toLocaleDateString()}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {queries?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No queries found</p>
          </div>
        )}
      </div>

      {/* Query Detail */}
      <div className="w-1/2 p-6 overflow-y-auto">
        {selectedQuery ? (
          <QueryCard
            query={selectedQuery}
            onToggleFavorite={() => handleToggleFavorite(selectedQuery.id)}
            onShare={() => handleShareQuery(selectedQuery.id)}
            onDelete={() => handleDeleteQuery(selectedQuery.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a query to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
