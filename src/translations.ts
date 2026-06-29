export type Language = "id" | "en";

export interface Translations {
  appName: string;
  appDesc: string;
  projectDir: string;
  reScan: string;
  analyzing: string;
  openExplorer: string;
  openChat: string;
  browseDirTooltip: string;

  loadingTitle: string;
  loadingDesc: string;
  engineFailed: string;
  engineFailedDesc: string;
  retryScan: string;

  projectExplorer: string;
  filesCount: string;
  filterPlaceholder: string;
  autoSync: string;
  autoSyncDesc: string;

  tabDashboard: string;
  tabExplorer: string;
  tabGraph: string;
  tabTrends: string;
  tabDevops: string;

  healthScore: string;
  stable: string;
  healthDesc: string;
  techDebtIndex: string;
  lowRisk: string;
  estimatedResolution: string;
  hours: string;
  securityFlags: string;
  requiresReview: string;
  secure: string;
  issuesFlagged: string;
  critical: string;
  warning: string;
  maintainability: string;
  maintainabilityGrade: string;
  maintainabilityDesc: string;

  volumeStats: string;
  linesOfCode: string;
  classes: string;
  functions: string;
  deadCode: string;
  detectedTech: string;
  sysArchitecture: string;
  estArchStyle: string;
  archStyleDesc: string;
  unresolvedTodo: string;
  activeTasks: string;
  cleanSlate: string;
  vulnerabilityReview: string;
  warningsCount: string;
  allClear: string;
  discoveredApi: string;
  noEndpoints: string;
  databaseConfig: string;
  noDbConfig: string;

  selectedMetadata: string;
  noFileLoaded: string;
  selectFileFromSidebar: string;
  metricsAnalysis: string;
  complexity: string;
  maintainabilityIndex: string;
  exportedSymbols: string;
  discoveredImports: string;
  noFileMeta: string;
  selectSourceFile: string;
  editorInstruction: string;
  copied: string;
  copyAll: string;

  dependencyMapTitle: string;
  dependencyMapDesc: string;
  searchMapNodes: string;
  selectedModule: string;
  clearTrace: string;
  sizeVolume: string;
  lines: string;
  pemeliharaan: string;
  directImports: string;
  noInternalDeps: string;
  clickNodeInstruction: string;
  exportFileMaps: string;
  exportGraph: string;
  exportSymbols: string;

  healthDebtTitle: string;
  healthDebtDesc: string;
  healthScoreLabel: string;
  techDebtLabel: string;
  growthIndexTitle: string;
  growthIndexDesc: string;
  totalLocLabel: string;
  openTodoLabel: string;
  scanHistoryTitle: string;
  revision: string;
  scanDate: string;
  totalLines: string;
  securityWarnings: string;
  refactorPriority: string;
  findings: string;
  lowPriority: string;
  urgentRefactor: string;

  webhookTitle: string;
  webhookDesc: string;
  targetPlatform: string;
  slackIntegration: string;
  webhookUrlLabel: string;
  dispatchHook: string;
  thresholdLimitTitle: string;
  thresholdLimitDesc: string;
  maxAllowedTodo: string;
  minAllowedHealth: string;

  aiAssistantTitle: string;
  ragContext: string;
  askAiPlaceholder: string;
  contextFileGenerators: string;
  contextFileDesc: string;

  serverFolderBrowser: string;
  serverFolderDesc: string;
  enterPathPlaceholder: string;
  navigate: string;
  current: string;
  scanningDirs: string;
  correctPathDesc: string;
  parentDir: string;
  noSubfolders: string;
  scanThis: string;
  modalInstruction: string;
  cancel: string;
  selectScanFolder: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "AI Project Analyzer",
    appDesc: "Enterprise static code scan, dependency intelligence & context suite",
    projectDir: "Project Dir:",
    reScan: "Re-Scan",
    analyzing: "Analyzing...",
    openExplorer: "Open Project Explorer",
    openChat: "Open AI Chat Assistant",
    browseDirTooltip: "Click to browse and change project folder",

