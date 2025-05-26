export interface WorkflowData {
  workflow_name: string;
  quantity: number;
  net_amount: number;
  runs: number;
  avgMinutes: number;
  repository?: string;
  usage_at?: string;
}

export interface AnalysisSession {
  id: string;
  data: WorkflowData[];
  createdAt: string;
  name: string;
}

export interface SummaryStats {
  totalWorkflows: number;
  totalMinutes: number;
  totalCost: number;
  topConsumerPercentage: number;
  topConsumerName: string;
  topRepository?: string;
  costTrend?: "increasing" | "decreasing" | "stable";
  suggestions?: string[];
}
