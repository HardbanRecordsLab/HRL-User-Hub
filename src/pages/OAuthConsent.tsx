import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

type AuthDetails = {
  client?: { name?: string; uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
};

const oauthApi = (): OAuthApi => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Brak parametru authorization_id.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("Serwer autoryzacji nie zwrócił adresu powrotu.");
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "aplikacja zewnętrzna";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Połącz z HardbanRecords Lab
          </CardTitle>
          <CardDescription>
            {error
              ? "Nie udało się wczytać żądania autoryzacji."
              : details
                ? `${clientName} prosi o dostęp do Twojego konta.`
                : "Wczytywanie żądania autoryzacji…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !details ? (
            <div className="py-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Po zatwierdzeniu <strong>{clientName}</strong> będzie mogła korzystać z narzędzi HardbanRecords Lab w Twoim imieniu
                (wydania, wypłaty, rozliczenia, spory). Dostęp możesz cofnąć w każdej chwili.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" disabled={busy} onClick={() => decide(false)}>Odmów</Button>
                <Button disabled={busy} onClick={() => decide(true)}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Zatwierdź
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
