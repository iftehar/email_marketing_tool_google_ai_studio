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

  // --- Persistent Storage Helpers ---
  const DOMAINS_FILE = path.join(process.cwd(), "domains.json");
  const CONTACTS_FILE = path.join(process.cwd(), "contacts.json");
  const CAMPAIGNS_FILE = path.join(process.cwd(), "campaigns.json");

  const loadData = (file: string) => {
    if (fs.existsSync(file)) {
      try { return JSON.parse(fs.readFileSync(file, "utf-8")); } catch (e) { return []; }
    }
    return [];
  };

  const saveData = (file: string, data: any[]) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };

  // Domains Endpoints
  app.get("/api/domains", (req, res) => res.json(loadData(DOMAINS_FILE)));
  app.post("/api/domains", (req, res) => {
    const domains = loadData(DOMAINS_FILE);
    domains.push(req.body);
    saveData(DOMAINS_FILE, domains);
    res.json({ success: true });
  });

  // Contacts Endpoints
  app.get("/api/contacts", (req, res) => res.json(loadData(CONTACTS_FILE)));
  app.post("/api/contacts", (req, res) => {
    saveData(CONTACTS_FILE, req.body); // Expecting full list or handle push
    res.json({ success: true });
  });

  // Campaigns Endpoints
  app.get("/api/campaigns", (req, res) => res.json(loadData(CAMPAIGNS_FILE)));
  app.post("/api/campaigns", (req, res) => {
    const campaigns = loadData(CAMPAIGNS_FILE);
    campaigns.push(req.body);
    saveData(CAMPAIGNS_FILE, campaigns);
    res.json({ success: true });
  });

  // --- Auth Logic ---
  const USERS_FILE = path.join(process.cwd(), "users.json");
  
  // Helper to load users
  const loadUsers = () => {
    if (fs.existsSync(USERS_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Helper to save users
  const saveUsers = (data: any[]) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  };

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    const users = loadUsers();
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    users.push({ name, email, password });
    saveUsers(users);
    res.json({ success: true, message: "User registered" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true, user: { name: user.name, email: user.email } });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
