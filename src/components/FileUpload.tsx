import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { UploadCloud, FileText } from 'lucide-react';
import { WorkflowData } from '../types';

interface FileUploadProps {
  setWorkflowData: (data: WorkflowData[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  setWorkflowData, 
  setIsLoading,
  setError
}) => {
  const processFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          const errorMessage = results.errors
            .map(err => err.message)
            .filter((msg, index, arr) => arr.indexOf(msg) === index)
            .join(', ');
          setError(`Error parsing CSV: ${errorMessage}`);
          setIsLoading(false);
          return;
        }
        
        const data = results.data as any[];
        if (data.length === 0) {
          setError('The CSV file appears to be empty');
          setIsLoading(false);
          return;
        }
        
        // Check if the required columns exist
        const firstRow = data[0] || {};
        if (!('workflow_name' in firstRow) || 
            !('quantity' in firstRow) || 
            !('net_amount' in firstRow)) {
          const availableColumns = Object.keys(firstRow).join(', ');
          setError(`CSV must contain workflow_name, quantity, and net_amount columns. Found columns: ${availableColumns}`);
          setIsLoading(false);
          return;
        }
        
        // Filter and transform the data
        const workflowStats: Record<string, { minutes: number; cost: number; runs: number }> = {};
        
        // Aggregate workflow data
        data.forEach(row => {
          if (!row.workflow_name || row.workflow_name.trim() === '' || row.workflow_name === 'null') return;
          
          const name = row.workflow_name.trim();
          const minutes = parseFloat(row.quantity) || 0;
          const cost = parseFloat(row.net_amount) || 0;
          
          if (!workflowStats[name]) {
            workflowStats[name] = { minutes: 0, cost: 0, runs: 0 };
          }
          
          workflowStats[name].minutes += minutes;
          workflowStats[name].cost += cost;
          workflowStats[name].runs++;
        });
        
        // Transform to final format
        const transformedData = Object.entries(workflowStats)
          .map(([name, stats]) => ({
            workflow_name: name,
            quantity: Math.round(stats.minutes),
            net_amount: stats.cost,
            runs: stats.runs,
            avgMinutes: stats.minutes / stats.runs
          }))
          .sort((a, b) => b.quantity - a.quantity);
        
        setWorkflowData(transformedData);
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  }, [setWorkflowData, setIsLoading, setError]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    processFile(file);
  }, [processFile, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDropRejected: (files) => {
      setError('Please upload a valid CSV file');
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        flex flex-col items-center justify-center w-full p-8 
        border-2 border-dashed rounded-lg cursor-pointer
        transition-all duration-300 
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        {isDragActive ? (
          <UploadCloud className="w-16 h-16 mb-4 text-blue-500 animate-bounce transition-transform" />
        ) : (
          <FileText className="w-16 h-16 mb-4 text-gray-400" />
        )}
        <p className="mb-2 text-lg font-medium text-gray-700">
          {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
        </p>
        <p className="text-sm text-gray-500">
          or click to browse files
        </p>
        <p className="mt-2 text-xs text-gray-400">
          CSV should contain workflow_name, quantity (minutes), and net_amount (cost) columns
        </p>
      </div>
    </div>
  );
};

export default FileUpload;