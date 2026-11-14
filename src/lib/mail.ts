import "server-only";
import nodemailer from "nodemailer";
import { getSettings } from "./settings";
import { SITE_URL } from "./format";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

type Notice = { kind: string; name: string; phone: string; email?: string | null; vehicle?: string | null; message?: string | null; extra?: string };

/** Emails the dealership about a new lead. Never throws: a mail failure must not break the customer's form. */
export async function notifyNewLead(n: Notice, transport = defaultTransport()) {
  if (!transport) return { sent: false, reason: "SMTP not configured" };
  try {
    const s = await getSettings();
    const to = process.env.NOTIFY_EMAIL || s.email;
    if (!to) return { sent: false, reason: "no recipient" };
    const rows: [string, string][] = [["Name", n.name], ["Phone", n.phone], ["Email", n.email ?? "—"], ["Vehicle", n.vehicle ?? "—"], ["Message", n.message || "—"], ...(n.extra ? [["Details", n.extra] as [string, string]] : [])];
    await transport.sendMail({
      from: process.env.SMTP_FROM || `"${s.siteName}" <${process.env.SMTP_USER}>`,
      to,
      replyTo: n.email || undefined,
      subject: `New ${n.kind}: ${n.name}${n.vehicle ? ` – ${n.vehicle}` : ""}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nOpen CRM: ${SITE_URL}/admin/leads`,
      html: `<table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table><p><a href="${SITE_URL}/admin/leads">Open CRM</a></p>`,
    });
    return { sent: true };
  } catch (e) {
    console.error("lead notification failed", e);
    return { sent: false, reason: "send failed" };
  }
}

function defaultTransport() {
  if (!mailConfigured()) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}
