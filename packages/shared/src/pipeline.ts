/** Current state of the 7-stage pipeline visualization. */
export interface PipelineState {
  phase: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: "idle" | "running" | "completed" | "error" | "cancelled";
  activeRequestId?: string;
}
