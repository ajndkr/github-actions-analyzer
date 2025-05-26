import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { WorkflowData } from "../types";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface WorkflowChartProps {
  data: WorkflowData[];
  maxItems?: number;
}

type ChartType = "bar" | "pie" | "doughnut";

const WorkflowChart: React.FC<WorkflowChartProps> = ({
  data,
  maxItems = 10,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [itemCount, setItemCount] = useState(maxItems);

  const topWorkflows = data.slice(0, itemCount);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current.canvas);
      const link = document.createElement("a");
      link.download = "workflow-chart.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const chartData = {
    labels: topWorkflows.map((workflow) => {
      // Truncate long workflow names
      const name = workflow.workflow_name;
      return name.length > 30 ? name.substring(0, 27) + "..." : name;
    }),
    datasets: [
      {
        label: "Minutes Consumed",
        data: topWorkflows.map((workflow) => workflow.quantity),
        backgroundColor:
          chartType === "bar"
            ? "rgba(99, 102, 241, 0.8)"
            : topWorkflows.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`),
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(79, 70, 229, 0.9)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${value.toLocaleString()} minutes`;
          },
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const cost = topWorkflows[index].net_amount;
            return `Cost: $${cost.toFixed(2)}`;
          },
          title: (context: any) => {
            const index = context[0].dataIndex;
            return topWorkflows[index].workflow_name;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          callback: function (value: any, index: number) {
            // Show shorter labels on small screens
            const label = this.getLabelForValue(index);
            if (window.innerWidth < 768) {
              return label.length > 15 ? label.substring(0, 12) + "..." : label;
            }
            return label;
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Minutes",
          color: "rgba(107, 114, 128, 1)",
          font: {
            size: 12,
            weight: "normal",
          },
        },
        grid: {
          color: "rgba(243, 244, 246, 1)",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Top Workflows by Minutes Consumed
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={data.length}>All</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      <div className="h-[400px]">
        {chartType === "bar" && (
          <Bar ref={chartRef} data={chartData} options={options} />
        )}
        {chartType === "pie" && (
          <Pie ref={chartRef} data={chartData} options={options} />
        )}
        {chartType === "doughnut" && (
          <Doughnut ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default WorkflowChart;
