import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
}

const BASE_TITLE = "HardbanRecords Lab";

export function useSEO({ title, description }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} - Kompleksowa Platforma dla Niezależnych Twórców`;
    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  }, [title, description]);
}
