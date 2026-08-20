import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7MKcKvez9XuOIHlD8hTOVJjB9ghUqrfPOeRowduV7QmNMdso2dnEx2sf-Fd7tstP8tA/exec";

  // Check Configuration
  app.get("/api/config", (req, res) => {
    res.json({ configured: Boolean(APPSCRIPT_URL) });
  });

  // API Proxy to Apps Script
  app.post("/api/proxy", async (req, res) => {
    if (!APPSCRIPT_URL) {
      return res.status(500).json({ error: "APPSCRIPT_URL belum dikonfigurasi" });
    }

    try {
      const response = await fetch(APPSCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // Apps Script handles text/plain better for CORS
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Proxy Error:", err);
      res.status(500).json({ error: "Gagal menghubungi Apps Script. Pastikan URL benar dan sudah di-deploy sebagai Web App." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router HTML5 History API fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
