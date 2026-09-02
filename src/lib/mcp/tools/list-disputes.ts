import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_payout_disputes",
  title: "Lista sporów wypłat",
  description: "Zwraca spory zgłoszone przez zalogowanego twórcę do pozycji wypłat wraz ze statusem i rozstrzygnięciem.",
  inputSchema: {
    status: z.enum(["open", "under_review", "resolved", "rejected"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("payout_disputes")
      .select("id, payout_item_id, reason, disputed_amount, status, resolution, created_at, resolved_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { disputes: data } };
  },
});
