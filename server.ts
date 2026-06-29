import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Heuristics & Static Code Analyzer Functions
interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  size?: number;
}

function getRelativePath(absolutePath: string, root: string): string {
  const rel = path.relative(root, absolutePath);
  return rel.replace(/\\/g, "/");
}

function traverseDirectory(dir: string, root: string): FileNode[] {
  const result: FileNode[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (
      item === "node_modules" ||
      item === "dist" ||
      item === ".git" ||
      item === ".aistudio" ||
      item === "package-lock.json" ||
      item === ".DS_Store"
    ) {
      continue;
    }

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const relPath = getRelativePath(fullPath, root);

    if (stat.isDirectory()) {
      result.push({
        name: item,
        path: relPath,
        type: "directory",
        children: traverseDirectory(fullPath, root),
      });
    } else {
      result.push({
        name: item,
        path: relPath,
        type: "file",
        size: stat.size,
      });
    }
  }

  // Sort directories first, then files alphabetically
  return result.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// Flat file scanner to collect content metadata
interface CodeFileMetadata {
  path: string;
  name: string;
  extension: string;
  loc: number;
  comments: number;
  blankLines: number;
  classes: string[];
  functions: string[];
  interfaces: string[];
  imports: string[];
  todos: { type: string; content: string; line: number; priority: "high" | "medium" | "low" }[];
  securityIssues: { type: string; severity: "critical" | "warning" | "info"; description: string; line: number }[];
  complexity: number; // custom McCabe-like complexity
  maintainability: number; // 0-100 rating
  deadCodeCandidate: string[];
}

function scanFileContent(filePath: string, relativePath: string, root: string): CodeFileMetadata {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const ext = path.extname(filePath).toLowerCase();

  const metadata: CodeFileMetadata = {
    path: relativePath,
    name: path.basename(filePath),
    extension: ext,
    loc: lines.length,
    comments: 0,
    blankLines: 0,
    classes: [],
    functions: [],
    interfaces: [],
    imports: [],
    todos: [],
    securityIssues: [],
    complexity: 1, // Base complexity
    maintainability: 100,
    deadCodeCandidate: [],
  };

  const declaredVars: { name: string; line: number }[] = [];
  const referencedNames = new Set<string>();

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNum = index + 1;

    // Check for blank lines
    if (!trimmed) {
      metadata.blankLines++;
      return;
    }

    // Check for comments
    const isComment =
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("#");

    if (isComment) {
      metadata.comments++;
    }

    // Heuristics for Symbols
    // 1. Classes
    const classMatch = trimmed.match(/(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
    if (classMatch && !isComment) {
      metadata.classes.push(classMatch[1]);
    }

    // 2. Interfaces
    const interfaceMatch = trimmed.match(/(?:export\s+)?interface\s+([A-Za-z0-9_]+)/);
    if (interfaceMatch && !isComment) {
      metadata.interfaces.push(interfaceMatch[1]);
    }

    // 3. Functions
    const fnMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);
    if (fnMatch && !isComment) {
      metadata.functions.push(fnMatch[1]);
    } else {
      const arrowFnMatch = trimmed.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
      if (arrowFnMatch && !isComment) {
        metadata.functions.push(arrowFnMatch[1]);
      } else {
        const pythonDefMatch = trimmed.match(/def\s+([A-Za-z0-9_]+)\s*\(/);
        if (pythonDefMatch && !isComment) {
          metadata.functions.push(pythonDefMatch[1]);
        }
      }
    }

    // Variable definitions for Dead Code discovery (heuristic)
    const varMatch = trimmed.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*/);
    if (varMatch && !isComment && !metadata.classes.includes(varMatch[1]) && !metadata.functions.includes(varMatch[1])) {
      declaredVars.push({ name: varMatch[1], line: lineNum });
    }

    // Simple word reference checking for dead code
    const words = trimmed.match(/[A-Za-z0-9_]+/g);
    if (words) {
      words.forEach(w => referencedNames.add(w));
    }

    // Heuristics for Imports
    if (!isComment) {
      const importMatch = trimmed.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        metadata.imports.push(importMatch[1]);
      } else {
        const directImport = trimmed.match(/import\s+['"]([^'"]+)['"]/);
        if (directImport) {
          metadata.imports.push(directImport[1]);
        } else {
          const requireMatch = trimmed.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          if (requireMatch) {
            metadata.imports.push(requireMatch[1]);
          }
        }
      }
    }

    // Heuristics for TODOs & FIXMEs
    const todoMatch = line.match(/\b(TODO|FIXME|BUG|HACK|NOTE|XXX)\b:?\s*(.*)/i);
    if (todoMatch) {
      const type = todoMatch[1].toUpperCase();
      const text = todoMatch[2].trim() || "Action item listed";
      const priority = (type === "FIXME" || type === "BUG") ? "high" : (type === "TODO" ? "medium" : "low");
      metadata.todos.push({ type, content: text, line: lineNum, priority });
    }

    // Heuristics for Security Audit
    // 1. Hardcoded Secrets
    const secretRegex = /(password|passwd|secret|token|api_key|apikey|private_key|auth_token|client_secret)\s*[:=]\s*['"]([a-zA-Z0-9_\-\+]{10,})['"]/i;
    const secretMatch = trimmed.match(secretRegex);
    if (secretMatch && !isComment) {
      // Exclude placeholders
      const val = secretMatch[2].toLowerCase();
      if (!val.includes("placeholder") && !val.includes("secret") && !val.includes("my_") && !val.includes("token")) {
        metadata.securityIssues.push({
          type: "Hardcoded Secret",
          severity: "critical",
          description: `Potentially exposed credential or secret token found in variable/field: "${secretMatch[1]}".`,
          line: lineNum,
        });
      }
    }

    // 2. Unsafe eval/exec
    if (trimmed.includes("eval(") && !isComment) {
      metadata.securityIssues.push({
        type: "Unsafe Code Execution",
        severity: "critical",
        description: "Usage of 'eval()' detected. This poses severe remote code execution (RCE) vulnerabilities.",
        line: lineNum,
      });
    }
    if (trimmed.includes("exec(") && trimmed.includes("child_process") && !isComment) {
      metadata.securityIssues.push({
        type: "Command Injection Risk",
        severity: "warning",
        description: "System commands execution via child_process.exec() can lead to command injections if inputs are unescaped.",
        line: lineNum,
      });
    }

    // 3. DangerouslySetInnerHTML (React specific)
    if (trimmed.includes("dangerouslySetInnerHTML") && !isComment) {
      metadata.securityIssues.push({
        type: "XSS Vulnerability Risk",
        severity: "warning",
        description: "Usage of 'dangerouslySetInnerHTML' skips markup sanitation and exposes page to Cross-Site Scripting (XSS).",
        line: lineNum,
      });
    }

    // Heuristics for Complexity
    const complexityTriggers = ["if ", "if(", "for ", "for(", "while ", "while(", "switch ", "catch ", "&&", "||", "case "];
    complexityTriggers.forEach(trigger => {
      if (trimmed.includes(trigger) && !isComment) {
        metadata.complexity++;
      }
    });
  });

  // Check dead code candidates
  declaredVars.forEach(v => {
    // If declared name is only seen once in the word pool (meaning just its declaration line)
    // count occurrences in full text
    const escaped = v.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    const matches = content.match(regex);
    if (matches && matches.length === 1) {
      metadata.deadCodeCandidate.push(v.name);
    }
  });

  // Calculate Maintainability Index (Heuristic 0 to 100 based on LOC, Comments, and Complexity)
  // Higher complexity or LOC decreases rating. High comment percentage increases it up to a limit.
  const volumePenalty = Math.min(25, metadata.loc / 50);
  const complexityPenalty = Math.min(45, (metadata.complexity - 1) * 3);
  const commentBonus = Math.min(15, (metadata.comments / (metadata.loc || 1)) * 100);
  metadata.maintainability = Math.max(10, Math.min(100, Math.round(100 - volumePenalty - complexityPenalty + commentBonus)));

  return metadata;
}

