import { format, parseISO, subDays } from 'date-fns';
import { WorkflowData, SummaryStats } from '../types';

export const processCSVData = (data: any[], dateRange?: [Date, Date]): WorkflowData[] => {
  let processedData = data
    .filter(row => 
      row.workflow_name && 
      !isNaN(parseFloat(row.quantity)) && 
      !isNaN(parseFloat(row.net_amount))
    )
    .map(row => ({
      workflow_name: row.workflow_name,
      quantity: parseFloat(row.quantity),
      net_amount: parseFloat(row.net_amount),
      repository: row.repository || extractRepoFromWorkflow(row.workflow_name),
      usage_at: row.usage_at || null
    }));

  if (dateRange) {
    processedData = processedData.filter(row => {
      if (!row.usage_at) return true;
      const date = parseISO(row.usage_at);
      return date >= dateRange[0] && date <= dateRange[1];
    });
  }

  return processedData.sort((a, b) => b.quantity - a.quantity);
};

export const generateOptimizationSuggestions = (data: WorkflowData[]): string[] => {
  const suggestions: string[] = [];
  const repoStats = getRepositoryStats(data);

  // Find workflows with high frequency and cost
  const highCostWorkflows = data
    .filter(w => w.net_amount > calculateAverageCost(data) * 2)
    .map(w => w.workflow_name);

  if (highCostWorkflows.length > 0) {
    suggestions.push(
      `Consider optimizing these high-cost workflows: ${highCostWorkflows.join(', ')}`
    );
  }

  // Repository-specific suggestions
  Object.entries(repoStats).forEach(([repo, stats]) => {
    if (stats.cost > calculateTotalCost(data) * 0.3) {
      suggestions.push(
        `Repository "${repo}" consumes ${Math.round(stats.costPercentage)}% of total costs. Consider reviewing its CI/CD patterns.`
      );
    }
  });

  return data
    suggestions;
};

export const getRepositoryStats = (data: WorkflowData[]) => {
  const stats: Record<string, { runs: number; minutes: number; cost: number; costPercentage: number }> = {};
  const totalCost = calculateTotalCost(data);

  data.forEach(workflow => {
    const repo = workflow.repository || 'unknown';
    if (!stats[repo]) {
      stats[repo] = { runs: 0, minutes: 0, cost: 0, costPercentage: 0 };
    }
    stats[repo].runs++;
    stats[repo].minutes += workflow.quantity;
    stats[repo].cost += workflow.net_amount;
    stats[repo].costPercentage = (stats[repo].cost / totalCost) * 100;
  });

  return stats;
};

export const calculateSummaryStats = (data: WorkflowData[]): SummaryStats => {
  if (!data.length) {
    return {
      totalWorkflows: 0,
      totalMinutes: 0,
      totalCost: 0,
      topConsumerPercentage: 0,
      topConsumerName: ''
    };
  }

  const totalWorkflows = data.length;
  const totalMinutes = data.reduce((sum, workflow) => sum + workflow.quantity, 0);
  const totalCost = data.reduce((sum, workflow) => sum + workflow.net_amount, 0);
  const topConsumer = data[0];
  const topConsumerPercentage = (topConsumer.quantity / totalMinutes) * 100;

  const repoStats = getRepositoryStats(data);
  const topRepository = Object.entries(repoStats)
    .sort(([,a], [,b]) => b.cost - a.cost)[0]?.[0];

  const suggestions = generateOptimizationSuggestions(data);

  return {
    totalWorkflows,
    totalMinutes,
    totalCost,
    topConsumerPercentage,
    topConsumerName: topConsumer.workflow_name,
    topRepository,
    suggestions
  };
};

const extractRepoFromWorkflow = (workflowName: string): string => {
  // Attempt to extract repository name from workflow name patterns
  const match = workflowName.match(/^([^/]+\/[^/]+)\//);
  return match ? match[1] : 'unknown';
};

const calculateAverageCost = (data: WorkflowData[]): number => {
  return data.reduce((sum, w) => sum + w.net_amount, 0) / data.length;
};

const calculateTotalCost = (data: WorkflowData[]): number => {
  return data.reduce((sum, w) => sum + w.net_amount, 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getTopWorkflows = (data: WorkflowData[], count: number = 10): WorkflowData[] => {
  return [...data].slice(0, count);
};