/**
 * RouteNote — parsowanie raportów dystrybucyjnych (CSV) oraz mapowanie
 * statusów platform na statusy wydań w HardbanRecords Lab.
 */

export type DistributionReportRow = {
  upc: string | null;
  isrc: string | null;
  title: string | null;
  artist: string | null;
  platform: string;
  status: string;
  url: string | null;
  external_id: string | null;
  reported_at: string;
};

/** Statusy wydania używane w bazie (enum release_status). */
export type ReleaseStatus =
  | "draft" | "submitted" | "under_review" | "approved"
  | "published" | "rejected" | "pending_review" | "distributed" | "live";

const STATUS_MAP: Record<string, ReleaseStatus> = {
  pending: "pending_review",
  "pending review": "pending_review",
  processing: "under_review",
  review: "under_review",
  "in review": "under_review",
  approved: "approved",
  accepted: "approved",
  delivered: "distributed",
  distributed: "distributed",
  sent: "distributed",
  live: "live",
  published: "live",
  available: "live",
  takedown: "rejected",
  rejected: "rejected",
  failed: "rejected",
};

export const mapPlatformStatus = (raw: string): ReleaseStatus | null =>
  STATUS_MAP[(raw || "").trim().toLowerCase()] ?? null;

/** Priorytet statusów — wydanie dostaje najwyższy osiągnięty status. */
const RANK: Record<string, number> = {
  draft: 0, submitted: 1, pending_review: 2, under_review: 3,
  approved: 4, distributed: 5, published: 6, live: 7, rejected: -1,
};

export const highestStatus = (statuses: ReleaseStatus[]): ReleaseStatus | null => {
  const valid = statuses.filter((s) => RANK[s] !== undefined && RANK[s] >= 0);
  if (!valid.length) return statuses.includes("rejected") ? "rejected" : null;
  return valid.reduce((a, b) => (RANK[b] > RANK[a] ? b : a));
};

const splitCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if ((c === "," || c === ";" || c === "\t") && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
};

const pick = (row: Record<string, string>, keys: string[]): string | null => {
  for (const k of keys) {
    const found = Object.keys(row).find((h) => h === k || h.replace(/[\s_-]/g, "") === k.replace(/[\s_-]/g, ""));
    if (found && row[found]) return row[found];
  }
  return null;
};

/** Parsuje raport CSV/TSV RouteNote (lub podobny) na listę zdarzeń dystrybucji. */
export const parseDistributionReport = (text: string): DistributionReportRow[] => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: DistributionReportRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));

    const platform = pick(row, ["platform", "store", "dsp", "service", "shop"]) || "RouteNote";
    const status = pick(row, ["status", "state", "delivery status", "store status"]) || "delivered";
    const dateRaw = pick(row, ["date", "reported_at", "updated", "status date", "delivery date"]);
    const parsed = dateRaw ? new Date(dateRaw) : null;

    rows.push({
      upc: pick(row, ["upc", "barcode", "ean"]),
      isrc: pick(row, ["isrc"]),
      title: pick(row, ["title", "release", "release title", "album"]),
      artist: pick(row, ["artist", "artist name", "primary artist"]),
      platform,
      status,
      url: pick(row, ["url", "link", "store url", "store link"]),
      external_id: pick(row, ["id", "release id", "routenote id", "external_id"]),
      reported_at: parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString(),
    });
  }

  return rows;
};
