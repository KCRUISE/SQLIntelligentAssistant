import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface TopBarProps {
  selectedDialect?: string;
  onDialectChange?: (dialect: string) => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function TopBar({ 
  selectedDialect = "mysql", 
  onDialectChange, 
  onMenuClick, 
  showMenuButton = false 
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <h2 className="text-base md:text-lg font-semibold">Natural Language to SQL</h2>
        <Badge variant="outline" className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
      </div>
    </div>
  );
}
