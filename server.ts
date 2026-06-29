import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./backend/api/router";
import { CONFIG } from "./backend/config";

async function bootstrap() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));

  // Attach all API endpoints cleanly under /api prefix
  app.use("/api", apiRouter);

  // Vite development middleware vs production build static server
  if (CONFIG.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`AI Project Intelligence Platform running on http://${CONFIG.HOST}:${CONFIG.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical bootstrap failure:", err);
  process.exit(1);
});
