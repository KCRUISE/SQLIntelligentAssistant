import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Upload, RefreshCw, Code2, CheckCircle, AlertCircle, Settings, Palette, Save, RotateCcw, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DATABASE_DIALECTS } from "@/lib/constants";
import SQLCodeBlock from "@/components/query/sql-code-block";
import { formatSQL, getFormattingOptions, saveFormattingOptions, renderColoredSQL } from "@/lib/sqlFormatter";

const FORMATTING_OPTIONS = [
  { value: "standard", label: "표준", description: "깔끔하고 읽기 쉬운 포맷팅" },
  { value: "compact", label: "압축", description: "최소한의 공백 사용" },
  { value: "expanded", label: "확장", description: "명확성을 위한 추가 간격" },
];

const KEYWORD_CASE_OPTIONS = [
  { value: "upper", label: "대문자" },
  { value: "lower", label: "소문자" },
  { value: "capitalize", label: "첫글자 대문자" },
  { value: "preserve", label: "원본 유지" },
];

const COMMA_POSITION_OPTIONS = [
  { value: "after", label: "콤마 뒤 (a, b, c)" },
  { value: "before", label: "콤마 앞 (a ,b ,c)" },
  { value: "line-after", label: "줄 끝 (a,\nb,\nc)" },
  { value: "line-before", label: "줄 시작 (a\n,b\n,c)" },
];

const KEYWORD_COLORS = {
  select: "#0066cc",
  from: "#008000", 
  where: "#800080",
  join: "#cc6600",
  order: "#cc0000",
  group: "#990099",
  having: "#006666",
  insert: "#b30000",
  update: "#b30000",
  delete: "#b30000",
  create: "#004d99",
  alter: "#004d99",
  drop: "#b30000",
};

const COLOR_THEMES = [
  {
    name: "기본 테마",
    colors: {
      select: "#0066cc", from: "#008000", where: "#800080", join: "#cc6600",
      order: "#cc0000", group: "#990099", having: "#006666", insert: "#b30000",
      update: "#b30000", delete: "#b30000", create: "#004d99", alter: "#004d99", drop: "#b30000"
    }
  },
  {
    name: "다크 테마",
    colors: {
      select: "#4da6ff", from: "#66b366", where: "#b366b3", join: "#ff9933",
      order: "#ff4d4d", group: "#cc66cc", having: "#4dcccc", insert: "#ff6666",
      update: "#ff6666", delete: "#ff6666", create: "#6699ff", alter: "#6699ff", drop: "#ff6666"
    }
  },
  {
    name: "파스텔 테마",
    colors: {
      select: "#87ceeb", from: "#98fb98", where: "#dda0dd", join: "#f4a460",
      order: "#fa8072", group: "#dda0dd", having: "#afeeee", insert: "#ffa07a",
      update: "#ffa07a", delete: "#ffa07a", create: "#87cefa", alter: "#87cefa", drop: "#ffa07a"
    }
  },
  {
    name: "모노크롬",
    colors: {
      select: "#2c3e50", from: "#34495e", where: "#7f8c8d", join: "#95a5a6",
      order: "#bdc3c7", group: "#ecf0f1", having: "#2c3e50", insert: "#34495e",
      update: "#34495e", delete: "#34495e", create: "#2c3e50", alter: "#2c3e50", drop: "#34495e"
    }
  }
];

const SAMPLE_SQL_PREVIEW = `SELECT u.user_id, u.user_name, COUNT(o.order_id) AS order_count, SUM(o.total_amount) AS total_spent FROM users u LEFT JOIN orders o ON u.user_id = o.user_id WHERE u.created_date >= DATE '2023-01-01' AND u.status = 'ACTIVE' GROUP BY u.user_id, u.user_name HAVING COUNT(o.order_id) > 0 ORDER BY total_spent DESC LIMIT 10;`;

const ADVANCED_FORMATTING_OPTIONS = [
  { key: "removeExtraSpaces", label: "공백 정리", description: "불필요한 여분 공백 제거" },
  { key: "uppercaseDataTypes", label: "데이터 타입 대문자", description: "VARCHAR2, NUMBER 등을 대문자로 변환" },
  { key: "standardizeOperators", label: "연산자 표준화", description: "=, >, < 등 연산자 주변 공백 통일" },
  { key: "formatSubqueries", label: "서브쿼리 들여쓰기", description: "중첩 쿼리 자동 들여쓰기" },
  { key: "normalizeKeywords", label: "예약어 정규화", description: "SQL 예약어 스타일 통일" },
  { key: "optimizeJoins", label: "조인 최적화", description: "JOIN 구문 가독성 향상" },
];

