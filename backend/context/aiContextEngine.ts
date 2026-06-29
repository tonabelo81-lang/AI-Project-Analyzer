import fs from "fs";
import path from "path";
import { ScanResult } from "../models";

export class AiContextEngine {
  private rootDir: string;
  private contextDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.contextDir = path.join(this.rootDir, ".ai-context");
  }

  public updateContext(data: ScanResult): void {
    try {
      if (!fs.existsSync(this.contextDir)) {
        fs.mkdirSync(this.contextDir, { recursive: true });
      }

      // 1. project_manifest.json
      const manifest = {
        name: "AI Project Analyzer",
        healthScore: data.stats.healthScore,
        techDebtScore: data.stats.technicalDebtScore,
        architectureStyle: data.architecture,
        scannedFiles: data.stats.totalFiles,
        totalLOC: data.stats.totalLOC,
        technologies: data.technologies,
        lastAnalyzed: new Date().toISOString()
      };
      fs.writeFileSync(path.join(this.contextDir, "project_manifest.json"), JSON.stringify(manifest, null, 2));

      // 2. symbol_index.json
      fs.writeFileSync(path.join(this.contextDir, "symbol_index.json"), JSON.stringify(data.symbols, null, 2));

      // 3. dependency_graph.json
      fs.writeFileSync(path.join(this.contextDir, "dependency_graph.json"), JSON.stringify(data.graph, null, 2));

      // 4. roadmap.json
      const roadmap = {
        prioritizedIssues: data.security.map(s => ({
          file: s.file,
          line: s.line,
          issue: s.type,
          severity: s.severity,
          recommendation: s.recommendation
        })),
        suggestions: [
          "1. Mitigate any exposed critical hardcoded secret tokens immediately.",
          "2. Decouple circular references within modules to avoid compile/runtime delays.",
          "3. Improve files with low maintainability indices by breaking down complex code chains."
        ]
      };
      fs.writeFileSync(path.join(this.contextDir, "roadmap.json"), JSON.stringify(roadmap, null, 2));

    } catch (err) {
      console.error("Error creating AI Context Engine outputs:", err);
    }
  }
}
