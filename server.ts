import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dns from "dns/promises";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Verify DNS Records
  app.post("/api/verify-dns", async (req, res) => {
    const { domain, type, selector } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    try {
      let records: string[][] = [];
      let status = "not_found";

      if (type === "SPF") {
        const txtRecords = await dns.resolveTxt(domain);
        records = txtRecords.filter(r => r.join("").startsWith("v=spf1"));
        status = records.length > 0 ? "valid" : "missing";
      } else if (type === "DMARC") {
        const dmarcDomain = `_dmarc.${domain}`;
        const txtRecords = await dns.resolveTxt(dmarcDomain);
        records = txtRecords.filter(r => r.join("").startsWith("v=DMARC1"));
        status = records.length > 0 ? "valid" : "missing";
      } else if (type === "DKIM") {
        const dkimDomain = `${selector}._domainkey.${domain}`;
        try {
          records = await dns.resolveTxt(dkimDomain);
          status = records.length > 0 ? "valid" : "missing";
        } catch (e) {
          status = "missing";
        }
      }

      res.json({ domain, type, records, status });
    } catch (error: any) {
      res.json({ domain, type, records: [], status: "missing", error: error.message });
    }
  });

  // --- Persistent Storage Helpers removed as we use Firebase now ---

  // Domains verification (Server-side DNS logic is still needed)
  app.get("/api/domains", (req, res) => res.json([])); // Legacy placeholder
  
  // Contacts Endpoints (Removed in favor of Firebase)
  // Campaigns Endpoints (Removed in favor of Firebase)

  // Auth Logic (Removed in favor of Firebase)

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