const PRESET_STYLES = [
  {
    name: "Oracle 스타일",
    description: "Oracle Database 권장 스타일",
    settings: {
      keywordCase: "upper",
      commaPosition: "after",
      indentSize: 2,
      addLineBreaks: true,
      addSpacing: true,
      colorKeywords: true,
      preserveComments: true,
      alignColumns: true,
      uppercaseDataTypes: true,
    }
  },
  {
    name: "PostgreSQL 스타일", 
    description: "PostgreSQL 커뮤니티 스타일",
    settings: {
      keywordCase: "lower",
      commaPosition: "line-before",
      indentSize: 4,
      addLineBreaks: true,
      addSpacing: true,
      colorKeywords: true,
      preserveComments: true,
      alignColumns: false,
      uppercaseDataTypes: false,
    }
  },
  {
    name: "압축 스타일",
    description: "최소한의 공간 사용",
    settings: {
      keywordCase: "upper",
      commaPosition: "after",
      indentSize: 1,
      addLineBreaks: false,
      addSpacing: false,
      colorKeywords: false,
      preserveComments: false,
      alignColumns: false,
      uppercaseDataTypes: true,
    }
  }
];

const SAMPLE_SQL = `SELECT u.user_id, u.user_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM users u LEFT JOIN orders o ON u.user_id = o.user_id WHERE u.created_date >= DATE '2023-01-01' AND u.status = 'ACTIVE' GROUP BY u.user_id, u.user_name HAVING COUNT(o.order_id) > 0 ORDER BY total_spent DESC FETCH FIRST 10 ROWS ONLY;`;

interface FormattingOptions {
  keywordCase: string;
  commaPosition: string;
  indentSize: number;
  addLineBreaks: boolean;
  addSpacing: boolean;
  colorKeywords: boolean;
  keywordColors: Record<string, string>;
  maxLineLength: number;
  alignColumns: boolean;
  uppercaseDataTypes: boolean;
  removeExtraSpaces: boolean;
  formatSubqueries: boolean;
  standardizeOperators: boolean;
  normalizeKeywords: boolean;
  optimizeJoins: boolean;
  quoteStyle: string;
  caseConversion: string;
  unifiedKeywordColor: string;
}

