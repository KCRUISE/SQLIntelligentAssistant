import React from 'react';

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
  caseConversion: 'none' | 'upper' | 'lower';
  unifiedKeywordColor: string;
}

const DEFAULT_KEYWORD_COLORS = {
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

const DEFAULT_FORMATTING_OPTIONS: FormattingOptions = {
  keywordCase: "upper",
  commaPosition: "line-before",
  indentSize: 4,
  addLineBreaks: true,
  addSpacing: true,
  colorKeywords: true,
  keywordColors: DEFAULT_KEYWORD_COLORS,
  maxLineLength: 80,
  alignColumns: true,
  uppercaseDataTypes: true,
  removeExtraSpaces: false,
  formatSubqueries: true,
  standardizeOperators: true,
  normalizeKeywords: true,
  optimizeJoins: true,
  quoteStyle: "single",
  caseConversion: 'none',
  unifiedKeywordColor: '#0066cc'
};

// Get formatting options from localStorage or use defaults
export function getFormattingOptions(): FormattingOptions {
  try {
    const saved = localStorage.getItem('sqlFormattingOptions');
    if (saved) {
      return { ...DEFAULT_FORMATTING_OPTIONS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load formatting options from localStorage:', error);
  }
  return DEFAULT_FORMATTING_OPTIONS;
}

// Save formatting options to localStorage
export function saveFormattingOptions(options: FormattingOptions): void {
  try {
    localStorage.setItem('sqlFormattingOptions', JSON.stringify(options));
  } catch (error) {
    console.warn('Failed to save formatting options to localStorage:', error);
  }
}

export function formatSQL(sql: string, style: string = "standard", options?: FormattingOptions): string {
  const formattingOptions = options || getFormattingOptions();
  
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
      switch (formattingOptions.keywordCase) {
        case "upper": return keyword.toUpperCase();
        case "lower": return keyword.toLowerCase();
        case "capitalize": return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
        default: return match;
      }
    });
  });

  // Apply data type formatting
  if (formattingOptions.uppercaseDataTypes) {
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
  if (formattingOptions.addSpacing) {
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
  if (formattingOptions.addLineBreaks) {
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
  switch (formattingOptions.commaPosition) {
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

  // Apply comprehensive indentation system
  const indentString = ' '.repeat(formattingOptions.indentSize);
  const doubleIndent = ' '.repeat(formattingOptions.indentSize * 2);
  const lines = formatted.split('\n').filter(line => line.trim());
  
  formatted = lines.map((line, index) => {
    line = line.trim();
    if (!line) return '';
    
    // Main SQL clauses - no indentation
    if (line.match(/^\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|FETCH|WITH|UNION|INTERSECT|EXCEPT)\b/i)) {
      return line;
    }
    
    // Comma-first column formatting with proper indentation
    if (line.startsWith(',')) {
      const columnPart = line.substring(1).trim();
      if (columnPart.includes(' AS ')) {
        const parts = columnPart.split(' AS ');
        const paddedColumn = parts[0].padEnd(28);
        return `${indentString},${paddedColumn}     ${parts[1]}`;
      } else if (columnPart.includes(' ')) {
        const parts = columnPart.split(' ');
        const paddedColumn = parts[0].padEnd(28);
        return `${indentString},${paddedColumn}     ${parts.slice(1).join(' ')}`;
      } else {
        return `${indentString},${columnPart}`;
      }
    }
    
    // JOIN clauses - single indent
    if (line.match(/^\b(LEFT|RIGHT|INNER|OUTER|FULL|CROSS)?\s*JOIN\b/i)) {
      return indentString + line;
    }
    
    // ON clauses for JOINs - double indent
    if (line.match(/^\bON\b/i)) {
      return doubleIndent + line;
    }
    
    // AND/OR in conditions - single indent
    if (line.match(/^\b(AND|OR)\b/i)) {
      return indentString + line;
    }
    
    // Subqueries - add indent
    if (line.includes('(SELECT') || line.includes('( SELECT')) {
      return indentString + line;
    }
    
    // First column in SELECT (no comma) - add indent
    if (index > 0 && !line.match(/^\b(SELECT|FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|FETCH|WITH|UNION|INTERSECT|EXCEPT|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|JOIN|ON|AND|OR)\b/i)) {
      return indentString + line;
    }
    
    return line;
  }).join('\n');

  // Apply column alignment for SELECT statements
  if (formattingOptions.alignColumns && formatted.includes('SELECT')) {
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
  if (formattingOptions.removeExtraSpaces) {
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

  // Apply overall case conversion
  if (options.caseConversion === 'upper') {
    formatted = formatted.toUpperCase();
  } else if (options.caseConversion === 'lower') {
    formatted = formatted.toLowerCase();
  }

  return formatted.trim();
}

export function renderColoredSQL(sql: string, keywordColors: Record<string, string>): React.JSX.Element {
  if (!sql) return React.createElement('span');

  const formattingOptions = getFormattingOptions();
  const keywords = Object.keys(keywordColors);
  let parts = [sql];
  
  keywords.forEach(keyword => {
    const newParts: (string | React.JSX.Element)[] = [];
    
    parts.forEach((part, partIndex) => {
      if (typeof part === 'string') {
        const regex = new RegExp(`\\b${keyword.toUpperCase()}\\b`, 'gi');
        const splits = part.split(regex);
        const matches = part.match(regex) || [];
        
        for (let i = 0; i < splits.length; i++) {
          if (splits[i]) newParts.push(splits[i]);
          if (matches[i]) {
            newParts.push(
              React.createElement('span', {
                key: `${keyword}-${partIndex}-${i}`,
                style: { color: formattingOptions.unifiedKeywordColor || keywordColors[keyword] }
              }, matches[i])
            );
          }
        }
      } else {
        newParts.push(part);
      }
    });
    
    parts = newParts;
  });

  return React.createElement(React.Fragment, null, 
    parts.map((part, index) => 
      typeof part === 'string' 
        ? React.createElement('span', { key: index }, part) 
        : part
    )
  );
}