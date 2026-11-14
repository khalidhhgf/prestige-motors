import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/settings", () => ({ getSettings: async () => ({ siteName: "Test Motors", email: "sales@test.pk" }) }));
import { notifyNewLead } from "@/lib/mail";

describe("lead notification email", () => {
  it("skips quietly when SMTP is not configured", async () => {
    expect(await notifyNewLead({ kind: "contact", name: "A", phone: "1" }, null)).toEqual({ sent: false, reason: "SMTP not configured" });
  });
  it("sends to the settings email with escaped content", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const r = await notifyNewLead({ kind: "vehicle inquiry", name: "Ali", phone: "+923001234567", vehicle: "Civic", message: "<img src=x onerror=1>" }, { sendMail } as never);
    expect(r.sent).toBe(true);
    const arg = sendMail.mock.calls[0][0];
    expect(arg.to).toBe("sales@test.pk");
    expect(arg.subject).toContain("Civic");
    expect(arg.html).not.toContain("<img");
  });
  it("never throws when sending fails", async () => {
    const r = await notifyNewLead({ kind: "x", name: "A", phone: "1" }, { sendMail: vi.fn().mockRejectedValue(new Error("boom")) } as never);
    expect(r.sent).toBe(false);
  });
});
