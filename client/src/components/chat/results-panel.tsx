import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share, Clock, CheckCircle, XCircle } from "lucide-react";
import ChartContainer from "@/components/visualization/chart-container";
import { QueryExecutionResponse, SQLGenerationResponse } from "@shared/schema";

interface ResultsPanelProps {
  result?: QueryExecutionResponse | null;
  query?: SQLGenerationResponse | null;
  isLoading: boolean;
}

export default function ResultsPanel({ result, query, isLoading }: ResultsPanelProps) {
  const handleExportCSV = () => {
    if (!result?.data) return;
    
    // Convert data to CSV
    const headers = Object.keys(result.data[0] || {});
    const csvContent = [
      headers.join(','),
      ...result.data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShareLink = () => {
    // Generate shareable link
    const shareData = {
      query: query?.sqlQuery,
      result: result?.data,
      timestamp: new Date().toISOString(),
    };
    
    const shareUrl = `${window.location.origin}/shared/${btoa(JSON.stringify(shareData))}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="w-96 border-l border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Query Results</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {result && (
          <>
            {/* Execution Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {result.success ? 'Success' : 'Error'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{result.executionTime}ms</span>
              </div>
            </div>
            
            {result.success && result.data && (
              <>
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {result.rowCount} rows
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {result.data.length} records
                  </span>
                </div>
                
                {/* Results Table */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {result.data.length > 0 && Object.keys(result.data[0]).map((header) => (
                            <th key={header} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {result.data.map((row, index) => (
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
                  </div>
                </div>
                
                {/* Chart Visualization */}
                <ChartContainer data={result.data} />
                
                {/* Export Options */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={handleExportCSV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={handleShareLink}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </>
            )}
            
            {!result.success && result.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            )}
          </>
        )}
        
        {!result && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Execute a query to see results here
            </p>
          </div>
        )}
      </CardContent>
    </div>
  );
}
