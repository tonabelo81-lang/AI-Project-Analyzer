import React, { useState, useEffect, useRef } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Terminal,
  Activity,
  Shield,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Play,
  Search,
  MessageSquare,
  Network,
  GitBranch,
  RefreshCw,
  Cpu,
  Trash2,
  Download,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Send,
  Zap,
  Layers,
  Code,
  Webhook,
  Sliders,
  TrendingUp,
  X,
  Plus
} from "lucide-react";
import Editor from "@monaco-editor/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import {
  ScanResult,
  FileNode,
  CodeFileMetadata,
  TodoItem,
  SecurityIssue,
  TrendData
} from "./types";

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ScanResult | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [selectedFileMeta, setSelectedFileMeta] = useState<CodeFileMetadata | null>(null);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "graph" | "trends" | "devops">("dashboard");
  
  // File Explorer tree states
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({
    "src": true,
  });
  const [treeSearch, setTreeSearch] = useState<string>("");

  // AI Chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    {
      role: "ai",
      content: "Hello! I am your AI Project Analyzer. I've indexed your codebase. Ask me anything about your software architecture, potential bugs, technical debt, or application workflow."
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Editor configuration
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  // DevOps Settings tab
  const [webhookUrl, setWebhookUrl] = useState<string>("https://discord.com/api/webhooks/mock-id");
  const [webhookPlatform, setWebhookPlatform] = useState<string>("Discord");
  const [webhookStatus, setWebhookStatus] = useState<string>("");
  const [thresholdTodo, setThresholdTodo] = useState<number>(10);
  const [thresholdCoverage, setThresholdCoverage] = useState<number>(80);

  // Graph states
  const [graphSearch, setGraphSearch] = useState<string>("");
  const [selectedGraphNode, setSelectedGraphNode] = useState<string | null>(null);

  useEffect(() => {
    fetchScanData();
    fetchTrendData();
  }, []);

  const fetchScanData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scan");
      const json = await res.json();
      if (json.success) {
        setData(json);
        // Default select first file if available
        if (json.files && json.files.length > 0) {
          const mainFile = json.files.find((f: any) => f.path.includes("App.tsx") || f.path.includes("server.ts")) || json.files[0];
          loadFileContent(mainFile.path, json.files);
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const res = await fetch("/api/trends");
      const json = await res.json();
      setTrends(json);
    } catch (err) {
      console.error("Trends fetch error:", err);
    }
  };

  const loadFileContent = async (filePath: string, filesPool = data?.files) => {
    setFileLoading(true);
    setSelectedFilePath(filePath);
    try {
      const res = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
      const json = await res.json();
      if (json.content !== undefined) {
        setSelectedFileContent(json.content);
        if (filesPool) {
          const meta = filesPool.find(f => f.path === filePath);
          setSelectedFileMeta(meta || null);
        }
      }
    } catch (err) {
      console.error("Error loading file:", err);
    } finally {
      setFileLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json();
      setChatMessages(prev => [...prev, { role: "ai", content: json.reply || json.error }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "ai", content: "Error communicating with AI service." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const triggerWebhook = async () => {
    setWebhookStatus("Dispatching integration test...");
    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, platform: webhookPlatform }),
      });
      const json = await res.json();
      if (json.success) {
        setWebhookStatus(`Success: ${json.message}`);
      } else {
        setWebhookStatus(`Failed: ${json.error}`);
      }
    } catch (err) {
      setWebhookStatus("Error connecting to integration pipeline.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const triggerDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Dynamic document generator for exports
  const generateProjectContextJson = () => {
    if (!data) return "{}";
    const context = {
      projectSummary: {
        name: "AI Project Analyzer",
        healthScore: data.stats.healthScore,
        techDebtScore: data.stats.technicalDebtScore,
        estimatedArchitecture: data.architecture,
        scannedFiles: data.stats.totalFiles,
        totalLOC: data.stats.totalLOC,
        technologies: data.technologies,
      },
      apis: data.apis,
      databases: data.databases,
      criticalSecurityFindings: data.security.filter(s => s.severity === "critical"),
      unresolvedTodos: data.todos,
      recommendedRoadmap: [
        "1. Fix any unresolved critical security risks or hardcoded credentials",
        "2. Address circular dependencies detected to improve compiler build speeds",
        "3. Decouple components with low maintainability indices",
        "4. Standardize configuration structures and extract hardcoded options to server variables"
      ],
      aiAgentInstructions: "Prioritize reading /server.ts and /src/App.tsx. Use the integrated express endpoints to persist metadata on backend changes."
    };
    return JSON.stringify(context, null, 2);
  };

  const generateArchitectureReport = () => {
    if (!data) return "No data";
    return `# ARCHITECTURE REPORT: AI Project Analyzer

## System Overview
- **Guessed Architecture Pattern:** ${data.architecture}
- **Language / Framework Stack:** ${data.technologies.join(", ")}
- **Scanned Database Entities:** ${data.databases.length}
- **Exposed Endpoints:** ${data.apis.length}

## Structural Details
The project utilizes a unified, enterprise-grade Next/React/Express full-stack layout that communicates via JSON REST APIs.
Components are designed as pure TypeScript structures with functional React UI interfaces and standard dynamic state loops.

## Dependency Assessment
- Total circular imports detected: ${data.stats.circularDependencies}
- Standard codebase complexity rating: ${data.stats.avgMaintainability}/100 Maintainability

## Recommendations
- Retain strict backend validation separation
- Avoid importing server-side modules directly into client UI contexts
- Modularize routing architectures into dedicated router files
`;
  };

  const generateSecurityReport = () => {
    if (!data) return "No data";
    return `# SECURITY REPORT: AI Project Analyzer

## Executive Summary
- **Overall Health Score:** ${data.stats.healthScore}/100
- **Identified Security Vulnerabilities:** ${data.stats.securityFindings} total findings

## Detected Risk Profiles
${data.security.map((s, idx) => `
### Finding ${idx + 1}: ${s.type} [${s.severity.toUpperCase()}]
- **File:** ${s.file} (Line ${s.line})
- **Description:** ${s.description}
`).join("") || "### No critical vulnerabilities or hardcoded credentials identified during scanning."}

## Mitigation Roadmap
1. Ensure all environment configurations reside strictly in non-committed variables.
2. Ensure input sanitization on standard system execution paths to prevent injection risks.
3. Incorporate automated static analysis checks (SAST) into your GitHub action pipelines.
`;
  };

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map(node => {
      const isExpanded = !!expandedFolders[node.path];
      const hasChildren = node.children && node.children.length > 0;
      const isSelected = selectedFilePath === node.path;

      // Filter based on search query
      if (treeSearch && !node.path.toLowerCase().includes(treeSearch.toLowerCase())) {
        if (!node.children || !node.children.some(c => c.path.toLowerCase().includes(treeSearch.toLowerCase()))) {
          return null;
        }
      }

      return (
        <div key={node.path} className="ml-3 select-none">
          <div
            id={`tree-node-${node.path.replace(/\//g, "-").replace(/\./g, "-")}`}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors ${
              isSelected
                ? "bg-slate-800 text-indigo-400 font-medium"
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
            onClick={() => {
              if (node.type === "directory") {
                toggleFolder(node.path);
              } else {
                loadFileContent(node.path);
              }
            }}
          >
            {node.type === "directory" ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
                <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <FileCode className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
              </>
            )}
            <span className="text-xs truncate">{node.name}</span>
            {node.size && (
              <span className="text-[10px] text-slate-500 ml-auto">
                {Math.round(node.size / 102) / 10} KB
              </span>
            )}
          </div>

          {node.type === "directory" && isExpanded && node.children && (
            <div className="border-l border-slate-800 ml-2 mt-0.5 pl-1">
              {renderFileTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Professional Banner */}
      <header className="border-b border-slate-900 bg-[#0c1220] px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">AI Project Analyzer</h1>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise static code scan, dependency intelligence & context suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-xs">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300">branch:</span>
            <span className="font-semibold text-white">main</span>
          </div>

          <button
            id="btn-trigger-scan"
            onClick={fetchScanData}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-md flex items-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing Source Code..." : "Run Global Scan"}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#090d16] p-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-indigo-500 animate-spin" />
            <Cpu className="w-6 h-6 text-indigo-400 absolute" />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-2 animate-pulse">
            Deep Analyzing Project Source Code
          </h3>
          <p className="text-xs text-slate-400 max-w-md text-center leading-relaxed">
            Parsing symbol files, building token trees, mapping circular dependency routes, estimating architecture patterns, and generating vector database candidates.
          </p>
        </div>
      ) : !data ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#090d16] p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">Analysis Engine Failed</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Could not fetch scan analytics from local server database. Ensure server.ts background engine is operational.
          </p>
          <button
            onClick={fetchScanData}
            className="bg-indigo-600 text-white text-xs px-4 py-2 rounded hover:bg-indigo-500 cursor-pointer"
          >
            Retry Scan Process
          </button>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: VS Code File Explorer */}
          <aside className="w-64 border-r border-slate-900 bg-[#0b0f1a] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-slate-900 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Project Explorer</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                {data.stats.totalFiles} Files
              </span>
            </div>

            <div className="p-2 border-b border-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter project files..."
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-200 font-sans transition-all"
                />
              </div>
            </div>

            <div className="flex-1 py-3 overflow-y-auto custom-scrollbar">
              {renderFileTree(data.tree)}
            </div>

            <div className="p-3 border-t border-slate-900 bg-[#0d1222] text-[11px] text-slate-400">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-300">File Auto-Sync Active</span>
              </div>
              <p className="leading-relaxed text-[10px]">Changes are analyzed incrementally to feed the LLM Context database.</p>
            </div>
          </aside>

          {/* MAIN CONTAINER: tabs & center panels */}
          <main className="flex-1 flex flex-col bg-[#090d16] overflow-y-auto">
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-900 bg-[#0b0f1a] px-4">
              {[
                { id: "dashboard", label: "Dashboard", icon: Activity },
                { id: "explorer", label: "Interactive Code Explorer", icon: Code },
                { id: "graph", label: "Dependency Map", icon: Network },
                { id: "trends", label: "Trend Progression", icon: TrendingUp },
                { id: "devops", label: "CI/CD & DevOps Integration", icon: Sliders },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-trigger-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold tracking-wider transition-colors border-b-2 cursor-pointer ${
                      active
                        ? "border-indigo-500 text-white bg-slate-900/30"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    {/* Top Highlight Info Block */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Health Score Radial Simulator Card */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                          <Activity className="w-32 h-32 text-indigo-500" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Health Score</span>
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                              Stable
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white tracking-tight">{data.stats.healthScore}</span>
                            <span className="text-sm text-slate-400">/ 100</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                              style={{ width: `${data.stats.healthScore}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">Deducted from circular imports and critical safety levels.</p>
                        </div>
                      </div>

                      {/* Technical Debt Score Card */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Debt Index</span>
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                              Low Risk
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-amber-500 tracking-tight">{data.stats.technicalDebtScore}%</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Estimated Resolution:</span>
                            <span className="font-semibold text-white">
                              {Math.round(data.stats.technicalDebtScore * 0.4)} Hours
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${data.stats.technicalDebtScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security Findings Counter */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Flags</span>
                            {data.stats.securityFindings > 0 ? (
                              <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                Requires Review
                              </span>
                            ) : (
                              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                                Secure
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white tracking-tight">{data.stats.securityFindings}</span>
                            <span className="text-xs text-slate-400">Issues Flagged</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                            {data.security.filter(s => s.severity === "critical").length} Critical
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                            {data.security.filter(s => s.severity === "warning").length} Warning
                          </span>
                        </div>
                      </div>

                      {/* Average Maintainability Score */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code Maintainability</span>
                            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                              A- Grade
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-indigo-400 tracking-tight">{data.stats.avgMaintainability}</span>
                            <span className="text-sm text-slate-400">/ 100</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] text-slate-400">Average maintainability index across all compiled modules.</p>
                        </div>
                      </div>
                    </div>

                    {/* Full Breakdown Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: General Stats & Technologies */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-6">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Volume Statistics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#090d16] border border-slate-950 p-3 rounded-lg text-center">
                              <span className="text-[10px] text-slate-400 uppercase">Lines of Code</span>
                              <p className="text-lg font-bold text-white mt-1">{data.stats.totalLOC.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#090d16] border border-slate-950 p-3 rounded-lg text-center">
                              <span className="text-[10px] text-slate-400 uppercase">Classes</span>
                              <p className="text-lg font-bold text-white mt-1">{data.stats.totalClasses}</p>
                            </div>
                            <div className="bg-[#090d16] border border-slate-950 p-3 rounded-lg text-center">
                              <span className="text-[10px] text-slate-400 uppercase">Functions</span>
                              <p className="text-lg font-bold text-white mt-1">{data.stats.totalFunctions}</p>
                            </div>
                            <div className="bg-[#090d16] border border-slate-950 p-3 rounded-lg text-center">
                              <span className="text-[10px] text-slate-400 uppercase">Dead Code Candidates</span>
                              <p className="text-lg font-bold text-rose-400 mt-1">{data.stats.deadCodeCount}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Detected Technologies</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.technologies.map(tech => (
                              <span key={tech} className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-3 py-1 rounded-md font-mono flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">System Architecture</h3>
                          <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold">
                              <Layers className="w-4 h-4" />
                              Estimated Architectural Style
                            </div>
                            <p className="text-xs font-semibold text-white mb-1">{data.architecture}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Evaluated from source code structures, naming patterns, file tree nesting depth, and dependencies setup.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Center: List of TODO / Priorities */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Unresolved TODO / Task priorities</h3>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                            {data.todos.length} Active Tasks
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {data.todos.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                              <p className="text-xs font-medium">Clean slate! No TODOs or unresolved tasks found.</p>
                            </div>
                          ) : (
                            data.todos.map((todo, idx) => (
                              <div
                                key={idx}
                                className="bg-[#090d16] border border-slate-950 p-3 rounded-lg hover:border-slate-800 transition-colors cursor-pointer"
                                onClick={() => loadFileContent(todo.file)}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                    todo.priority === "high"
                                      ? "bg-rose-500/15 text-rose-400"
                                      : todo.priority === "medium"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {todo.type} - {todo.priority.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">Line {todo.line}</span>
                                </div>
                                <p className="text-xs text-slate-300 font-mono line-clamp-2">{todo.content}</p>
                                <p className="text-[10px] text-indigo-400 mt-1 truncate hover:underline">{todo.file}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right: Security & Critical Issues list */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Security Vulnerability Review</h3>
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-mono">
                            {data.security.length} Warnings
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {data.security.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                              <Shield className="w-8 h-8 text-emerald-500 mb-2" />
                              <p className="text-xs font-medium">All clear! No hardcoded secrets or unsafe triggers identified.</p>
                            </div>
                          ) : (
                            data.security.map((sec, idx) => (
                              <div
                                key={idx}
                                className="bg-[#090d16] border border-rose-950/20 p-3 rounded-lg hover:border-rose-900/30 transition-colors cursor-pointer"
                                onClick={() => loadFileContent(sec.file)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                    sec.severity === "critical" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                                  }`}>
                                    {sec.type} - {sec.severity.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">Line {sec.line}</span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sec.description}</p>
                                <p className="text-[10px] text-indigo-400 mt-1.5 truncate hover:underline font-mono">{sec.file}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* APIs & Databases Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-indigo-400" />
                          Discovered Rest API Maps
                        </h3>
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                          {data.apis.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-8">No server-side rest API endpoints detected in this project.</p>
                          ) : (
                            data.apis.map((api, idx) => (
                              <div key={idx} className="bg-[#090d16] p-2.5 border border-slate-950 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                    api.method === "GET" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                                  }`}>
                                    {api.method}
                                  </span>
                                  <span className="text-xs font-mono font-semibold text-white">{api.path}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{api.file}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                          <Network className="w-4 h-4 text-indigo-400" />
                          Database Configuration & Entity Maps
                        </h3>
                        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                          {data.databases.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-8">No configured DB pools or models mapped.</p>
                          ) : (
                            data.databases.map((db, idx) => (
                              <div key={idx} className="bg-[#090d16] p-3 border border-slate-950 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-indigo-400">{db.type}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{db.file}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{db.details}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "explorer" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#0c1220] border border-slate-900 rounded-xl overflow-hidden flex flex-col lg:flex-row h-[600px] shadow-lg">
                      {/* Left: Code Meta Info panel */}
                      <div className="w-full lg:w-80 border-r border-slate-900 flex flex-col bg-[#0b0f1a] overflow-y-auto">
                        <div className="p-4 border-b border-slate-900">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Metadata</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                              {selectedFileMeta?.extension || ".tsx"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{selectedFileMeta?.name || "No file loaded"}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-1">{selectedFilePath || "Select a file from the explorer sidebar"}</p>
                        </div>

                        {selectedFileMeta ? (
                          <div className="p-4 space-y-4 flex-1">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Metrics Analysis</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[#090d16] p-2.5 rounded border border-slate-900">
                                  <span className="text-[9px] text-slate-500 uppercase">Lines of Code</span>
                                  <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedFileMeta.loc}</p>
                                </div>
                                <div className="bg-[#090d16] p-2.5 rounded border border-slate-900">
                                  <span className="text-[9px] text-slate-500 uppercase">Complexity</span>
                                  <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedFileMeta.complexity}</p>
                                </div>
                                <div className="bg-[#090d16] p-2.5 rounded border border-slate-900 col-span-2 flex items-center justify-between">
                                  <span className="text-[9px] text-slate-500 uppercase">Maintainability Index</span>
                                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                    selectedFileMeta.maintainability > 80
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : selectedFileMeta.maintainability > 50
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-rose-500/10 text-rose-400"
                                  }`}>
                                    {selectedFileMeta.maintainability}/100
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Jump to symbols */}
                            {(selectedFileMeta.classes.length > 0 || selectedFileMeta.functions.length > 0) && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Exported Symbols</span>
                                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar font-mono text-[10px]">
                                  {selectedFileMeta.classes.map(c => (
                                    <div key={c} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex items-center gap-1.5 text-indigo-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                      [Class] {c}
                                    </div>
                                  ))}
                                  {selectedFileMeta.functions.map(f => (
                                    <div key={f} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex items-center gap-1.5 text-emerald-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      [Fn] {f}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Circular cycle flags / Import reference counts */}
                            {selectedFileMeta.imports.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Discovered Imports ({selectedFileMeta.imports.length})</span>
                                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                  {selectedFileMeta.imports.map((imp, idx) => (
                                    <div key={idx} className="text-[10px] font-mono text-slate-400 truncate bg-slate-950 p-1 rounded">
                                      {imp}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
                            <FileCode className="w-8 h-8 text-slate-600 mb-2" />
                            No file meta analyzed. Click on a file structure item.
                          </div>
                        )}
                      </div>

                      {/* Right: Monaco Editor instance */}
                      <div className="flex-1 flex flex-col bg-[#080c14] relative">
                        <div className="p-3 border-b border-slate-900 flex items-center justify-between bg-[#0c1220]">
                          <span className="text-[11px] font-mono text-slate-300 font-semibold truncate max-w-[400px]">
                            {selectedFilePath || "Select a source file to edit/view"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditorTheme(prev => prev === "vs-dark" ? "light" : "vs-dark")}
                              className="bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 px-2.5 py-1.5 rounded border border-slate-800 font-medium transition-colors cursor-pointer"
                            >
                              Theme: {editorTheme === "vs-dark" ? "Dark" : "Light"}
                            </button>
                            <button
                              onClick={() => handleCopy(selectedFileContent, "file-contents")}
                              className="bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 px-2.5 py-1.5 rounded border border-slate-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedText === "file-contents" ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy All
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {fileLoading ? (
                          <div className="flex-1 flex items-center justify-center bg-[#080c14]">
                            <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin" />
                          </div>
                        ) : (
                          <div className="flex-1 min-h-0">
                            <Editor
                              height="100%"
                              theme={editorTheme}
                              language={
                                selectedFilePath.endsWith(".py")
                                  ? "python"
                                  : selectedFilePath.endsWith(".json")
                                  ? "json"
                                  : selectedFilePath.endsWith(".css")
                                  ? "css"
                                  : "typescript"
                              }
                              value={selectedFileContent || `// Click on any file in the left Explorer sidebar to display its source code and symbols here.`}
                              options={{
                                readOnly: true,
                                fontSize: 12,
                                fontFamily: "JetBrains Mono, Menlo, monospace",
                                minimap: { enabled: true },
                                scrollBeyondLastLine: false,
                                lineNumbers: "on",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "graph" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dynamic Interactive Dependency Map</h3>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Calculated statically by analyzing import statements. Visualizes source relationships, modular weights, and coupling boundaries.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3 border border-slate-950 bg-[#090d16] rounded-xl h-[450px] relative overflow-hidden flex items-center justify-center">
                          {/* Lightweight SVG Directed Graph view */}
                          <svg className="w-full h-full" style={{ background: "#060911" }}>
                            <defs>
                              <marker
                                id="arrow"
                                viewBox="0 0 10 10"
                                refX="18"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                              >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                              </marker>
                            </defs>

                            {/* Render connection edges */}
                            {data.graph.edges.map((edge) => {
                              const sourceNode = data.graph.nodes.find(n => n.id === edge.source);
                              const targetNode = data.graph.nodes.find(n => n.id === edge.target);

                              if (!sourceNode || !targetNode) return null;

                              const isHighlighted =
                                selectedGraphNode === edge.source || selectedGraphNode === edge.target;

                              return (
                                <line
                                  key={edge.id}
                                  x1={sourceNode.position.x - 100}
                                  y1={sourceNode.position.y - 100}
                                  x2={targetNode.position.x - 100}
                                  y2={targetNode.position.y - 100}
                                  stroke={isHighlighted ? "#818cf8" : "#1e293b"}
                                  strokeWidth={isHighlighted ? 2.5 : 1}
                                  strokeDasharray={edge.animated ? "4 4" : "0"}
                                  markerEnd="url(#arrow)"
                                />
                              );
                            })}

                            {/* Render nodes */}
                            {data.graph.nodes.map((node) => {
                              const isSelected = selectedGraphNode === node.id;
                              // Highlight matching search results
                              const matchesSearch =
                                graphSearch && node.data.label.toLowerCase().includes(graphSearch.toLowerCase());

                              return (
                                <g
                                  key={node.id}
                                  transform={`translate(${node.position.x - 100}, ${node.position.y - 100})`}
                                  className="cursor-pointer"
                                  onClick={() => setSelectedGraphNode(node.id)}
                                >
                                  <circle
                                    r={isSelected ? 18 : matchesSearch ? 16 : 12}
                                    fill={isSelected ? "#4f46e5" : matchesSearch ? "#e11d48" : "#0f172a"}
                                    stroke={isSelected ? "#a5b4fc" : matchesSearch ? "#fda4af" : "#334155"}
                                    strokeWidth={isSelected || matchesSearch ? 3 : 1.5}
                                    className="transition-all"
                                  />
                                  <text
                                    y={25}
                                    textAnchor="middle"
                                    fill="#f8fafc"
                                    fontSize="10"
                                    fontFamily="monospace"
                                    className="font-semibold pointer-events-none drop-shadow"
                                  >
                                    {node.data.label}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>

                          {/* Quick Tooltip overlay inside the canvas */}
                          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-[10px] space-y-1">
                            <p className="font-semibold text-slate-300 uppercase">Interactive Navigation</p>
                            <p className="text-slate-400">● Click on a node to trace individual file linkages.</p>
                            <p className="text-slate-400">● Hovered edge triggers blue tracing vectors.</p>
                          </div>
                        </div>

                        {/* Interactive Graph Details card */}
                        <div className="bg-[#0b0f1a] border border-slate-950 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="relative mb-3">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                              <input
                                type="text"
                                placeholder="Search map nodes..."
                                value={graphSearch}
                                onChange={(e) => setGraphSearch(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-850 rounded text-[11px] pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-200"
                              />
                            </div>

                            {selectedGraphNode ? (
                              <div className="space-y-3">
                                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Selected Module</span>
                                  <button
                                    onClick={() => setSelectedGraphNode(null)}
                                    className="text-slate-500 hover:text-white text-[10px]"
                                  >
                                    Clear Trace
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-bold text-white font-mono break-all">{selectedGraphNode}</h4>
                                  <p className="text-[11px] text-slate-400">
                                    Size / Volume: <span className="text-white font-semibold font-mono">
                                      {data.files.find(f => f.path === selectedGraphNode)?.loc || 12} lines
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-mono">
                                    Maintainability: <span className="text-emerald-400">
                                      {data.files.find(f => f.path === selectedGraphNode)?.maintainability || 95}/100
                                    </span>
                                  </p>
                                </div>

                                <div className="border-t border-slate-900 pt-2 space-y-1.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Direct Imports</span>
                                  <div className="space-y-1 text-[10px] font-mono text-indigo-300">
                                    {data.graph.edges
                                      .filter(e => e.source === selectedGraphNode)
                                      .map((e, idx) => (
                                        <div key={idx} className="truncate bg-slate-900/50 p-1.5 rounded border border-slate-950">
                                          → {e.target.split("/").pop()}
                                        </div>
                                      ))}
                                    {data.graph.edges.filter(e => e.source === selectedGraphNode).length === 0 && (
                                      <p className="text-slate-500 italic text-[10px]">No internal dependencies imported.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-12 text-slate-500 text-[11px]">
                                <Network className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                                Click a node on the graph map to trace direct imports.
                              </div>
                            )}
                          </div>

                          <div className="border-t border-slate-900 pt-3">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Export File Maps</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => triggerDownload("dependency_graph.json", JSON.stringify(data.graph, null, 2))}
                                className="bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded py-1 px-2 text-[10px] font-semibold text-center cursor-pointer transition-colors"
                              >
                                Export Graph
                              </button>
                              <button
                                onClick={() => triggerDownload("symbol_index.json", JSON.stringify(data.symbols, null, 2))}
                                className="bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded py-1 px-2 text-[10px] font-semibold text-center cursor-pointer transition-colors"
                              >
                                Export Symbols
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "trends" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Trend 1: Code Health & Technical Debt */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Health vs Technical Debt Progression</h3>
                          <p className="text-[11px] text-slate-400">Shows long term health index stability relative to refactoring timelines.</p>
                        </div>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                              <defs>
                                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="commit" stroke="#94a3b8" fontSize={10} />
                              <YAxis stroke="#94a3b8" fontSize={10} />
                              <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Area type="monotone" dataKey="healthScore" name="Health Score" stroke="#6366f1" fillOpacity={1} fill="url(#colorHealth)" />
                              <Area type="monotone" dataKey="technicalDebtScore" name="Tech Debt %" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDebt)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Trend 2: Volume progression */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Volume Growth Index (Lines of Code)</h3>
                          <p className="text-[11px] text-slate-400">Aggregates volume index variations across commits history.</p>
                        </div>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="commit" stroke="#94a3b8" fontSize={10} />
                              <YAxis stroke="#94a3b8" fontSize={10} />
                              <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Line type="monotone" dataKey="totalLOC" name="Total LOC" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="todosCount" name="Open TODOs" stroke="#f43f5e" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Historical Logs List */}
                    <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg">
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Scan History Commit Log</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-400">
                              <th className="py-2.5 px-3">Revision</th>
                              <th className="py-2.5 px-3">Scan Date</th>
                              <th className="py-2.5 px-3">Health Score</th>
                              <th className="py-2.5 px-3">Total Lines</th>
                              <th className="py-2.5 px-3">Security Warnings</th>
                              <th className="py-2.5 px-3">Refactor Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trends.map((t, idx) => (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/30">
                                <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{t.commit}</td>
                                <td className="py-2.5 px-3 text-slate-300">{t.date}</td>
                                <td className="py-2.5 px-3">
                                  <span className="font-semibold text-emerald-400">{t.healthScore}/100</span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-400">{t.totalLOC} lines</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded ${
                                    t.securityFindings > 2 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                                  }`}>
                                    {t.securityFindings} Findings
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400">
                                  {t.healthScore > 85 ? "Low priority" : "Urgent refactor required"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "devops" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Webhook Dispatch Console */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">DevOps Webhook Integration</h3>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Dispatches automated scan payloads directly to production monitoring channels like Discord, Microsoft Teams, or Slack.
                        </p>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Platform</label>
                            <select
                              value={webhookPlatform}
                              onChange={(e) => setWebhookPlatform(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md text-xs p-2 focus:outline-none focus:border-indigo-500 text-slate-200"
                            >
                              <option value="Discord">Discord Webhook</option>
                              <option value="Slack">Slack Integration</option>
                              <option value="Microsoft Teams">Microsoft Teams</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Webhook Endpoint URL</label>
                            <input
                              type="text"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-md text-xs p-2 focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                            />
                          </div>

                          <button
                            id="btn-trigger-webhook"
                            onClick={triggerWebhook}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer transition-colors shadow-md"
                          >
                            Dispatch Hook Payload
                          </button>

                          {webhookStatus && (
                            <div className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[10px] text-indigo-400 whitespace-pre-line">
                              {webhookStatus}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Threshold limit setter */}
                      <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">Analysis Threshold Limit</h3>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Determine rules to reject pipeline validation inside GitLab CI or GitHub actions.
                        </p>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">Maximum Allowed TODO items:</span>
                              <span className="font-bold text-indigo-400 font-mono">{thresholdTodo}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="30"
                              value={thresholdTodo}
                              onChange={(e) => setThresholdTodo(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300">Minimum Allowed Health Score:</span>
                              <span className="font-bold text-emerald-400 font-mono">{thresholdCoverage}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              value={thresholdCoverage}
                              onChange={(e) => setThresholdCoverage(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Badge Image Link</span>
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] font-mono text-emerald-400 select-all bg-slate-900 p-1 rounded flex-1 truncate">
                                {`https://img.shields.io/badge/Project_Health-${data.stats.healthScore}25-emerald.svg`}
                              </code>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                                Healthy
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CI/CD Actions config code boxes */}
                    <div className="bg-[#0c1220] border border-slate-900 rounded-xl p-5 shadow-lg space-y-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase text-slate-200 tracking-wider">GitHub Actions Workflow Template</h3>
                        <p className="text-[11px] text-slate-400 mt-1">Place inside `.github/workflows/project-analysis.yml` to trigger analysis automatically on pull requests.</p>
                      </div>

                      <div className="bg-[#090d16] rounded-lg border border-slate-950 p-4 font-mono text-[11px] text-indigo-200 overflow-x-auto relative">
                        <button
                          onClick={() => handleCopy(`name: AI Project Analyzer Scan
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm install
    - name: Run code security & coverage thresholds
      run: npm run start -- --mode scan --threshold-health ${thresholdCoverage} --threshold-todo ${thresholdTodo}`, "github-action")}
                          className="absolute right-3 top-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-800 transition-colors"
                        >
                          {copiedText === "github-action" ? "Copied" : "Copy Template"}
                        </button>
                        <pre className="leading-relaxed">
{`name: AI Project Analyzer Scan
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm install
    - name: Run code security & coverage thresholds
      run: npm run start -- --mode scan --threshold-health ${thresholdCoverage} --threshold-todo ${thresholdTodo}`}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* RIGHT SIDEBAR: AI Chat Panel & Context Generator */}
          <aside className="w-80 border-l border-slate-900 bg-[#0c1220] flex flex-col shrink-0">
            {/* Top mini-tabs inside right sidebar */}
            <div className="p-3 border-b border-slate-900 flex items-center justify-between bg-[#0b0f1a]">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                AI Assistant Engine
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                RAG Context
              </span>
            </div>

            {/* Chat message panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col min-h-0 bg-[#090d16]/30">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[90%] rounded-lg p-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white self-end"
                      : "bg-[#0b101c] border border-slate-900 text-slate-200 self-start font-mono"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="bg-[#0b101c] border border-slate-900 text-slate-400 rounded-lg p-2.5 text-xs self-start flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-900 bg-[#0b0f1a] flex gap-2">
              <input
                id="input-ai-chat"
                type="text"
                placeholder="Ask AI about this codebase..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChatMessage();
                }}
                className="flex-1 bg-slate-900 border border-slate-850 rounded-md text-xs px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
              />
              <button
                id="btn-send-chat"
                onClick={sendChatMessage}
                disabled={chatLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:bg-slate-800"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Context File Export Tool Block */}
            <div className="p-4 border-t border-slate-900 bg-[#0d1222] space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Context File Generators</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Export generated documentation bundles designed for consumption by downstream AI Agents.
              </p>

              <div className="space-y-1.5">
                <button
                  id="btn-export-project-context"
                  onClick={() => triggerDownload("project_context.json", generateProjectContextJson())}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs py-2 px-3 rounded-md font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    project_context.json
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  id="btn-export-architecture-report"
                  onClick={() => triggerDownload("architecture_report.md", generateArchitectureReport())}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs py-2 px-3 rounded-md font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    architecture_report.md
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  id="btn-export-security-report"
                  onClick={() => triggerDownload("security_report.md", generateSecurityReport())}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs py-2 px-3 rounded-md font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    security_report.md
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
