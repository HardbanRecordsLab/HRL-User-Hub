import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_releases",
  title: "Lista wydań muzycznych",
  description: "Zwraca wydania muzyczne zalogowanego artysty (tytuł, artysta, status, data premiery).",
  inputSchema: {
    status: z.string().optional().describe("Opcjonalny filtr statusu, np. draft, submitted, live"),
    limit: z.number().int().min(1).max(100).default(25).describe("Maksymalna liczba wyników"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("music_releases")
      .select("id, title, artist_name, album_type, status, release_date, upc_code, submitted_at, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status as never);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { releases: data } };
  },
});
