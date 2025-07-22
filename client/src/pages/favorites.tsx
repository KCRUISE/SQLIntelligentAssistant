import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share, Trash2 } from "lucide-react";
import QueryCard from "@/components/query/query-card";
import { Query } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  const { data: favorites, isLoading, refetch } = useQuery<Query[]>({
    queryKey: ['/api/queries/favorites', { userId: 'demo-user' }],
    enabled: true,
  });

  const handleToggleFavorite = async (queryId: number) => {
    try {
      await apiRequest('POST', `/api/queries/${queryId}/favorite`);
      refetch();
      
      // If the current selected query was unfavorited, clear selection
      if (selectedQuery?.id === queryId) {
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteQuery = async (queryId: number) => {
    try {
      await apiRequest('DELETE', `/api/queries/${queryId}`);
      refetch();
      
      // If the current selected query was deleted, clear selection
      if (selectedQuery?.id === queryId) {
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error('Failed to delete query:', error);
    }
  };

  const handleShareQuery = async (queryId: number) => {
    try {
      const response = await apiRequest('POST', `/api/queries/${queryId}/share`);
      const data = await response.json();
      
      // Copy share URL to clipboard
      navigator.clipboard.writeText(data.shareUrl);
      alert('Share URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to share query:', error);
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
      {/* Favorites List */}
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Favorite Queries</h1>
          <p className="text-muted-foreground">
            Your bookmarked queries for quick access
          </p>
        </div>

        <div className="space-y-4">
          {favorites?.map((query: Query) => (
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
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
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

        {favorites?.length === 0 && (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No favorite queries yet</p>
            <p className="text-sm text-muted-foreground">
              Heart queries from your chat or history to save them here
            </p>
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
            <p className="text-muted-foreground">Select a favorite query to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
