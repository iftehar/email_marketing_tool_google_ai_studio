import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dns from "dns/promises";
import fs from "fs";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const resend = new Resend(process.env.RESEND_API_KEY);

  // API Route: Send OTP
  app.post("/api/send-otp", async (req, res) => {
    const { email, otp, type } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Using console fallback.");
      console.log(`[SIMULATED EMAIL] To: ${email}, OTP: ${otp}, Type: ${type}`);
      return res.json({ success: true, simulated: true });
    }

    try {
      const subject = type === "auth" ? "Verify your SendFlow account" : "Verify your Domain Ownership";
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #4f46e5;">SendFlow</h1>
          <p style="font-size: 16px; color: #374151;">Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f3f4f6; text-align: center; border-radius: 8px; letter-spacing: 10px; color: #4f46e5;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This code will expire shortly. If you didn't request this, please ignore this email.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: "SendFlow <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error("Email API Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

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
