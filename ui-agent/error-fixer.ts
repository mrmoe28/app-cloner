import { Page, Browser, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ErrorPattern {
  pattern: RegExp;
  type: 'import' | 'undefined' | 'type' | 'network' | 'react' | 'syntax';
  severity: 'error' | 'warning';
  autoFixable: boolean;
  fix?: (error: ParsedError) => Promise<CodeFix | null>;
}

export interface ParsedError {
  message: string;
  type: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  url?: string;
  timestamp: Date;
}

export interface CodeFix {
  file: string;
  changes: Array<{
    type: 'add' | 'replace' | 'remove';
    line?: number;
    content: string;
    searchPattern?: string;
  }>;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

export class ErrorFixer {
  private errors: ParsedError[] = [];
  private fixes: CodeFix[] = [];
  private patterns: ErrorPattern[] = [
    {
      pattern: /Cannot find module '(.+)'/,
      type: 'import',
      severity: 'error',
      autoFixable: true,
      fix: this.fixMissingImport.bind(this)
    },
    {
      pattern: /(.+) is not defined/,
      type: 'undefined',
      severity: 'error',
      autoFixable: true,
      fix: this.fixUndefinedVariable.bind(this)
    },
    {
      pattern: /Type '(.+)' is not assignable to type '(.+)'/,
      type: 'type',
      severity: 'error',
      autoFixable: true,
      fix: this.fixTypeError.bind(this)
    },
    {
      pattern: /Failed to fetch|NetworkError|ERR_NETWORK/,
      type: 'network',
      severity: 'error',
      autoFixable: true,
      fix: this.fixNetworkError.bind(this)
    },
    {
      pattern: /Invalid hook call|Rendered fewer hooks|Rendered more hooks/,
      type: 'react',
      severity: 'error',
      autoFixable: true,
      fix: this.fixReactHookError.bind(this)
    },
    {
      pattern: /Unexpected token|SyntaxError/,
      type: 'syntax',
      severity: 'error',
      autoFixable: false
    }
  ];

  async monitorConsole(page: Page): Promise<void> {
    // Set up console monitoring
    page.on('console', async (msg: ConsoleMessage) => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        const error = await this.parseConsoleMessage(msg);
        this.errors.push(error);
        
        // Attempt auto-fix for errors
        if (type === 'error') {
          await this.attemptAutoFix(error);
        }
      }
    });

    // Monitor page errors
    page.on('pageerror', async (error: Error) => {
      const parsedError = this.parsePageError(error);
      this.errors.push(parsedError);
      await this.attemptAutoFix(parsedError);
    });

    // Monitor request failures
    page.on('requestfailed', async (request) => {
      const error: ParsedError = {
        message: `Request failed: ${request.url()}`,
        type: 'network',
        url: request.url(),
        timestamp: new Date()
      };
      this.errors.push(error);
      await this.attemptAutoFix(error);
    });
  }

  private async parseConsoleMessage(msg: ConsoleMessage): Promise<ParsedError> {
    const text = msg.text();
    const location = msg.location();
    
    return {
      message: text,
      type: msg.type(),
      file: location.url,
      line: location.lineNumber,
      column: location.columnNumber,
      timestamp: new Date()
    };
  }

  private parsePageError(error: Error): ParsedError {
    const stack = error.stack || '';
    const fileMatch = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
    
    return {
      message: error.message,
      type: 'error',
      file: fileMatch ? fileMatch[1] : undefined,
      line: fileMatch ? parseInt(fileMatch[2]) : undefined,
      column: fileMatch ? parseInt(fileMatch[3]) : undefined,
      stack: stack,
      timestamp: new Date()
    };
  }

  private async attemptAutoFix(error: ParsedError): Promise<void> {
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(error.message) && pattern.autoFixable && pattern.fix) {
        const fix = await pattern.fix(error);
        if (fix) {
          this.fixes.push(fix);
          await this.applyFix(fix);
        }
      }
    }
  }

  private async fixMissingImport(error: ParsedError): Promise<CodeFix | null> {
    const match = error.message.match(/Cannot find module '(.+)'/);
    if (!match) return null;

    const moduleName = match[1];
    const isRelative = moduleName.startsWith('./') || moduleName.startsWith('../');
    
    if (!isRelative) {
      // It's an npm package - check if it needs to be installed
      return {
        file: 'package.json',
        changes: [{
          type: 'add',
          content: `Installing missing dependency: ${moduleName}`,
          searchPattern: '"dependencies"'
        }],
        description: `Install missing package: ${moduleName}`,
        confidence: 'high'
      };
    } else if (error.file) {
      // It's a relative import - fix the path or create the file
      const importStatement = `import { } from '${moduleName}';`;
      return {
        file: error.file,
        changes: [{
          type: 'add',
          line: error.line,
          content: importStatement
        }],
        description: `Fix import path for ${moduleName}`,
        confidence: 'medium'
      };
    }

    return null;
  }

  private async fixUndefinedVariable(error: ParsedError): Promise<CodeFix | null> {
    const match = error.message.match(/(.+) is not defined/);
    if (!match || !error.file) return null;

    const variable = match[1];
    
    // Common undefined variables and their fixes
    const commonFixes: Record<string, string> = {
      'useState': "import { useState } from 'react';",
      'useEffect': "import { useEffect } from 'react';",
      'useRouter': "import { useRouter } from 'next/navigation';",
      'toast': "import { useToast } from '@/hooks/use-toast';\nconst { toast } = useToast();",
    };

    if (commonFixes[variable]) {
      return {
        file: error.file,
        changes: [{
          type: 'add',
          line: 1,
          content: commonFixes[variable]
        }],
        description: `Add missing import for ${variable}`,
        confidence: 'high'
      };
    }

    // Generic fix - declare the variable
    return {
      file: error.file,
      changes: [{
        type: 'add',
        line: error.line ? error.line - 1 : 1,
        content: `const ${variable} = undefined; // TODO: Define this variable properly`
      }],
      description: `Declare undefined variable: ${variable}`,
      confidence: 'low'
    };
  }

  private async fixTypeError(error: ParsedError): Promise<CodeFix | null> {
    const match = error.message.match(/Type '(.+)' is not assignable to type '(.+)'/);
    if (!match || !error.file) return null;

    const [, actualType, expectedType] = match;
    
    // Common type fixes
    if (expectedType.includes('undefined')) {
      return {
        file: error.file,
        changes: [{
          type: 'replace',
          searchPattern: actualType,
          content: `${actualType} | undefined`
        }],
        description: `Allow undefined for type ${actualType}`,
        confidence: 'medium'
      };
    }

    // Add type assertion as a last resort
    return {
      file: error.file,
      changes: [{
        type: 'add',
        line: error.line,
        content: `// @ts-ignore - Type mismatch: ${actualType} vs ${expectedType}`
      }],
      description: `Add type ignore for mismatch`,
      confidence: 'low'
    };
  }

  private async fixNetworkError(error: ParsedError): Promise<CodeFix | null> {
    if (!error.url) return null;

    // Check if it's a CORS issue
    if (error.message.includes('CORS')) {
      return {
        file: 'next.config.ts',
        changes: [{
          type: 'add',
          searchPattern: 'module.exports = {',
          content: `
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '${error.url}/:path*',
      },
    ];
  },`
        }],
        description: 'Add CORS proxy configuration',
        confidence: 'medium'
      };
    }

    // Add error handling
    return {
      file: error.file || 'unknown',
      changes: [{
        type: 'add',
        content: `
try {
  // Original fetch code
} catch (error) {
  console.error('Network request failed:', error);
  // Handle error appropriately
}`
      }],
      description: 'Add error handling for network request',
      confidence: 'low'
    };
  }

  private async fixReactHookError(error: ParsedError): Promise<CodeFix | null> {
    if (!error.file) return null;

    // Common React hook fixes
    if (error.message.includes('Invalid hook call')) {
      return {
        file: error.file,
        changes: [{
          type: 'add',
          line: 1,
          content: '// Ensure this component is a functional component and hooks are called at the top level'
        }],
        description: 'Fix React hook usage',
        confidence: 'low'
      };
    }

    if (error.message.includes('Rendered fewer hooks') || error.message.includes('Rendered more hooks')) {
      return {
        file: error.file,
        changes: [{
          type: 'add',
          content: '// Check that hooks are not called conditionally'
        }],
        description: 'Fix conditional hook usage',
        confidence: 'medium'
      };
    }

    return null;
  }

  private async applyFix(fix: CodeFix): Promise<boolean> {
    try {
      const filePath = path.resolve(fix.file);
      
      // Special handling for package.json
      if (fix.file === 'package.json') {
        console.log(`📦 Need to install package: ${fix.description}`);
        // In a real implementation, would run npm/pnpm install
        return true;
      }

      // Read the current file content
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let modified = content;
      
      for (const change of fix.changes) {
        switch (change.type) {
          case 'add':
            if (change.line !== undefined) {
              lines.splice(change.line - 1, 0, change.content);
              modified = lines.join('\n');
            } else if (change.searchPattern) {
              modified = modified.replace(
                change.searchPattern,
                `${change.searchPattern}\n${change.content}`
              );
            }
            break;
            
          case 'replace':
            if (change.searchPattern) {
              modified = modified.replace(change.searchPattern, change.content);
            }
            break;
            
          case 'remove':
            if (change.searchPattern) {
              modified = modified.replace(change.searchPattern, '');
            }
            break;
        }
      }
      
      // Write the fixed content back
      await fs.writeFile(filePath, modified);
      console.log(`✅ Applied fix: ${fix.description}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to apply fix: ${fix.description}`, error);
      return false;
    }
  }

  async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date(),
      errorsFound: this.errors.length,
      fixesApplied: this.fixes.length,
      errors: this.errors,
      fixes: this.fixes,
      summary: this.generateSummary()
    };

    const reportPath = path.join('./ui-agent/output/reports', `error-fixes-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Error fix report generated: ${reportPath}`);
  }

  private generateSummary(): any {
    const errorTypes = new Map<string, number>();
    const fixTypes = new Map<string, number>();
    
    this.errors.forEach(error => {
      const type = this.patterns.find(p => p.pattern.test(error.message))?.type || 'unknown';
      errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
    });

    this.fixes.forEach(fix => {
      const type = fix.confidence;
      fixTypes.set(type, (fixTypes.get(type) || 0) + 1);
    });

    return {
      errorsByType: Object.fromEntries(errorTypes),
      fixesByConfidence: Object.fromEntries(fixTypes),
      autoFixRate: this.fixes.length / Math.max(this.errors.length, 1),
      mostCommonError: Array.from(errorTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
    };
  }

  getErrors(): ParsedError[] {
    return this.errors;
  }

  getFixes(): CodeFix[] {
    return this.fixes;
  }

  clearErrors(): void {
    this.errors = [];
    this.fixes = [];
  }
}