export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  size?: number;
  checksum?: string;
  encoding?: string;
  isBinary?: boolean;
  language?: string;
}

export interface CodeSymbol {
  id: string;
  name: string;
  kind: "Class" | "Function" | "Method" | "Interface" | "Enum" | "Variable" | "Constant" | "Module";
  language: string;
  file: string;
  line: number;
  column: number;
  parent?: string;
  signature?: string;
  visibility?: "public" | "private" | "protected";
  referenceCount: number;
  hash: string;
}

export interface SecurityFinding {
  type: string;
  severity: "critical" | "warning" | "info";
  description: string;
  line: number;
  file: string;
  owasp?: string;
  cwe?: string;
  cvss?: number;
  confidence?: "high" | "medium" | "low";
  evidence?: string;
  recommendation?: string;
  estimatedFixTime?: string;
}

export interface TodoItem {
  type: string;
  content: string;
  line: number;
  file: string;
  priority: "high" | "medium" | "low";
}

export interface CodeFileMetadata {
  path: string;
  name: string;
  extension: string;
  loc: number;
  comments: number;
  blankLines: number;
  symbols: CodeSymbol[];
  imports: string[];
  todos: TodoItem[];
  securityIssues: SecurityFinding[];
  complexity: number;
  maintainability: number;
  deadCodeCandidate: string[];
  checksum: string;
  isBinary: boolean;
  language: string;
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
  symbols: CodeSymbol[];
  circularCycles: string[][];
  security: SecurityFinding[];
  todos: TodoItem[];
  technologies: string[];
  apis: ApiEndpoint[];
  databases: DatabaseModel[];
  xref: { [key: string]: { definedIn: string; type: string; usedBy: string[] } };
  architecture: string;
  targetDir?: string;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