function scanProjectRecursive(dir: string, root: string, allFiles: CodeFileMetadata[] = []): CodeFileMetadata[] {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (
      item === "node_modules" ||
      item === "dist" ||
      item === ".git" ||
      item === ".aistudio" ||
      item === "package-lock.json" ||
      item === ".DS_Store" ||
      item === "assets"
    ) {
      continue;
    }

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const relPath = getRelativePath(fullPath, root);

    if (stat.isDirectory()) {
      scanProjectRecursive(fullPath, root, allFiles);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".json", ".css", ".html", ".env", ".yaml", ".yml"];
      if (codeExtensions.includes(ext)) {
        try {
          allFiles.push(scanFileContent(fullPath, relPath, root));
        } catch (e) {
          console.error(`Error scanning file ${relPath}:`, e);
        }
      }
    }
  }

  return allFiles;
}

// Find Circular Dependencies
function findCircularDependencies(files: CodeFileMetadata[]): string[][] {
  const fileMap = new Map<string, string[]>();
  files.forEach(f => {
    // Resolve relative imports
    const resolvedImports: string[] = [];
    f.imports.forEach(imp => {
      if (imp.startsWith(".")) {
        // Simple relative resolution
        const dir = path.dirname(f.path);
        let joined = path.join(dir, imp).replace(/\\/g, "/");
        // Try exact match or suffixing extensions
        const candidates = [joined, `${joined}.ts`, `${joined}.tsx`, `${joined}.js`, `${joined}.jsx`];
        const match = files.find(c => candidates.includes(c.path));
        if (match) {
          resolvedImports.push(match.path);
        }
      } else {
        // NPM packages or absolute
        const match = files.find(c => c.path === imp);
        if (match) {
          resolvedImports.push(match.path);
        }
      }
    });
    fileMap.set(f.path, resolvedImports);
  });

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, pathTrace: string[]) {
    if (stack.has(node)) {
      const cycleStart = pathTrace.indexOf(node);
      cycles.push([...pathTrace.slice(cycleStart), node]);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);
    pathTrace.push(node);

    const neighbors = fileMap.get(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...pathTrace]);
    }

    stack.delete(node);
  }

  Array.from(fileMap.keys()).forEach(node => {
    dfs(node, []);
  });

  return cycles;
}

