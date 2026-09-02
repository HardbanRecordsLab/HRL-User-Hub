import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_payouts",
  title: "Lista wypłat",
  description: "Zwraca historię wypłat prowizji zalogowanego twórcy wraz ze statusami i okresami rozliczeniowymi.",
  inputSchema: {
    status: z.enum(["pending", "approved", "processing", "paid", "rejected"]).optional().describe("Opcjonalny filtr statusu"),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("payouts")
      .select("id, amount, currency, status, period_start, period_end, reference, requested_at, paid_at")
      .eq("user_id", ctx.getUserId())
      .order("requested_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { payouts: data } };
  },
});
