import React from "react";
import { SummaryStats } from "../types";
import { formatCurrency, formatNumber } from "../utils/dataProcessing";
import { ClockIcon, DollarSign, FileIcon, PercentIcon } from "lucide-react";

interface DataSummaryProps {
  stats: SummaryStats;
}

const DataSummary: React.FC<DataSummaryProps> = ({ stats }) => {
  const summaryItems = [
    {
      label: "Total Workflows",
      value: formatNumber(stats.totalWorkflows),
      icon: <FileIcon className="w-5 h-5" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      label: "Total Minutes",
      value: formatNumber(stats.totalMinutes),
      icon: <ClockIcon className="w-5 h-5" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      label: "Total Cost",
      value: formatCurrency(stats.totalCost),
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      label: "Top Consumer",
      value: `${stats.topConsumerPercentage.toFixed(1)}%`,
      subtext: stats.topConsumerName,
      icon: <PercentIcon className="w-5 h-5" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item, index) => (
        <div
          key={index}
          className="p-4 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-800">
                {item.value}
              </p>
              {item.subtext && (
                <p
                  className="mt-1 text-xs text-gray-500 truncate max-w-[180px]"
                  title={item.subtext}
                >
                  {item.subtext}
                </p>
              )}
            </div>
            <div className={`p-2 rounded-md text-white ${item.color}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataSummary;
