import fs from "fs";
import { CodeSymbol, SecurityFinding, TodoItem } from "../models";

export class AstParser {
  public static parseFile(
    filePath: string,
    content: string,
    language: string
  ): {
    symbols: CodeSymbol[];
    todos: TodoItem[];
    securityIssues: SecurityFinding[];
    complexity: number;
    maintainability: number;
    comments: number;
    blankLines: number;
    imports: string[];
    loc: number;
  } {
    const lines = content.split(/\r?\n/);
    const loc = lines.length;
    let comments = 0;
    let blankLines = 0;
    let complexity = 1;

    const symbols: CodeSymbol[] = [];
    const todos: TodoItem[] = [];
    const securityIssues: SecurityFinding[] = [];
    const imports: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNum = index + 1;

      if (!trimmed) {
        blankLines++;
        return;
      }

      const isComment =
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("#");

      if (isComment) {
        comments++;
      }

      // Check imports
      if (!isComment) {
        const importMatch = trimmed.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          imports.push(importMatch[1]);
        } else {
          const pythonImport = trimmed.match(/import\s+([a-zA-Z0-9_]+)/);
          if (pythonImport) {
            imports.push(pythonImport[1]);
          }
        }
      }

      // 1. Symbol extraction matching (Classes, Interfaces, Functions, Methods)
      if (!isComment) {
        // Classes
        const classMatch = trimmed.match(/(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
        if (classMatch) {
          symbols.push({
            id: `${filePath}-class-${classMatch[1]}-${lineNum}`,
            name: classMatch[1],
            kind: "Class",
            language,
            file: filePath,
            line: lineNum,
            column: line.indexOf(classMatch[1]),
            referenceCount: 0,
            hash: `csh-${classMatch[1]}-${lineNum}`,
            visibility: trimmed.includes("private") ? "private" : "public",
          });
        }

        // Interfaces
        const interfaceMatch = trimmed.match(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)/);
        if (interfaceMatch) {
          symbols.push({
            id: `${filePath}-interface-${interfaceMatch[1]}-${lineNum}`,
            name: interfaceMatch[1],
            kind: "Interface",
            language,
            file: filePath,
            line: lineNum,
            column: line.indexOf(interfaceMatch[1]),
            referenceCount: 0,
            hash: `ish-${interfaceMatch[1]}-${lineNum}`,
            visibility: "public",
          });
        }

        // Functions
        const fnMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);
        if (fnMatch) {
          symbols.push({
            id: `${filePath}-fn-${fnMatch[1]}-${lineNum}`,
            name: fnMatch[1],
            kind: "Function",
            language,
            file: filePath,
            line: lineNum,
            column: line.indexOf(fnMatch[1]),
            referenceCount: 0,
            hash: `fsh-${fnMatch[1]}-${lineNum}`,
            visibility: "public",
          });
        } else {
          const arrowFnMatch = trimmed.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
          if (arrowFnMatch) {
            symbols.push({
              id: `${filePath}-arrow-${arrowFnMatch[1]}-${lineNum}`,
              name: arrowFnMatch[1],
              kind: "Function",
              language,
              file: filePath,
              line: lineNum,
              column: line.indexOf(arrowFnMatch[1]),
              referenceCount: 0,
              hash: `ash-${arrowFnMatch[1]}-${lineNum}`,
              visibility: "public",
            });
          }
        }
      }

      // 2. TODO Analysis
      const todoMatch = line.match(/\b(TODO|FIXME|BUG|HACK|NOTE|XXX)\b:?\s*(.*)/i);
      if (todoMatch) {
        const type = todoMatch[1].toUpperCase();
        const contentText = todoMatch[2].trim() || "Unresolved task identifier";
        const priority = (type === "FIXME" || type === "BUG") ? "high" : (type === "TODO" ? "medium" : "low");
        todos.push({
          type,
          content: contentText,
          line: lineNum,
          file: filePath,
          priority,
        });
      }

      // 3. Security Findings
      if (!isComment) {
        // Hardcoded secrets
        const secretRegex = /(password|passwd|secret|token|api_key|apikey|private_key|auth_token|client_secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-\+]{10,})['"]/i;
        const secretMatch = trimmed.match(secretRegex);
        if (secretMatch) {
          const val = secretMatch[2].toLowerCase();
          if (!val.includes("placeholder") && !val.includes("secret") && !val.includes("my_") && !val.includes("token")) {
            securityIssues.push({
              type: "Hardcoded Secret Token",
              severity: "critical",
              description: `A hardcoded credential/token assigned to variable "${secretMatch[1]}". Potentially exposes APIs.`,
              line: lineNum,
              file: filePath,
              owasp: "A02:2021-Cryptographic Failures",
              cwe: "CWE-798",
              cvss: 8.9,
              confidence: "high",
              evidence: trimmed,
              recommendation: "Extract raw tokens and keys to standard .env configuration values.",
              estimatedFixTime: "5 mins",
            });
          }
        }

        // eval() / command injection risks
        if (trimmed.includes("eval(")) {
          securityIssues.push({
            type: "Unsafe Code Evaluation",
            severity: "critical",
            description: "Usage of eval() detected, allowing execution of dynamic strings and posing server injection threats.",
            line: lineNum,
            file: filePath,
            owasp: "A03:2021-Injection",
            cwe: "CWE-95",
            cvss: 9.8,
            confidence: "high",
            evidence: trimmed,
            recommendation: "Eliminate dynamic runtime evaluation blocks completely with standard static operations.",
            estimatedFixTime: "30 mins",
          });
        }
      }

      // 4. Complexity estimation
      const complexityTriggers = ["if ", "if(", "for ", "for(", "while ", "while(", "catch ", "&&", "||", "case "];
      complexityTriggers.forEach(trig => {
        if (trimmed.includes(trig) && !isComment) {
          complexity++;
        }
      });
    });

    // 5. Maintainability rating estimation
    const volumePenalty = Math.min(25, loc / 50);
    const complexityPenalty = Math.min(45, (complexity - 1) * 3);
    const commentBonus = Math.min(15, (comments / (loc || 1)) * 100);
    const maintainability = Math.max(10, Math.min(100, Math.round(100 - volumePenalty - complexityPenalty + commentBonus)));

    return {
      symbols,
      todos,
      securityIssues,
      complexity,
      maintainability,
      comments,
      blankLines,
      imports,
      loc,
    };
  }
}