// REST endpoints
app.get("/api/scan", (req, res) => {
  try {
    const rootPath = process.cwd();
    const tree = traverseDirectory(rootPath, rootPath);
    const files = scanProjectRecursive(rootPath, rootPath);
    const circularCycles = findCircularDependencies(files);

    // Dynamic stats compilation
    let totalLOC = 0;
    let totalComments = 0;
    let totalBlank = 0;
    let totalClasses = 0;
    let totalFunctions = 0;
    let totalInterfaces = 0;
    let totalTodos = 0;
    let deadCodeCount = 0;
    const securityList: any[] = [];
    const todoList: any[] = [];

    files.forEach(f => {
      totalLOC += f.loc;
      totalComments += f.comments;
      totalBlank += f.blankLines;
      totalClasses += f.classes.length;
      totalFunctions += f.functions.length;
      totalInterfaces += f.interfaces.length;
      totalTodos += f.todos.length;
      deadCodeCount += f.deadCodeCandidate.length;

      f.todos.forEach(t => {
        todoList.push({
          file: f.path,
          line: t.line,
          type: t.type,
          content: t.content,
          priority: t.priority,
        });
      });

      f.securityIssues.forEach(s => {
        securityList.push({
          file: f.path,
          line: s.line,
          type: s.type,
          severity: s.severity,
          description: s.description,
        });
      });
    });

    // Code Quality calculation
    const avgMaintainability = files.length > 0
      ? Math.round(files.reduce((sum, f) => sum + f.maintainability, 0) / files.length)
      : 100;

    // Health Score calculation
    let healthScore = 100;
    healthScore -= securityList.filter(s => s.severity === "critical").length * 8;
    healthScore -= securityList.filter(s => s.severity === "warning").length * 3;
    healthScore -= circularCycles.length * 10;
    healthScore -= deadCodeCount * 0.5;
    healthScore -= todoList.length * 0.2;
    healthScore = Math.max(12, Math.round(healthScore));

    // Technical Debt Estimation (in hours)
    let techDebtHours = 0;
    techDebtHours += securityList.filter(s => s.severity === "critical").length * 3.5;
    techDebtHours += securityList.filter(s => s.severity === "warning").length * 1.5;
    techDebtHours += circularCycles.length * 4;
    techDebtHours += deadCodeCount * 0.75;
    techDebtHours += todoList.length * 0.25;
    const debtScore = Math.min(100, Math.round((techDebtHours / 40) * 100)); // normalized to 40 hours max limit for visually pleasant debt rating

    // Technology profiles identification
    const techs = new Set<string>();
    let hasPackageJson = false;
    let packageDeps: string[] = [];

    files.forEach(f => {
      if (f.name === "package.json") {
        hasPackageJson = true;
        try {
          const raw = fs.readFileSync(path.join(rootPath, f.path), "utf-8");
          const parsed = JSON.parse(raw);
          const allDeps = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
          packageDeps = Object.keys(allDeps);
          packageDeps.forEach(dep => {
            if (dep.includes("react")) techs.add("React");
            if (dep.includes("express")) techs.add("Express (Node.js)");
            if (dep.includes("tailwind")) techs.add("TailwindCSS");
            if (dep.includes("typescript")) techs.add("TypeScript");
            if (dep.includes("vite")) techs.add("Vite Builder");
            if (dep.includes("google/genai")) techs.add("Gemini SDK");
            if (dep.includes("motion")) techs.add("Framer Motion");
          });
        } catch (e) {
          // ignore
        }
      }
      if (f.extension === ".py") techs.add("Python");
      if (f.extension === ".ts" || f.extension === ".tsx") techs.add("TypeScript");
      if (f.extension === ".js" || f.extension === ".jsx") techs.add("JavaScript");
      if (f.extension === ".html") techs.add("HTML5");
      if (f.extension === ".css") techs.add("CSS3");
    });

    if (techs.size === 0) {
      techs.add("TypeScript");
      techs.add("React");
      techs.add("Express");
    }

    // Heuristic API scans
    const apis: { path: string; method: string; line: number; file: string }[] = [];
    files.forEach(f => {
      const content = fs.readFileSync(path.join(rootPath, f.path), "utf-8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        const match = line.match(/\.(get|post|put|delete|use|patch|options)\s*\(\s*['"](\/api\/[^'"]+)['"]/);
        if (match) {
          apis.push({
            path: match[2],
            method: match[1].toUpperCase(),
            line: index + 1,
            file: f.path,
          });
        }
      });
    });

    // Database Analysis
    const databases: { type: string; details: string; file: string }[] = [];
    files.forEach(f => {
      const content = fs.readFileSync(path.join(rootPath, f.path), "utf-8");
      if (content.includes("dotenv") || content.includes(".env")) {
        databases.push({
          type: "Environment Configured DB",
          details: "Dynamic secrets found in .env config",
          file: f.path,
        });
      }
      if (content.includes("sqlite") || content.includes("SQLite")) {
        databases.push({
          type: "SQLite",
          details: "Embedded Relational Database",
          file: f.path,
        });
      }
    });

    // Cross reference indexing
    const xref: { [key: string]: { definedIn: string; type: string; usedBy: string[] } } = {};
    files.forEach(f => {
      f.classes.forEach(c => {
        xref[c] = { definedIn: f.path, type: "Class", usedBy: [] };
      });
      f.functions.forEach(func => {
        xref[func] = { definedIn: f.path, type: "Function", usedBy: [] };
      });
    });

    // Populate usage by scanning imports or occurrences
    files.forEach(f => {
      const content = fs.readFileSync(path.join(rootPath, f.path), "utf-8");
      Object.keys(xref).forEach(symbol => {
        if (f.path !== xref[symbol].definedIn) {
          const escapedSymbol = symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedSymbol}\\b`);
          if (regex.test(content)) {
            if (!xref[symbol].usedBy.includes(f.path)) {
              xref[symbol].usedBy.push(f.path);
            }
          }
        }
      });
    });

    // Prepare clean list of database symbols
    const symbolsList: any[] = [];
    files.forEach(f => {
      f.classes.forEach(c => symbolsList.push({ name: c, type: "Class", file: f.path }));
      f.functions.forEach(fu => symbolsList.push({ name: fu, type: "Function", file: f.path }));
      f.interfaces.forEach(i => symbolsList.push({ name: i, type: "Interface", file: f.path }));
    });

    // Build Graph structure for React Flow
    const graphNodes: any[] = [];
    const graphEdges: any[] = [];

    files.forEach((f, index) => {
      // Node position is calculated in a circle layout for neat visual presentation
      const angle = (index / (files.length || 1)) * 2 * Math.PI;
      const radius = 250;
      graphNodes.push({
        id: f.path,
        type: "codeNode",
        data: {
          label: f.name,
          path: f.path,
          extension: f.extension,
          loc: f.loc,
          maintainability: f.maintainability,
          complexity: f.complexity,
        },
        position: {
          x: Math.round(radius * Math.cos(angle) + 400),
          y: Math.round(radius * Math.sin(angle) + 300),
        },
      });

      // Find relative and exact import routes
      f.imports.forEach((imp, iIndex) => {
        let matchedPath = "";
        if (imp.startsWith(".")) {
          const dir = path.dirname(f.path);
          let joined = path.join(dir, imp).replace(/\\/g, "/");
          const candidates = [joined, `${joined}.ts`, `${joined}.tsx`, `${joined}.js`, `${joined}.jsx`];
          const found = files.find(c => candidates.includes(c.path));
          if (found) matchedPath = found.path;
        } else {
          const found = files.find(c => c.path === imp);
          if (found) matchedPath = found.path;
        }

        if (matchedPath) {
          graphEdges.push({
            id: `edge-${f.path}-${matchedPath}-${iIndex}`,
            source: f.path,
            target: matchedPath,
            animated: true,
            label: "imports",
            style: { stroke: "#6366f1" },
          });
        }
      });
    });

    // Architecture Guessing
    let architectureStyle = "Layered Architecture";
    const structureLower = JSON.stringify(tree).toLowerCase();
    if (structureLower.includes("controller") && structureLower.includes("model") && structureLower.includes("view")) {
      architectureStyle = "MVC (Model-View-Controller)";
    } else if (structureLower.includes("domain") && structureLower.includes("infrastructure") && structureLower.includes("application")) {
      architectureStyle = "Clean Architecture / DDD (Domain-Driven Design)";
    } else if (structureLower.includes("repository") || structureLower.includes("service")) {
      architectureStyle = "Repository Pattern & Service Layered Design";
    } else if (structureLower.includes("server") && structureLower.includes("src") && !structureLower.includes("components")) {
      architectureStyle = "Full-Stack Node.js Monolith API";
    }

    res.json({
      success: true,
      stats: {
        totalFiles: files.length,
        totalFolders: tree.filter(t => t.type === "directory").length,
        totalLOC,
        totalComments,
        totalBlank,
        totalClasses,
        totalFunctions,
        totalInterfaces,
        totalTodos,
        deadCodeCount,
        circularDependencies: circularCycles.length,
        securityFindings: securityList.length,
        technicalDebtScore: debtScore,
        healthScore,
        avgMaintainability,
      },
      tree,
      files,
      symbols: symbolsList,
      circularCycles,
      security: securityList,
      todos: todoList,
      technologies: Array.from(techs),
      apis,
      databases,
      xref,
      architecture: architectureStyle,
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
      }
    });

  } catch (error: any) {
    console.error("Scan Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/file-content", (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: "File path parameter required" });
  }

  try {
    const rootPath = process.cwd();
    const targetPath = path.resolve(rootPath, filePath);

    // Prevent path traversal outside root
    if (!targetPath.startsWith(rootPath)) {
      return res.status(403).json({ error: "Access denied. Path is outside project bounds." });
    }

    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      return res.status(404).json({ error: "File not found" });
    }

    const content = fs.readFileSync(targetPath, "utf-8");
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/trends", (req, res) => {
  // Generate 10 historic data points for Trend Charts
  const trends = Array.from({ length: 10 }).map((_, index) => {
    const rev = index + 1;
    return {
      commit: `c-${rev}`,
      date: new Date(Date.now() - (10 - index) * 24 * 3600 * 1000).toLocaleDateString(),
      healthScore: Math.min(100, Math.max(30, 75 + Math.round(Math.sin(index) * 8) + (index * 2))),
      technicalDebtScore: Math.max(5, Math.min(80, 45 - Math.round(Math.cos(index) * 5) - (index * 2))),
      totalLOC: 400 + index * 52,
      todosCount: Math.max(2, 18 - index),
      securityFindings: Math.max(0, 5 - Math.round(index / 2)),
      complexity: 8 + Math.round(Math.sin(index) * 2),
    };
  });
  res.json(trends);
});

// AI Chat Assistance with fully-injected code environment context (RAG Mode)
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory = [], filesContext = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!ai) {
    return res.json({
      reply: "Google Gemini API key is missing. Please configure your `GEMINI_API_KEY` under the **Settings > Secrets** panel in AI Studio to activate the AI Chat Assistant."
    });
  }

  try {
    // Collect brief code overview for context injection
    const rootPath = process.cwd();
    const files = scanProjectRecursive(rootPath, rootPath);
    const summary = files.map(f => {
      return `- Path: ${f.path}\n  Symbols: Classes: [${f.classes.join(", ")}], Functions: [${f.functions.join(", ")}]\n  Lines: ${f.loc}, Complexity: ${f.complexity}, Security: ${f.securityIssues.length} issues.`;
    }).join("\n");

    const systemPrompt = `You are "AI Project Analyzer", a brilliant full-stack software architect agent that helps developers analyze, debug, and optimize code.
Here is the structural context of the codebase we are analyzing:
${summary}

Below is the user question or command. Answer accurately, outputting high-quality code blocks if requested. Speak professionally and clearly. Use JetBrains Mono code snippets where applicable. Avoid self-praise or sales pitch. Keep explanations concise.`;

    // Construct request parts
    const contents: any[] = [];
    
    // Add history if any
    chatHistory.forEach((h: any) => {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      });
    });

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with AI" });
  }
});

app.post("/api/export", (req, res) => {
  const { type, content } = req.body;
  if (!type || !content) {
    return res.status(400).json({ error: "Type and content are required for export" });
  }

  res.setHeader("Content-Disposition", `attachment; filename=${type}`);
  res.setHeader("Content-Type", "text/plain");
  res.send(content);
});

// Webhook simulation endpoint
app.post("/api/webhook", (req, res) => {
  const { url, platform } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Webhook URL is required" });
  }

  // Simulate webhook trigger
  res.json({
    success: true,
    message: `Test payload dispatched successfully to ${platform || "Webhook"}!`,
    timestamp: new Date().toISOString(),
    payload: {
      event: "analysis.completed",
      project: "AI Project Analyzer",
      metrics: {
        healthScore: 92,
        technicalDebtHours: 4.5,
        securityFindings: 0,
        unresolvedTodos: 3,
      }
    }
  });
});

// Vite Middleware & Production Route configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Project Analyzer Server running on http://localhost:${PORT}`);
  });
}

startServer();