    loadingTitle: "Deep Analyzing Project Source Code",
    loadingDesc: "Parsing symbol files, building token trees, mapping circular dependency routes, estimating architecture patterns, and generating vector database candidates.",
    engineFailed: "Analysis Engine Failed",
    engineFailedDesc: "Could not fetch scan analytics from local server database. Ensure server.ts background engine is operational.",
    retryScan: "Retry Scan Process",

    projectExplorer: "Project Explorer",
    filesCount: "Files",
    filterPlaceholder: "Filter project files...",
    autoSync: "File Auto-Sync Active",
    autoSyncDesc: "Changes are analyzed incrementally to feed the LLM Context database.",

    tabDashboard: "Dashboard",
    tabExplorer: "Interactive Code Explorer",
    tabGraph: "Dependency Map",
    tabTrends: "Trend Progression",
    tabDevops: "CI/CD & DevOps Integration",

    healthScore: "Project Health Score",
    stable: "Stable",
    healthDesc: "Deducted from circular imports and critical safety levels.",
    techDebtIndex: "Technical Debt Index",
    lowRisk: "Low Risk",
    estimatedResolution: "Estimated Resolution:",
    hours: "Hours",
    securityFlags: "Security Flags",
    requiresReview: "Requires Review",
    secure: "Secure",
    issuesFlagged: "Issues Flagged",
    critical: "Critical",
    warning: "Warning",
    maintainability: "Code Maintainability",
    maintainabilityGrade: "A- Grade",
    maintainabilityDesc: "Average maintainability index across all compiled modules.",

    volumeStats: "Volume Statistics",
    linesOfCode: "Lines of Code",
    classes: "Classes",
    functions: "Functions",
    deadCode: "Dead Code Candidates",
    detectedTech: "Detected Technologies",
    sysArchitecture: "System Architecture",
    estArchStyle: "Estimated Architectural Style",
    archStyleDesc: "Evaluated from source code structures, naming patterns, file tree nesting depth, and dependencies setup.",
    unresolvedTodo: "Unresolved TODO / Task priorities",
    activeTasks: "Active Tasks",
    cleanSlate: "Clean slate! No TODOs or unresolved tasks found.",
    vulnerabilityReview: "Security Vulnerability Review",
    warningsCount: "Warnings",
    allClear: "All clear! No hardcoded secrets or unsafe triggers identified.",
    discoveredApi: "Discovered Rest API Maps",
    noEndpoints: "No server-side rest API endpoints detected in this project.",
    databaseConfig: "Database Configuration & Entity Maps",
    noDbConfig: "No configured DB pools or models mapped.",

    selectedMetadata: "Selected Metadata",
    noFileLoaded: "No file loaded",
    selectFileFromSidebar: "Select a file from the explorer sidebar",
    metricsAnalysis: "Metrics Analysis",
    complexity: "Complexity",
    maintainabilityIndex: "Maintainability Index",
    exportedSymbols: "Exported Symbols",
    discoveredImports: "Discovered Imports",
    noFileMeta: "No file meta analyzed. Click on a file structure item.",
    selectSourceFile: "Select a source file to edit/view",
    editorInstruction: "// Click on any file in the left Explorer sidebar to display its source code and symbols here.",
    copied: "Copied",
    copyAll: "Copy All",

    dependencyMapTitle: "Dynamic Interactive Dependency Map",
    dependencyMapDesc: "Calculated statically by analyzing import statements. Visualizes source relationships, modular weights, and coupling boundaries.",
    searchMapNodes: "Search map nodes...",
    selectedModule: "Selected Module",
    clearTrace: "Clear Trace",
    sizeVolume: "Size / Volume:",
    lines: "lines",
    pemeliharaan: "Maintainability:",
    directImports: "Direct Imports",
    noInternalDeps: "No internal dependencies imported.",
    clickNodeInstruction: "Click a node on the graph map to trace direct imports.",
    exportFileMaps: "Export File Maps",
    exportGraph: "Export Graph",
    exportSymbols: "Export Symbols",

