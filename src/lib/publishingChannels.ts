/**
 * Katalog darmowych (prowizyjnych) platform self-publishingowych,
 * do których HardbanRecords Lab dystrybuuje publikacje cyfrowe.
 * Model: 0 zł opłat wstępnych — platforma pobiera procent od sprzedaży.
 */

export type PublicationFormat = "ebook" | "audiobook" | "print";

export interface PublishingChannel {
  id: string;
  name: string;
  region: "PL" | "GLOBAL";
  /** Procent ceny netto, który zostaje u autora/agregatora po prowizji platformy */
  authorSharePct: number;
  formats: PublicationFormat[];
  requiredFormats: string[];
  description: string;
  reach: string;
  notes?: string;
}

export const PUBLISHING_CHANNELS: PublishingChannel[] = [
  {
    id: "empik",
    name: "Empik Selfpublishing",
    region: "PL",
    authorSharePct: 50,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB", "MP3"],
    description: "Największy polski kanał sprzedaży e-booków i audiobooków.",
    reach: "Empik.com, Empik Go, Virtualo",
  },
  {
    id: "woblink",
    name: "Woblink",
    region: "PL",
    authorSharePct: 55,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB", "PDF", "MP3"],
    description: "Polski agregator z dystrybucją do abonamentów czytelniczych.",
    reach: "Woblink, Legimi, Publio, Nexto",
  },
  {
    id: "legimi",
    name: "Legimi (przez agregatora)",
    region: "PL",
    authorSharePct: 50,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB"],
    description: "Abonament — rozliczenie za realnie przeczytane strony.",
    reach: "Legimi PL/DE",
    notes: "Wejście przez Woblink lub Virtualo — brak bezpośredniego naboru.",
  },
  {
    id: "virtualo",
    name: "Virtualo",
    region: "PL",
    authorSharePct: 50,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB", "MP3"],
    description: "Dystrybutor zasilający polskie księgarnie i abonamenty.",
    reach: "Virtualo, Empik Go, Legimi",
  },
  {
    id: "draft2digital",
    name: "Draft2Digital",
    region: "GLOBAL",
    authorSharePct: 90,
    formats: ["ebook", "print"],
    requiredFormats: ["EPUB", "DOCX"],
    description: "Globalny agregator — 10% prowizji, bez opłat wstępnych.",
    reach: "Apple Books, Kobo, Barnes & Noble, Scribd, biblioteki",
  },
  {
    id: "kdp",
    name: "Amazon KDP",
    region: "GLOBAL",
    authorSharePct: 70,
    formats: ["ebook", "print"],
    requiredFormats: ["EPUB", "PDF"],
    description: "70% royalty w przedziale 2,99–9,99 USD, poza nim 35%.",
    reach: "Amazon (wszystkie rynki), Kindle Unlimited",
  },
  {
    id: "google-play-books",
    name: "Google Play Books",
    region: "GLOBAL",
    authorSharePct: 70,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB", "PDF"],
    description: "Bezpośredni nabór wydawców, 70% dla autora.",
    reach: "Google Play (globalnie)",
  },
  {
    id: "apple-books",
    name: "Apple Books for Authors",
    region: "GLOBAL",
    authorSharePct: 70,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB"],
    description: "Bezpośrednio lub przez Draft2Digital.",
    reach: "Apple Books (51 krajów)",
  },
  {
    id: "kobo",
    name: "Kobo Writing Life",
    region: "GLOBAL",
    authorSharePct: 70,
    formats: ["ebook", "audiobook"],
    requiredFormats: ["EPUB"],
    description: "70% royalty powyżej 2,99 USD, brak opłat wstępnych.",
    reach: "Kobo, Rakuten, biblioteki OverDrive",
  },
];

/** Prowizja HardbanRecords Lab liczona od kwoty, którą otrzymuje autor od platformy */
export const HRL_COMMISSION_PCT = 15;

/** Wymagane wymiary okładki e-booka */
export const COVER_REQUIREMENTS = { width: 1600, height: 2560 };

export interface ChannelPayout {
  channel: PublishingChannel;
  platformFee: number;
  afterPlatform: number;
  hrlFee: number;
  netToAuthor: number;
}

export function calculateChannelPayouts(price: number, channelIds: string[]): ChannelPayout[] {
  return PUBLISHING_CHANNELS.filter((c) => channelIds.includes(c.id)).map((channel) => {
    const afterPlatform = (price * channel.authorSharePct) / 100;
    const platformFee = price - afterPlatform;
    const hrlFee = (afterPlatform * HRL_COMMISSION_PCT) / 100;
    return {
      channel,
      platformFee,
      afterPlatform,
      hrlFee,
      netToAuthor: afterPlatform - hrlFee,
    };
  });
}

export const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Szkic",
  pending_review: "Weryfikacja",
  approved: "Zatwierdzone",
  rejected: "Odrzucone",
  distributed: "Wysłane do kanałów",
  live: "Dostępne w sprzedaży",
};
