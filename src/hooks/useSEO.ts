import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

const BASE_TITLE = "HardbanRecords Lab";
const BASE_URL = "https://app-user-hub.hardbanrecordslab.online";

export function useSEO({ title, description, canonical }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${BASE_TITLE}`
      : `${BASE_TITLE} - Kompleksowa Platforma dla Niezależnych Twórców`;
    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }

    // Dynamic canonical tag
    if (canonical) {
      const url = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`;
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (link) {
        link.href = url;
      } else {
        link = document.createElement("link");
        link.rel = "canonical";
        link.href = url;
        document.head.appendChild(link);
      }
    }
  }, [title, description, canonical]);
}
