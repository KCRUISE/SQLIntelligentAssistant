import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, PieChart, Database, Play, Download, RefreshCw } from "lucide-react";
import { Query } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SQLCodeBlock from "@/components/query/sql-code-block";

// Sample chart data for demonstration
const sampleChartData = [
  { name: 'Jan', value: 400, sales: 2400 },
  { name: 'Feb', value: 300, sales: 1398 },
  { name: 'Mar', value: 200, sales: 9800 },
  { name: 'Apr', value: 278, sales: 3908 },
  { name: 'May', value: 189, sales: 4800 },
  { name: 'Jun', value: 239, sales: 3800 },
];

export default function DataVisualizationPage() {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [chartType, setChartType] = useState<string>("bar");
  const [executionResult, setExecutionResult] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const { data: queries, isLoading } = useQuery<Query[]>({
    queryKey: ['/api/queries', { userId: 'demo-user' }],
    enabled: true,
  });

  const handleExecuteQuery = async (query: Query) => {
    setIsExecuting(true);
    try {
      // Simulate query execution with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExecutionResult(sampleChartData);
      toast({
        title: "Query Executed",
        description: "Query executed successfully with sample data.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute query.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownloadChart = () => {
    toast({
      title: "Download",
      description: "Chart download functionality would be implemented here.",
    });
  };

  const renderChart = () => {
    if (!executionResult) return null;

    return (
      <div className="bg-muted/20 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
            {chartType === "bar" && <BarChart className="w-16 h-16 text-primary" />}
            {chartType === "line" && <LineChart className="w-16 h-16 text-primary" />}
            {chartType === "pie" && <PieChart className="w-16 h-16 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Visualization
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-card p-3 rounded">
              <div className="font-medium">Total Rows</div>
              <div className="text-2xl font-bold text-primary">{executionResult.length}</div>
            </div>
            <div className="bg-card p-3 rounded">
              <div className="font-medium">Columns</div>
              <div className="text-2xl font-bold text-primary">
                {executionResult[0] ? Object.keys(executionResult[0]).length : 0}
              </div>
            </div>
            <div className="bg-card p-3 rounded">
              <div className="font-medium">Chart Type</div>
              <div className="text-lg font-bold text-primary capitalize">{chartType}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Query Selection Panel */}
      <div className="w-1/3 border-r border-border p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Data Visualization</h1>
          <p className="text-muted-foreground text-sm">
            Execute queries and create visualizations from your data.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Query</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queries?.map((query) => (
                <Card
                  key={query.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedQuery?.id === query.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium line-clamp-2 mb-1">
                      {query.naturalLanguage}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {query.dialect.toUpperCase()}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(query.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedQuery && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Chart Type</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => handleExecuteQuery(selectedQuery)}
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute & Visualize
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {queries?.length === 0 && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              No queries available. Create some queries in the SQL Agent first.
            </p>
          </div>
        )}
      </div>

      {/* Visualization Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedQuery ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {selectedQuery.naturalLanguage}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {selectedQuery.dialect.toUpperCase()}
                  </Badge>
                  <span>Created {new Date(selectedQuery.createdAt!).toLocaleDateString()}</span>
                </div>
              </div>
              {executionResult && (
                <Button variant="outline" onClick={handleDownloadChart}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            {selectedQuery.explanation && (
              <Card>
                <CardHeader>
                  <CardTitle>Query Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{selectedQuery.explanation}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>SQL Query</CardTitle>
              </CardHeader>
              <CardContent>
                <SQLCodeBlock
                  sqlQuery={selectedQuery.sqlQuery}
                  dialect={selectedQuery.dialect}
                  onExecute={() => handleExecuteQuery(selectedQuery)}
                />
              </CardContent>
            </Card>

            {executionResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart()}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Query Selected</h3>
              <p className="text-muted-foreground">
                Select a query from the left panel to create visualizations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}