    healthDebtTitle: "Health vs Technical Debt Progression",
    healthDebtDesc: "Shows long term health index stability relative to refactoring timelines.",
    healthScoreLabel: "Health Score",
    techDebtLabel: "Tech Debt %",
    growthIndexTitle: "Volume Growth Index (Lines of Code)",
    growthIndexDesc: "Aggregates volume index variations across commits history.",
    totalLocLabel: "Total LOC",
    openTodoLabel: "Open TODOs",
    scanHistoryTitle: "Scan History Commit Log",
    revision: "Revision",
    scanDate: "Scan Date",
    totalLines: "Total Lines",
    securityWarnings: "Security Warnings",
    refactorPriority: "Refactor Priority",
    findings: "Findings",
    lowPriority: "Low priority",
    urgentRefactor: "Urgent refactor required",

    webhookTitle: "DevOps Webhook Integration",
    webhookDesc: "Dispatches automated scan payloads directly to production monitoring channels like Discord, Microsoft Teams, or Slack.",
    targetPlatform: "Target Platform",
    slackIntegration: "Slack Integration",
    webhookUrlLabel: "Webhook Endpoint URL",
    dispatchHook: "Dispatch Hook Payload",
    thresholdLimitTitle: "Analysis Threshold Limit",
    thresholdLimitDesc: "Determine rules to reject pipeline validation inside GitLab CI or GitHub actions.",
    maxAllowedTodo: "Maximum Allowed TODO items:",
    minAllowedHealth: "Minimum Allowed Health Score:",

    aiAssistantTitle: "AI Assistant Engine",
    ragContext: "RAG Context",
    askAiPlaceholder: "Ask AI about this codebase...",
    contextFileGenerators: "Context File Generators",
    contextFileDesc: "Export generated documentation bundles designed for consumption by downstream AI Agents.",

