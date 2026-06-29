import fs from "fs";
import path from "path";
import crypto from "crypto";
import { FileNode } from "../models";

export class ProjectScanner {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public scan(): { tree: FileNode[]; flatFiles: { path: string; size: number; checksum: string; language: string; isBinary: boolean }[] } {
    const flatFiles: { path: string; size: number; checksum: string; language: string; isBinary: boolean }[] = [];
    const tree = this.traverse(this.rootDir, flatFiles);
    return { tree, flatFiles };
  }

  private traverse(
    currentDir: string,
    flatFiles: { path: string; size: number; checksum: string; language: string; isBinary: boolean }[]
  ): FileNode[] {
    const result: FileNode[] = [];
    if (!fs.existsSync(currentDir)) return [];

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      // Exclude system/temporary/large non-code directories
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

      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(this.rootDir, fullPath).replace(/\\/g, "/");

      if (stat.isDirectory()) {
        result.push({
          name: item,
          path: relativePath,
          type: "directory",
          children: this.traverse(fullPath, flatFiles),
        });
      } else {
        const ext = path.extname(item).toLowerCase();
        const isBinary = this.checkIsBinary(fullPath, ext);
        const language = this.detectLanguage(ext);
        const size = stat.size;

        // Calculate simple checksum
        let checksum = "";
        try {
          if (!isBinary) {
            const data = fs.readFileSync(fullPath);
            checksum = crypto.createHash("md5").update(data).digest("hex");
          }
        } catch (err) {
          // ignore
        }

        flatFiles.push({
          path: relativePath,
          size,
          checksum,
          language,
          isBinary,
        });

        result.push({
          name: item,
          path: relativePath,
          type: "file",
          size,
          checksum,
          isBinary,
          language,
          encoding: "UTF-8",
        });
      }
    }

    return result.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private checkIsBinary(filePath: string, ext: string): boolean {
    const binaryExtensions = [
      ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".tar", ".gz",
      ".mp3", ".mp4", ".wav", ".woff", ".woff2", ".ttf", ".eot", ".bin", ".db"
    ];
    if (binaryExtensions.includes(ext)) return true;

    try {
      const buffer = Buffer.alloc(1024);
      const fd = fs.openSync(filePath, "r");
      const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
      fs.closeSync(fd);

      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0) {
          return true; // Null byte indicates binary
        }
      }
    } catch (err) {
      // ignore
    }
    return false;
  }

  private detectLanguage(ext: string): string {
    const languageMap: { [key: string]: string } = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript (React)",
      ".js": "JavaScript",
      ".jsx": "JavaScript (React)",
      ".py": "Python",
      ".java": "Java",
      ".go": "Go",
      ".rs": "Rust",
      ".php": "PHP",
      ".cs": "C#",
      ".cpp": "C++",
      ".h": "C/C++ Header",
      ".html": "HTML",
      ".css": "CSS",
      ".sql": "SQL",
      ".json": "JSON",
      ".yaml": "YAML",
      ".yml": "YAML",
      ".toml": "TOML",
      ".xml": "XML",
      ".md": "Markdown",
    };
    return languageMap[ext] || "Unknown";
  }
}
