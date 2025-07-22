import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Code } from "lucide-react";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  selectedDialect: string;
}

export default function InputArea({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  selectedDialect,
}: InputAreaProps) {
  return (
    <div className="border-t border-border bg-card p-3 md:p-4">
      <div className="flex items-end space-x-2 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyPress}
              className="pr-12 resize-none text-sm md:text-base"
              rows={3}
              placeholder="Ask me anything about your database..."
              disabled={isLoading}
            />
            <Button
              onClick={onSend}
              disabled={isLoading || !value.trim()}
              size="sm"
              className="absolute right-2 bottom-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" className="text-xs">
            <Paperclip className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Attach Schema</span>
            <span className="sm:hidden">Schema</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Raw SQL</span>
            <span className="sm:hidden">SQL</span>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground hidden md:block">
          Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to send
        </div>
      </div>
    </div>
  );
}
