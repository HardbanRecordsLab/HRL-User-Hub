import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_settlement_summary",
  title: "Podsumowanie rozliczeń",
  description:
    "Zwraca podsumowanie finansowe zalogowanego twórcy: przychód brutto, prowizja HRL, zarobek netto, wypłacono, w realizacji i saldo nierozliczone.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const uid = ctx.getUserId();
    const [{ data: txs, error: e1 }, { data: payouts, error: e2 }] = await Promise.all([
      supabase
        .from("revenue_transactions")
        .select("gross_amount, amount, platform_fee_amount, net_to_artist, settled_payout_id")
        .eq("user_id", uid),
      supabase.from("payouts").select("amount, status").eq("user_id", uid),
    ]);
    if (e1 || e2) return { content: [{ type: "text", text: (e1 || e2)!.message }], isError: true };
    const n = (v: unknown) => Number(v ?? 0);
    const gross = (txs || []).reduce((a, t) => a + n(t.gross_amount ?? t.amount), 0);
    const fee = (txs || []).reduce((a, t) => a + n(t.platform_fee_amount), 0);
    const net = (txs || []).reduce((a, t) => a + n(t.net_to_artist ?? t.amount), 0);
    const unsettled = (txs || []).filter((t) => !t.settled_payout_id).reduce((a, t) => a + n(t.net_to_artist ?? t.amount), 0);
    const paid = (payouts || []).filter((p) => p.status === "paid").reduce((a, p) => a + n(p.amount), 0);
    const inProgress = (payouts || [])
      .filter((p) => ["pending", "approved", "processing"].includes(p.status))
      .reduce((a, p) => a + n(p.amount), 0);
    const summary = {
      currency: "PLN",
      gross: +gross.toFixed(2),
      platform_fee: +fee.toFixed(2),
      net_earned: +net.toFixed(2),
      paid_out: +paid.toFixed(2),
      in_progress: +inProgress.toFixed(2),
      unsettled_balance: +unsettled.toFixed(2),
      transactions: txs?.length ?? 0,
      payouts: payouts?.length ?? 0,
    };
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }], structuredContent: summary };
  },
});
