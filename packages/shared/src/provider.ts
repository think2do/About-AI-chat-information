/** Supported LLM provider identifiers. */
export type ProviderId = "openrouter" | "aihubmix" | "packy" | "custom";

/** Configuration for a single LLM provider. API Key only stored in browser localStorage. */
export interface ProviderConfig {
  provider: ProviderId;
  label: string;
  baseUrl: string;
  model: string;
  apiKey: string; // Only in browser localStorage — never persisted server-side
}
