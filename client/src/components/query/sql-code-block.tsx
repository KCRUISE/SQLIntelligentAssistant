import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Play, Heart, Share, Check } from "lucide-react";
import { formatSQL, getFormattingOptions, renderColoredSQL } from "@/lib/sqlFormatter";

interface SQLCodeBlockProps {
  sqlQuery: string;
  dialect: string;
  onExecute?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

export default function SQLCodeBlock({ 
  sqlQuery, 
  dialect, 
  onExecute, 
  onSave, 
  onShare 
}: SQLCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const formattingOptions = getFormattingOptions();
  const formattedSQL = formatSQL(sqlQuery, "standard", formattingOptions);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {dialect.toUpperCase()} Query
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <pre className="overflow-x-auto mb-4">
        <code className="text-sm whitespace-pre-wrap">
          {formattingOptions.colorKeywords ? (
            renderColoredSQL(formattedSQL, formattingOptions.keywordColors)
          ) : (
            formattedSQL
          )}
        </code>
      </pre>
      
      <div className="flex items-center space-x-2">
        {onExecute && (
          <Button size="sm" onClick={onExecute} className="text-xs">
            <Play className="w-3 h-3 mr-1" />
            Run Query
          </Button>
        )}
        
        {onSave && (
          <Button variant="outline" size="sm" onClick={onSave} className="text-xs">
            <Heart className="w-3 h-3 mr-1" />
            Save
          </Button>
        )}
        
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare} className="text-xs">
            <Share className="w-3 h-3 mr-1" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
