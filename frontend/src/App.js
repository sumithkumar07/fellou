import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import BrowserInterface from './components/BrowserInterface';
import { AIProvider } from './contexts/AIContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { BrowserProvider } from './contexts/BrowserContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Fellou-style loading animation */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-500/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">Emergent AI</h1>
            <p className="text-gray-400 text-sm">The World's First Agentic Browser</p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AIProvider>
        <WorkflowProvider>
          <BrowserProvider>
            <div className="App h-screen w-screen overflow-hidden bg-dark-900">
              <BrowserInterface />
            </div>
          </BrowserProvider>
        </WorkflowProvider>
      </AIProvider>
    </Router>
  );
}

export default App;