export default function SQLFormatterPage() {
  const [inputSQL, setInputSQL] = useState("");
  const [formattedSQL, setFormattedSQL] = useState("");
  const [selectedDialect, setSelectedDialect] = useState("oracle");
  const [formattingStyle, setFormattingStyle] = useState("standard");
  const [isFormatting, setIsFormatting] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [isFormatterDialogOpen, setIsFormatterDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { toast } = useToast();

  const [formattingOptions, setFormattingOptions] = useState(() => getFormattingOptions());

  const [originalOptions, setOriginalOptions] = useState<FormattingOptions>(formattingOptions);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveFormattingOptions(formattingOptions);
  }, [formattingOptions]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formattingOptions) !== JSON.stringify(originalOptions);
    setHasUnsavedChanges(hasChanges);
  }, [formattingOptions, originalOptions]);

  const formatSQLLocal = (sql: string, style: string = "standard", options = formattingOptions): string => {
    if (!sql.trim()) return "";

    let formatted = sql.replace(/\s+/g, ' ').trim();

    // Apply keyword case transformation first
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE',
      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN',
      'UNION', 'INTERSECT', 'EXCEPT', 'MINUS',
      'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
      'DISTINCT', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'COALESCE', 'NVL', 'DECODE', 'CAST',
      'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'WINDOW', 'ON'
    ];

    // Apply keyword case
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'gi');
      formatted = formatted.replace(regex, (match) => {
        switch (options.keywordCase) {
          case "upper": return keyword.toUpperCase();
          case "lower": return keyword.toLowerCase();
          case "capitalize": return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
          default: return match;
        }
      });
    });

    // Apply data type formatting
    if (options.uppercaseDataTypes) {
      const dataTypes = [
        'VARCHAR2', 'VARCHAR', 'CHAR', 'NCHAR', 'NVARCHAR2', 'CLOB', 'NCLOB', 'BLOB',
        'NUMBER', 'INTEGER', 'INT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL', 'DOUBLE',
        'DATE', 'TIMESTAMP', 'INTERVAL', 'RAW', 'LONG', 'ROWID', 'UROWID'
      ];
      dataTypes.forEach(type => {
        const regex = new RegExp(`\\b${type}\\b`, 'gi');
        formatted = formatted.replace(regex, type.toUpperCase());
      });
    }

    // Handle spacing with special formatting
    if (options.addSpacing) {
      formatted = formatted
        .replace(/\s*=\s*/g, '             = ')
        .replace(/\s*>=\s*/g, '  > = ')
        .replace(/\s*<=\s*/g, '  < = ')
        .replace(/\s*<>\s*/g, ' <> ')
        .replace(/\s*!=\s*/g, ' != ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*<\s*/g, ' < ')
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*-\s*/g, ' - ')
        .replace(/\s*\*\s*/g, ' * ')
        .replace(/\s*\/\s*/g, ' / ');
    }

    // Add line breaks for major SQL keywords
    if (options.addLineBreaks) {
      // Replace major keywords with line breaks
      formatted = formatted.replace(/\bSELECT\b/gi, '\nSELECT');
      formatted = formatted.replace(/\bFROM\b/gi, '\nFROM');
      formatted = formatted.replace(/\bWHERE\b/gi, '\nWHERE');
      formatted = formatted.replace(/\bGROUP BY\b/gi, '\nGROUP BY');
      formatted = formatted.replace(/\bHAVING\b/gi, '\nHAVING');
      formatted = formatted.replace(/\bORDER BY\b/gi, '\nORDER BY');
      formatted = formatted.replace(/\bLIMIT\b/gi, '\nLIMIT');
      formatted = formatted.replace(/\bLEFT JOIN\b/gi, '\n LEFT JOIN');
      formatted = formatted.replace(/\bRIGHT JOIN\b/gi, '\n RIGHT JOIN');
      formatted = formatted.replace(/\bINNER JOIN\b/gi, '\n INNER JOIN');
      formatted = formatted.replace(/\bFULL JOIN\b/gi, '\n FULL JOIN');
      formatted = formatted.replace(/\bJOIN\b(?!\s+(ALL|SELECT))/gi, '\n JOIN');
      formatted = formatted.replace(/\bON\b/gi, '\n ON');
      formatted = formatted.replace(/\bAND\b/gi, ' AND');
      formatted = formatted.replace(/\bOR\b/gi, ' OR');
    }

    // Handle comma positioning with special formatting
    switch (options.commaPosition) {
      case "after":
        formatted = formatted.replace(/\s*,\s*/g, ', ');
        break;
      case "before":
        formatted = formatted.replace(/\s*,\s*/g, ' ,');
        break;
      case "line-after":
        formatted = formatted.replace(/,\s*/g, ',\n    ');
        break;
      case "line-before":
        formatted = formatted.replace(/\s*,\s*/g, '\n    ,');
        break;
    }

    // Apply smart indentation with specific patterns
    const indentString = ' '.repeat(options.indentSize);
    const lines = formatted.split('\n').filter(line => line.trim());
    
    formatted = lines.map((line, index) => {
      line = line.trim();
      if (!line) return '';
      
      // Special formatting for SELECT clause
      if (line.match(/^\bSELECT\b/i)) {
        return line;
      }
      
      // Handle column names in SELECT with comma-first style
      if (line.startsWith(',') && options.commaPosition === "line-before") {
        const columnPart = line.substring(1).trim();
        // Check if it has alias
        if (columnPart.includes(' AS ')) {
          const parts = columnPart.split(' AS ');
          const paddedColumn = parts[0].padEnd(28);
          return `    ,${paddedColumn}     ${parts[1]}`;
        } else if (columnPart.includes(' ')) {
          const parts = columnPart.split(' ');
          const paddedColumn = parts[0].padEnd(28);
          return `    ,${paddedColumn}     ${parts.slice(1).join(' ')}`;
        } else {
          return `    ,${columnPart}`;
        }
      }
      
      // Handle FROM clause with table aliases
      if (line.match(/^\bFROM\b/i)) {
        return line.replace(/\bFROM\s+(\w+)\s+(\w+)/i, 'FROM              $1 $2');
      }
      
      // Handle JOIN clauses
      if (line.match(/^\s*(LEFT|RIGHT|INNER|FULL)?\s*JOIN\b/i)) {
        return line.replace(/^\s*(LEFT|RIGHT|INNER|FULL)?\s*JOIN\s+(\w+)\s+(\w+)/i, ' $1 JOIN    $2 $3');
      }
      
      // Handle ON clauses
      if (line.match(/^\bON\b/i)) {
        return line.replace(/^\bON\s+(.+)/i, ' ON                  $1');
      }
      
      // Handle WHERE clause
      if (line.match(/^\bWHERE\b/i)) {
        return line.replace(/^\bWHERE\s+(.+)/i, 'WHERE          $1');
      }
      
      // Handle GROUP BY clause
      if (line.match(/^\bGROUP BY\b/i)) {
        return line.replace(/^\bGROUP BY\s+(.+)/i, 'GROUP BY \n    $1');
      }
      
      // Handle other major keywords
      if (line.match(/^\b(HAVING|ORDER BY|LIMIT)\b/i)) {
        return line;
      }
      
      // Handle continuation lines (AND, OR)
      if (line.match(/^\b(AND|OR)\b/i)) {
        return line;
      }
      
      // Default indentation for other lines
      return `    ${line}`;
    }).join('\n');

    // Apply column alignment for SELECT statements
    if (options.alignColumns && formatted.includes('SELECT')) {
      const lines = formatted.split('\n');
      const alignedLines = [];
      let inSelectClause = false;
      
      lines.forEach(line => {
        if (line.trim().match(/^\bSELECT\b/i)) {
          inSelectClause = true;
          // Handle first SELECT column
          const selectMatch = line.match(/^\bSELECT\s+(.+)/i);
          if (selectMatch) {
            const firstColumn = selectMatch[1];
            if (firstColumn.includes(' AS ')) {
              const parts = firstColumn.split(' AS ');
              const paddedColumn = parts[0].padEnd(28);
              alignedLines.push(`SELECT\n    ${paddedColumn}     ${parts[1]}`);
            } else if (firstColumn.includes(' ')) {
              const parts = firstColumn.split(' ');
              const paddedColumn = parts[0].padEnd(28);
              alignedLines.push(`SELECT\n    ${paddedColumn}     ${parts.slice(1).join(' ')}`);
            } else {
              alignedLines.push(`SELECT\n    ${firstColumn}`);
            }
          } else {
            alignedLines.push(line);
          }
        } else if (line.trim().match(/^\b(FROM|WHERE|GROUP|ORDER|HAVING)\b/i)) {
          inSelectClause = false;
          alignedLines.push(line);
        } else {
          alignedLines.push(line);
        }
      });
      
      formatted = alignedLines.join('\n');
    }

    // Clean up extra spaces if option is enabled
    if (options.removeExtraSpaces) {
      // Only clean up excessive spaces, not our intentional formatting
      formatted = formatted.replace(/   +/g, '   ');
    }

    // Apply formatting style adjustments
    switch (style) {
      case "compact":
        formatted = formatted.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
        break;
      case "expanded":
        // Keep our special formatting in expanded mode
        break;
    }

    return formatted.trim();
  };

  const renderColoredSQL = (sql: string, colors: Record<string, string>) => {
    const keywords = Object.keys(colors);
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    
    const tokens = [];
    let lastIndex = 0;
    let match;
    
    while ((match = keywordPattern.exec(sql)) !== null) {
      // Add text before the keyword
      if (match.index > lastIndex) {
        tokens.push(sql.slice(lastIndex, match.index));
      }
      
      // Add the colored keyword
      const keyword = match[1].toLowerCase();
      const color = colors[keyword] || '#000000';
      tokens.push(
        <span key={`${keyword}-${match.index}`} style={{ color, fontWeight: 'bold' }}>
          {match[1]}
        </span>
      );
      
      lastIndex = match.index + match[1].length;
    }
    
    // Add remaining text
    if (lastIndex < sql.length) {
      tokens.push(sql.slice(lastIndex));
    }
    
    return tokens;
  };

  const validateSQL = (sql: string): { isValid: boolean; error?: string } => {
    if (!sql.trim()) {
      return { isValid: false, error: "SQL query is empty" };
    }

    // Basic SQL validation
    const sqlUpper = sql.toUpperCase();
    const requiredKeywords = ['SELECT', 'FROM', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    const hasRequiredKeyword = requiredKeywords.some(keyword => sqlUpper.includes(keyword));
    
    if (!hasRequiredKeyword) {
      return { isValid: false, error: "SQL query must contain at least one SQL command" };
    }

    // Check for balanced parentheses
    const openParens = (sql.match(/\(/g) || []).length;
    const closeParens = (sql.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      return { isValid: false, error: "Unbalanced parentheses in SQL query" };
    }

    // Check for basic syntax issues
    if (sql.includes(';;')) {
      return { isValid: false, error: "Multiple semicolons found" };
    }

    return { isValid: true };
  };

  const handleFormatSQL = async () => {
    if (!inputSQL.trim()) {
      toast({
        title: "오류",
        description: "포맷팅할 SQL을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    setIsFormatting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const formatted = formatSQL(inputSQL, formattingStyle, formattingOptions);
      setFormattedSQL(formatted);
      
      const validation = validateSQL(formatted);
      setValidationResult(validation);
      
      toast({
        title: "성공",
        description: "SQL 포맷팅이 완료되었습니다",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "SQL 포맷팅에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
    }
  };

  const handleCopyFormatted = () => {
    if (formattedSQL) {
      navigator.clipboard.writeText(formattedSQL);
      toast({
        title: "Copied",
        description: "Formatted SQL copied to clipboard",
      });
    }
  };

  const handleDownloadSQL = () => {
    if (formattedSQL) {
      const blob = new Blob([formattedSQL], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted_query_${selectedDialect}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "SQL file downloaded successfully",
      });
    }
  };

  const handleLoadSample = () => {
    setInputSQL(SAMPLE_SQL);
    toast({
      title: "Sample Loaded",
      description: "Sample SQL query loaded for formatting",
    });
  };

  const handleClearAll = () => {
    setInputSQL("");
    setFormattedSQL("");
    setValidationResult(null);
    toast({
      title: "내용 지움",
      description: "모든 내용이 지워졌습니다",
    });
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('sqlFormatterSettings', JSON.stringify(formattingOptions));
      setOriginalOptions({ ...formattingOptions });
      setHasUnsavedChanges(false);
      toast({
        title: "설정 저장됨",
        description: "SQL 포맷팅 설정이 저장되었습니다",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "설정 저장 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      keywordCase: "upper",
      commaPosition: "line-before", 
      indentSize: 4,
      addLineBreaks: true,
      addSpacing: true,
      colorKeywords: true,
      keywordColors: KEYWORD_COLORS,
      maxLineLength: 80,
      alignColumns: true,
      uppercaseDataTypes: true,
      removeExtraSpaces: false,
      formatSubqueries: true,
      standardizeOperators: true,
      normalizeKeywords: true,
      optimizeJoins: true,
      quoteStyle: "single",
      caseConversion: "none",
      unifiedKeywordColor: "#0066cc",
    };
    setFormattingOptions(defaultSettings);
    toast({
      title: "설정 초기화",
      description: "모든 설정이 기본값으로 초기화되었습니다",
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_STYLES[0]) => {
    setFormattingOptions(prev => ({
      ...prev,
      ...preset.settings,
    }));
    toast({
      title: "프리셋 적용",
      description: `${preset.name} 설정이 적용되었습니다`,
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">SQL 포맷팅 설정</h1>
              <p className="text-muted-foreground">
                시스템 전체에 적용될 SQL 포맷팅 규칙을 설정하고 관리하세요.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  저장되지 않은 변경사항
                </Badge>
              )}
              <Dialog open={isFormatterDialogOpen} onOpenChange={setIsFormatterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    SQL 포맷팅 테스트
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>SQL 포맷팅 테스트</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">테스트할 SQL 입력</Label>
                      <Textarea
                        placeholder="포맷팅을 테스트할 SQL 쿼리를 입력하세요..."
                        value={inputSQL}
                        onChange={(e) => setInputSQL(e.target.value)}
                        className="min-h-[200px] font-mono text-sm mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleFormatSQL}
                        disabled={isFormatting}
                      >
                        {isFormatting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            포맷팅 중...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            포맷팅 적용
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleLoadSample}>
                        <Upload className="w-4 h-4 mr-2" />
                        샘플 로드
                      </Button>
                      <Button variant="outline" onClick={handleClearAll}>
                        지우기
                      </Button>
                    </div>
                    {formattedSQL && (
                      <div>
                        <Label className="text-sm font-medium">포맷된 결과</Label>
                        <div className="bg-muted/20 p-4 rounded-lg max-h-[400px] overflow-y-auto mt-1">
                          {formattingOptions.colorKeywords ? (
                            <div className="font-mono text-sm whitespace-pre-wrap">
                              {renderColoredSQL(formattedSQL, formattingOptions.keywordColors)}
                            </div>
                          ) : (
                            <SQLCodeBlock
                              sqlQuery={formattedSQL}
                              dialect={selectedDialect}
                            />
                          )}
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <Button variant="outline" onClick={handleCopyFormatted} size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            복사
                          </Button>
                          <Button variant="outline" onClick={handleDownloadSQL} size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Settings */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>기본 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">예약어 대소문자</Label>
                    <Select 
                      value={formattingOptions.keywordCase} 
                      onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, keywordCase: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KEYWORD_CASE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">콤마 위치</Label>
                    <Select 
                      value={formattingOptions.commaPosition} 
                      onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, commaPosition: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMA_POSITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">들여쓰기: {formattingOptions.indentSize}칸</Label>
                    <Slider
                      value={[formattingOptions.indentSize]}
                      onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, indentSize: value[0] }))}
                      min={1}
                      max={8}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">대/소문자 변환</Label>
                    <Select 
                      value={formattingOptions.caseConversion} 
                      onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, caseConversion: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">변환 없음</SelectItem>
                        <SelectItem value="upper">전체 대문자</SelectItem>
                        <SelectItem value="lower">전체 소문자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">최대 줄 길이: {formattingOptions.maxLineLength}자</Label>
                    <Slider
                      value={[formattingOptions.maxLineLength]}
                      onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, maxLineLength: value[0] }))}
                      min={40}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.addLineBreaks}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, addLineBreaks: checked }))}
                    />
                    <Label className="text-sm">줄바꿈</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.addSpacing}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, addSpacing: checked }))}
                    />
                    <Label className="text-sm">띄어쓰기</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.alignColumns}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, alignColumns: checked }))}
                    />
                    <Label className="text-sm">컬럼 정렬</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.uppercaseDataTypes}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, uppercaseDataTypes: checked }))}
                    />
                    <Label className="text-sm">데이터 타입</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.removeExtraSpaces}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, removeExtraSpaces: checked }))}
                    />
                    <Label className="text-sm">공백 정리</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formattingOptions.optimizeJoins}
                      onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, optimizeJoins: checked }))}
                    />
                    <Label className="text-sm">조인 최적화</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>색상 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">예약어 색상 표시</Label>
                  <Switch
                    checked={formattingOptions.colorKeywords}
                    onCheckedChange={(checked) => setFormattingOptions(prev => ({ ...prev, colorKeywords: checked }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">통일 키워드 색상</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="color"
                      value={formattingOptions.unifiedKeywordColor}
                      onChange={(e) => setFormattingOptions(prev => ({ ...prev, unifiedKeywordColor: e.target.value }))}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formattingOptions.unifiedKeywordColor}
                    </span>
                  </div>
                </div>
                
                {formattingOptions.colorKeywords && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">색상 테마</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_THEMES.map((theme) => (
                        <Button
                          key={theme.name}
                          variant="outline"
                          size="sm"
                          onClick={() => setFormattingOptions(prev => ({ ...prev, keywordColors: theme.colors }))}
                          className="justify-start"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.select }}></div>
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.from }}></div>
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.where }}></div>
                            </div>
                            <span>{theme.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>빠른 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_STYLES.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code2 className="w-5 h-5" />
                  <span>실시간 미리보기</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                  {formattingOptions.colorKeywords ? (
                    <div className="font-mono text-sm whitespace-pre-wrap">
                      {renderColoredSQL(formatSQL(SAMPLE_SQL_PREVIEW, formattingStyle, formattingOptions), formattingOptions.keywordColors)}
                    </div>
                  ) : (
                    <SQLCodeBlock
                      sqlQuery={SAMPLE_SQL_PREVIEW}
                      dialect={selectedDialect}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">설정 관리</h3>
                <p className="text-sm text-muted-foreground">
                  변경사항을 저장하거나 기본값으로 초기화하세요.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleResetSettings}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  초기화
                </Button>
                <Button onClick={handleSaveSettings} disabled={!hasUnsavedChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  설정 저장
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}