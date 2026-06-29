import path from "path";
import { CodeFileMetadata } from "../models";

export class DependencyGraph {
  public static findCircularDependencies(files: CodeFileMetadata[]): string[][] {
    const fileMap = new Map<string, string[]>();

    files.forEach(f => {
      const resolvedImports: string[] = [];
      f.imports.forEach(imp => {
        if (imp.startsWith(".")) {
          const dir = path.dirname(f.path);
          const joined = path.join(dir, imp).replace(/\\/g, "/");
          const candidates = [joined, `${joined}.ts`, `${joined}.tsx`, `${joined}.js`, `${joined}.jsx`];
          const found = files.find(c => candidates.includes(c.path));
          if (found) {
            resolvedImports.push(found.path);
          }
        } else {
          const found = files.find(c => c.path === imp);
          if (found) {
            resolvedImports.push(found.path);
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
}
