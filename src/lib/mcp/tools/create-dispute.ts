import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_payout_dispute",
  title: "Zgłoś spór do pozycji wypłaty",
  description: "Tworzy spór do wskazanej pozycji wypłaty (payout_item) zalogowanego twórcy. Administrator otrzyma go do rozpatrzenia.",
  inputSchema: {
    payout_item_id: z.string().uuid().describe("ID pozycji wypłaty"),
    reason: z.string().trim().min(10).max(2000).describe("Opis problemu (min. 10 znaków)"),
    disputed_amount: z.number().nonnegative().optional().describe("Kwestionowana kwota (opcjonalnie)"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ payout_item_id, reason, disputed_amount }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("payout_disputes")
      .insert({ payout_item_id, reason, disputed_amount: disputed_amount ?? null, user_id: ctx.getUserId()! })
      .select("id, status, created_at")
      .single();
    if (error) throw new ToolError(error.message);
    return { content: [{ type: "text", text: `Spór utworzony: ${data.id}` }], structuredContent: { dispute: data } };
  },
});
