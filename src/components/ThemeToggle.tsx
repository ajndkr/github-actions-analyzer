import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAnalysisStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-colors
        ${theme === 'light' 
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
          : 'bg-gray-700 hover:bg-gray-600 text-white'}
      `}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;