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

// --- Job (Spec 010) ---

export interface JobTag {
  key: string;
  label: string;
  emoji: string;
  count: number;
}

export interface JobSummary {
  id: string;
  title: string;
  category: string;
  tag: string;
  difficulty: string;
  company: string;
  tags: string[];
}

export interface JobQuestion extends JobSummary {
  answer: string;
  code: string | null;
  codeLabel: string | null;
  codeLines: number | null;
  keyPoints: string[];
  related: string[];
}

export interface JobListResponse {
  module: "job";
  total: number;
  all_tags: JobTag[];
  items: JobSummary[];
}

// --- Code (Spec 011) ---

export interface CodeTool {
  name: string;
  emoji: string;
  title: string;
  plain: string;
  example: string;
  isExp: boolean;
}

export interface CodeCommand {
  cmd: string;
  emoji: string;
  title: string;
  plain: string;
  example: string;
  isExp: boolean;
}

export interface CodeToolCategory {
  slug: string;
  label: string;
  count: number;
  tools: CodeTool[];
}

export interface CodeCommandCategory {
  slug: string;
  label: string;
  count: number;
  commands: CodeCommand[];
}

export interface SimStep {
  terminal: string[];
  seq: { tag: string; tagColor: string; title: string; desc: string; code: string | null };
}

export interface AgentStep {
  num: string;
  title: string;
  src: string;
  desc: string;
  code: string | null;
}

export interface HiddenFeature {
  name: string;
  desc: string;
}

export interface CodeResponse {
  module: "code";
  tools: { categories: CodeToolCategory[] };
  commands: { categories: CodeCommandCategory[] };
  simulator: SimStep[];
  agentLoop: AgentStep[];
  hidden: HiddenFeature[];
}
