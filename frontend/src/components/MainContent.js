import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBrowser } from '../contexts/BrowserContext';
import WelcomePage from './WelcomePage';
import { Globe, Lock, AlertCircle, Loader } from 'lucide-react';

const MainContent = ({ splitView, sidebarOpen }) => {
  const { getActiveTab } = useBrowser();
  const activeTab = getActiveTab();
  const [leftPanelUrl, setLeftPanelUrl] = useState(null);

  const renderTabContent = (tab) => {
    if (!tab) {
      return <div className="flex items-center justify-center h-full text-gray-400">No active tab</div>;
    }

    // Handle special URLs
    if (tab.url === 'emergent://welcome' || tab.url === 'emergent://new-tab' || tab.url === 'emergent://home') {
      return <WelcomePage />;
    }

    // Handle loading state
    if (tab.loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading {tab.url}...</p>
          </div>
        </div>
      );
    }

    // Handle error state
    if (tab.error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load page</h2>
            <p className="text-gray-400 mb-4">{tab.error}</p>
            <button className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Render actual web content (simulated for now)
    return (
      <div className="h-full bg-white">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{tab.url}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{tab.title}</h1>
            
            <div className="prose prose-lg max-w-none text-gray-800">
              {tab.content ? (
                <div dangerouslySetInnerHTML={{ __html: tab.content }} />
              ) : (
                <div>
                  <p className="mb-4">This is a simulated web page for demonstration purposes.</p>
                  <p className="mb-4">In the full implementation, this would display actual web content using a browser engine.</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Fellou AI Features:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Deep Action workflow automation</li>
                      <li>Cross-platform integration</li>
                      <li>AI-powered research and reports</li>
                      <li>Shadow window background processing</li>
                      <li>Timeline and multi-task management</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {splitView ? (
        // Split view layout
        <div className="flex-1 flex">
          {/* Left panel */}
          <div className="flex-1 border-r border-dark-600 flex flex-col">
            <div className="h-8 bg-dark-700 border-b border-dark-600 flex items-center px-3">
              <Lock size={12} className="text-green-500 mr-2" />
              <span className="text-xs text-gray-400 truncate">
                {leftPanelUrl || activeTab?.url || 'New Tab'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderTabContent(activeTab)}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col">
            <div className="h-8 bg-dark-700 border-b border-dark-600 flex items-center px-3">
              <Lock size={12} className="text-green-500 mr-2" />
              <span className="text-xs text-gray-400 truncate">
                Split View - Right Panel
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <WelcomePage />
            </div>
          </div>
        </div>
      ) : (
        // Single view layout
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {renderTabContent(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;