    serverFolderBrowser: "Server Folder Browser",
    serverFolderDesc: "Select any server folder path to scan and inspect code structures.",
    enterPathPlaceholder: "Enter custom path manually (e.g. /home/user/my-project)...",
    navigate: "Navigate",
    current: "Current:",
    scanningDirs: "Scanning directories...",
    correctPathDesc: "Make sure the path is correct and accessible on the server filesystem.",
    parentDir: "(Parent Directory)",
    noSubfolders: "No subfolders found in this directory.",
    scanThis: "Scan This",
    modalInstruction: "Click folders to navigate or click 'Scan Current' to view stats.",
    cancel: "Cancel",
    selectScanFolder: "Select & Scan Current Folder",
  },
  id: {
    appName: "Penganalisis Proyek AI",
    appDesc: "Pemindaian kode statis, kecerdasan dependensi & rangkaian konteks Enterprise",
    projectDir: "Dir Proyek:",
    reScan: "Pindai Ulang",
    analyzing: "Menganalisis...",
    openExplorer: "Buka Penjelajah Proyek",
    openChat: "Buka Asisten Chat AI",
    browseDirTooltip: "Klik untuk menelusuri dan mengubah folder proyek",

    loadingTitle: "Menganalisis Kode Sumber Proyek Secara Mendalam",
    loadingDesc: "Mengurai file simbol, membangun pohon token, memetakan rute dependensi melingkar, memperkirakan pola arsitektur, dan menghasilkan kandidat database vektor.",
    engineFailed: "Mesin Analisis Gagal",
    engineFailedDesc: "Tidak dapat mengambil analitik pemindaian dari database server lokal. Pastikan mesin latar belakang server.ts berfungsi dengan baik.",
    retryScan: "Ulangi Proses Pemindaian",

    projectExplorer: "Penjelajah Proyek",
    filesCount: "File",
    filterPlaceholder: "Filter file proyek...",
    autoSync: "Sinkronisasi Otomatis Aktif",
    autoSyncDesc: "Perubahan dianalisis secara inkremental untuk memperbarui basis data Konteks LLM.",

    tabDashboard: "Dasbor",
    tabExplorer: "Penjelajah Kode Interaktif",
    tabGraph: "Peta Dependensi",
    tabTrends: "Perkembangan Tren",
    tabDevops: "Integrasi CI/CD & DevOps",

    healthScore: "Skor Kesehatan Proyek",
    stable: "Stabil",
    healthDesc: "Dikurangi berdasarkan impor melingkar dan tingkat keamanan kritis.",
    techDebtIndex: "Indeks Utang Teknis",
    lowRisk: "Risiko Rendah",
    estimatedResolution: "Estimasi Penyelesaian:",
    hours: "Jam",
    securityFlags: "Bendera Keamanan",
    requiresReview: "Butuh Tinjauan",
    secure: "Aman",
    issuesFlagged: "Masalah Ditandai",
    critical: "Kritis",
    warning: "Peringatan",
    maintainability: "Kemudahan Pemeliharaan",
    maintainabilityGrade: "Nilai A-",
    maintainabilityDesc: "Rata-rata indeks kemudahan pemeliharaan di semua modul yang dikompilasi.",

    volumeStats: "Statistik Volume",
    linesOfCode: "Baris Kode",
    classes: "Kelas",
    functions: "Fungsi",
    deadCode: "Kandidat Kode Mati",
    detectedTech: "Teknologi Terdeteksi",
    sysArchitecture: "Arsitektur Sistem",
    estArchStyle: "Estimasi Gaya Arsitektur",
    archStyleDesc: "Dievaluasi dari struktur kode sumber, pola penamaan, kedalaman sarang pohon file, dan pengaturan dependensi.",
    unresolvedTodo: "Prioritas Tugas / TODO Belum Selesai",
    activeTasks: "Tugas Aktif",
    cleanSlate: "Semua bersih! Tidak ada TODO atau tugas tertunda yang ditemukan.",
    vulnerabilityReview: "Tinjauan Kerentanan Keamanan",
    warningsCount: "Peringatan",
    allClear: "Semua aman! Tidak ada rahasia atau pemicu tidak aman yang teridentifikasi.",
    discoveredApi: "Peta API REST Terdeteksi",
    noEndpoints: "Tidak ada endpoint API REST sisi server yang terdeteksi dalam proyek ini.",
    databaseConfig: "Konfigurasi Database & Peta Entitas",
    noDbConfig: "Tidak ada pool DB atau model yang terkonfigurasi.",

    selectedMetadata: "Metadata Terpilih",
    noFileLoaded: "Tidak ada file yang dimuat",
    selectFileFromSidebar: "Pilih file dari bilah sisi penjelajah",
    metricsAnalysis: "Analisis Metrik",
    complexity: "Kompleksitas",
    maintainabilityIndex: "Indeks Kemudahan Pemeliharaan",
    exportedSymbols: "Simbol yang Diekspor",
    discoveredImports: "Impor yang Terdeteksi",
    noFileMeta: "Tidak ada meta file yang dianalisis. Klik pada item struktur file.",
    selectSourceFile: "Pilih file sumber untuk diedit/dilihat",
    editorInstruction: "// Klik pada file mana saja di penjelajah bilah sisi kiri untuk menampilkan kode sumber dan simbolnya di sini.",
    copied: "Disalin",
    copyAll: "Salin Semua",

    dependencyMapTitle: "Peta Dependensi Interaktif Dinamis",
    dependencyMapDesc: "Dihitung secara statis dengan menganalisis pernyataan impor. Memvisualisasikan hubungan sumber, bobot modular, dan batas kopling.",
    searchMapNodes: "Cari node peta...",
    selectedModule: "Modul Terpilih",
    clearTrace: "Bersihkan Jejak",
    sizeVolume: "Ukuran / Volume:",
    lines: "baris",
    pemeliharaan: "Pemeliharaan:",
    directImports: "Impor Langsung",
    noInternalDeps: "Tidak ada dependensi internal yang diimpor.",
    clickNodeInstruction: "Klik node pada peta grafis untuk melacak impor langsung.",
    exportFileMaps: "Ekspor Peta File",
    exportGraph: "Ekspor Grafis",
    exportSymbols: "Ekspor Simbol",

    healthDebtTitle: "Perkembangan Kesehatan vs Utang Teknis",
    healthDebtDesc: "Menampilkan stabilitas indeks kesehatan jangka panjang relatif terhadap linimasa pemfaktoran ulang.",
    healthScoreLabel: "Skor Kesehatan",
    techDebtLabel: "Persentase Utang Teknis",
    growthIndexTitle: "Indeks Pertumbuhan Volume (Baris Kode)",
    growthIndexDesc: "Menggabungkan variasi indeks volume di sepanjang riwayat commit.",
    totalLocLabel: "Total Baris Kode",
    openTodoLabel: "TODO Terbuka",
    scanHistoryTitle: "Log Commit Riwayat Pemindaian",
    revision: "Revisi",
    scanDate: "Tanggal Pindai",
    totalLines: "Total Baris",
    securityWarnings: "Peringatan Keamanan",
    refactorPriority: "Prioritas Refaktor",
    findings: "Temuan",
    lowPriority: "Prioritas rendah",
    urgentRefactor: "Pemfaktoran ulang mendesak",

    webhookTitle: "Integrasi Webhook DevOps",
    webhookDesc: "Mengirimkan payload pemindaian otomatis langsung ke saluran pemantauan produksi seperti Discord, Microsoft Teams, atau Slack.",
    targetPlatform: "Platform Target",
    slackIntegration: "Integrasi Slack",
    webhookUrlLabel: "URL Endpoint Webhook",
    dispatchHook: "Kirim Payload Webhook",
    thresholdLimitTitle: "Batas Ambang Analisis",
    thresholdLimitDesc: "Tentukan aturan untuk menolak validasi pipeline di dalam GitLab CI atau tindakan GitHub.",
    maxAllowedTodo: "Jumlah item TODO Maksimum yang Diizinkan:",
    minAllowedHealth: "Skor Kesehatan Minimum yang Diizinkan:",

    aiAssistantTitle: "Mesin Asisten AI",
    ragContext: "Konteks RAG",
    askAiPlaceholder: "Tanyakan AI tentang basis kode ini...",
    contextFileGenerators: "Pembangkit File Konteks",
    contextFileDesc: "Ekspor bundel dokumentasi yang dihasilkan untuk digunakan oleh Agen AI hilir.",

    serverFolderBrowser: "Penjelajah Folder Server",
    serverFolderDesc: "Pilih jalur folder server mana saja untuk memindai dan memeriksa struktur kode.",
    enterPathPlaceholder: "Masukkan jalur khusus secara manual (misal: /home/user/my-project)...",
    navigate: "Navigasi",
    current: "Saat Ini:",
    scanningDirs: "Memindai direktori...",
    correctPathDesc: "Pastikan jalur tersebut benar dan dapat diakses pada sistem file server.",
    parentDir: "(Direktori Induk)",
    noSubfolders: "Tidak ada subfolder yang ditemukan di direktori ini.",
    scanThis: "Pindai Ini",
    modalInstruction: "Klik folder untuk navigasi atau klik 'Pilih & Pindai' untuk melihat statistik.",
    cancel: "Batal",
    selectScanFolder: "Pilih & Pindai Folder Saat Ini",
  },
};
