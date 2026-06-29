import fs from "fs";
import path from "path";
import { CodeFileMetadata, SecurityFinding, TodoItem } from "../models";

export class CodeQualityAnalyzer {
  public static calculateDeadCode(files: CodeFileMetadata[], rootDir: string): string[] {
    const declaredVars: { name: string; file: string }[] = [];
    const allText: string[] = [];

    files.forEach(f => {
      try {
        const content = fs.readFileSync(path.join(rootDir, f.path), "utf-8");
        allText.push(content);

        const lines = content.split(/\r?\n/);
        lines.forEach(line => {
          const trimmed = line.trim();
          const varMatch = trimmed.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*/);
          if (varMatch && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
            declaredVars.push({ name: varMatch[1], file: f.path });
          }
        });
      } catch (err) {
        // ignore
      }
    });

    const deadCandidates: string[] = [];
    const fullProjectText = allText.join("\n");

    declaredVars.forEach(v => {
      const escaped = v.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, "g");
      const matches = fullProjectText.match(regex);
      // If declared once across the codebase, it's unused dead code
      if (matches && matches.length === 1) {
        deadCandidates.push(`${v.file}:${v.name}`);
      }
    });

    return deadCandidates;
  }

  public static estimateTechnicalDebt(
    securityIssues: SecurityFinding[],
    circularCyclesCount: number,
    todosCount: number,
    deadCodeCount: number
  ): { hours: number; debtScore: number } {
    let hours = 0;
    hours += securityIssues.filter(s => s.severity === "critical").length * 3.5;
    hours += securityIssues.filter(s => s.severity === "warning").length * 1.5;
    hours += circularCyclesCount * 4;
    hours += deadCodeCount * 0.75;
    hours += todosCount * 0.25;

    const debtScore = Math.min(100, Math.round((hours / 40) * 100));
    return { hours, debtScore };
  }

  public static calculateHealthScore(
    securityIssues: SecurityFinding[],
    circularCyclesCount: number,
    todosCount: number,
    deadCodeCount: number
  ): number {
    let score = 100;
    score -= securityIssues.filter(s => s.severity === "critical").length * 8;
    score -= securityIssues.filter(s => s.severity === "warning").length * 3;
    score -= circularCyclesCount * 10;
    score -= deadCodeCount * 0.5;
    score -= todosCount * 0.2;
    return Math.max(12, Math.round(score));
  }
}
