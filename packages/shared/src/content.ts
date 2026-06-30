// Teaching content types (Spec 009). Cross-layer contract with the FastAPI
// `/api/content/*` responses — keep field names/shape in sync with
// apps/api/app/models/content.py.

export interface JargonTerm {
  slug: string;
  emoji: string;
  cn: string;
  en: string;
  plain: string;
  tech: string;
}

export interface JargonCategory {
  slug: string;
  label: string;
  terms: JargonTerm[];
}

export interface JargonResponse {
  module: "jargon";
  total: number;
  categories: JargonCategory[];
}
