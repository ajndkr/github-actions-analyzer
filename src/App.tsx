import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import WorkflowChart from './components/WorkflowChart';
import WorkflowTable from './components/WorkflowTable';
import ThemeToggle from './components/ThemeToggle';
import { WorkflowData, SummaryStats } from './types';
import { calculateSummaryStats } from './utils/dataProcessing';
import { Github, BarChart3, FileText, Loader2 } from 'lucide-react';
import { useAnalysisStore } from './store/analysisStore';

function App() {
  const [workflowData, setWorkflowData] = useState<WorkflowData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useAnalysisStore(state => state.theme);
  
  const hasData = workflowData.length > 0;
  const summaryStats: SummaryStats = hasData 
    ? calculateSummaryStats(workflowData)
    : {
        totalWorkflows: 0,
        totalMinutes: 0,
        totalCost: 0,
        topConsumerPercentage: 0,
        topConsumerName: ''
      };

  return (
    <div className={`min-h-screen ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-white to-indigo-50 text-gray-800' 
        : 'bg-gradient-to-br from-gray-900 to-black text-white'
    }`}>
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Github className={`w-10 h-10 mr-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`} />
            <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              GitHub Actions Analyzer
            </h1>
            <ThemeToggle />
          </div>
          <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} max-w-2xl mx-auto`}>
            Upload your GitHub Actions usage CSV file to analyze workflow consumption patterns and identify optimization opportunities.
          </p>
        </header>

        <main className="space-y-8">
          {!hasData && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Upload your GitHub Actions CSV file
              </h2>
              <FileUpload 
                setWorkflowData={setWorkflowData} 
                setIsLoading={setIsLoading}
                setError={setError}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="mt-4 flex justify-center items-center text-indigo-600">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing your data...
                </div>
              )}
            </div>
          )}

          {hasData && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  GitHub Actions Usage Analysis
                </h2>
                <button
                  onClick={() => setWorkflowData([])}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Upload Another File
                </button>
              </div>

              <DataSummary stats={summaryStats} />
              
              <WorkflowChart data={workflowData} />
              
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Top Workflows by Usage
                  </h3>
                  <WorkflowTable data={workflowData.slice(0, 10)} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    All Workflows by Usage
                  </h3>
                  <WorkflowTable data={workflowData} />
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="mt-12" />
      </div>
    </div>
  );
}

export default App;