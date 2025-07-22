import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ChartContainerProps {
  data: any[];
}

export default function ChartContainer({ data }: ChartContainerProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Simple heuristic to determine chart type
    const keys = Object.keys(data[0]);
    const numericKeys = keys.filter(key => 
      data.every(item => !isNaN(Number(item[key])))
    );
    
    if (numericKeys.length === 0) return null;
    
    // For small datasets, use pie chart
    if (data.length <= 5 && numericKeys.length === 1) {
      return {
        type: 'pie',
        data: data.map(item => ({
          name: item[keys[0]],
          value: Number(item[numericKeys[0]])
        }))
      };
    }
    
    // For time series or line data
    const hasDate = keys.some(key => 
      data.some(item => !isNaN(Date.parse(item[key])))
    );
    
    if (hasDate) {
      return {
        type: 'line',
        data: data.map(item => ({
          ...item,
          [numericKeys[0]]: Number(item[numericKeys[0]])
        }))
      };
    }
    
    // Default to bar chart
    return {
      type: 'bar',
      data: data.map(item => ({
        ...item,
        [numericKeys[0]]: Number(item[numericKeys[0]])
      }))
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className="bg-muted rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Data Visualization</h4>
        <div className="w-full h-32 flex items-center justify-center text-sm text-muted-foreground">
          No numeric data available for visualization
        </div>
      </div>
    );
  }

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="text-sm font-medium mb-3">Data Visualization</h4>
      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          {chartData.type === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : chartData.type === 'line' ? (
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(chartData.data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={Object.keys(chartData.data[0]).find(key => !isNaN(Number(chartData.data[0][key])))} 
                stroke={colors[0]} 
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(chartData.data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey={Object.keys(chartData.data[0]).find(key => !isNaN(Number(chartData.data[0][key])))} 
                fill={colors[0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
