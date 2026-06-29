export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  size?: number;
}

export interface CodeFileMetadata {
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
  complexity: number;
  maintainability: number;
  deadCodeCandidate: string[];
}

export interface SecurityIssue {
  file: string;
  line: number;
  type: string;
  severity: "critical" | "warning" | "info";
  description: string;
}

export interface TodoItem {
  file: string;
  line: number;
  type: string;
  content: string;
  priority: "high" | "medium" | "low";
}

export interface ApiEndpoint {
  path: string;
  method: string;
  line: number;
  file: string;
}

export interface DatabaseModel {
  type: string;
  details: string;
  file: string;
}

export interface SymbolReference {
  name: string;
  type: string;
  file: string;
}

export interface XrefInfo {
  definedIn: string;
  type: string;
  usedBy: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  data: {
    label: string;
    path: string;
    extension: string;
    loc: number;
    maintainability: number;
    complexity: number;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label: string;
  style?: { stroke: string };
}

export interface ScanResult {
  success: boolean;
  stats: {
    totalFiles: number;
    totalFolders: number;
    totalLOC: number;
    totalComments: number;
    totalBlank: number;
    totalClasses: number;
    totalFunctions: number;
    totalInterfaces: number;
    totalTodos: number;
    deadCodeCount: number;
    circularDependencies: number;
    securityFindings: number;
    technicalDebtScore: number;
    healthScore: number;
    avgMaintainability: number;
  };
  tree: FileNode[];
  files: CodeFileMetadata[];
  symbols: SymbolReference[];
  circularCycles: string[][];
  security: SecurityIssue[];
  todos: TodoItem[];
  technologies: string[];
  apis: ApiEndpoint[];
  databases: DatabaseModel[];
  xref: { [key: string]: XrefInfo };
  architecture: string;
  targetDir?: string;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface TrendData {
  commit: string;
  date: string;
  healthScore: number;
  technicalDebtScore: number;
  totalLOC: number;
  todosCount: number;
  securityFindings: number;
  complexity: number;
}
