import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listReleases from "./tools/list-releases";
import listPayouts from "./tools/list-payouts";
import getSettlementSummary from "./tools/get-settlement-summary";
import listDisputes from "./tools/list-disputes";
import createDispute from "./tools/create-dispute";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hardbanrecordslab-userhub",
  title: "hardbanrecordslab-userhub",
  version: "0.1.0",
  instructions:
    "Narzędzia HardbanRecords Lab dla zalogowanego artysty/autora: przegląd wydań muzycznych, wypłat prowizji, podsumowania rozliczeń oraz zgłaszanie sporów do pozycji wypłat. Wszystkie dane są ograniczone do konta użytkownika, który autoryzował połączenie.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listReleases, listPayouts, getSettlementSummary, listDisputes, createDispute],
});
