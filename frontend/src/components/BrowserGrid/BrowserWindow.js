import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBrowser } from '../../contexts/BrowserContext';
import { useAI } from '../../contexts/AIContext';
import FellowStyleWelcome from '../FellowStyleWelcome';
import { 
  Globe, 
  Lock, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  Maximize2,
  Minimize2,
  X,
  Loader,
  AlertCircle
} from 'lucide-react';

const BrowserWindow = ({ window, isActive, onNavigate, onActivate }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const inputRef = useRef(null);
  const { navigateToUrl } = useBrowser();
  const { sendMessage } = useAI();

  useEffect(() => {
    setUrlInput(window.url);
  }, [window.url]);

  const handleNavigation = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate real browser navigation
      const result = await navigateToUrl(urlInput, window.id);
      onNavigate(urlInput, result.title || urlInput);
      setPageContent(result.content_preview);
    } catch (err) {
      setError(err.message);
      onNavigate(urlInput, 'Error loading page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAICommand = async () => {
    await sendMessage(`Navigate to: ${urlInput}`);
  };

  const renderPageContent = () => {
    // Handle special emergent:// URLs
    if (window.url === 'emergent://welcome' || window.url === 'emergent://new-tab') {
      return <FellowStyleWelcome />;
    }

    // Handle loading state
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center bg-dark-900">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading {window.url}...</p>
          </div>
        </div>
      );
    }

    // Handle error state
    if (error) {
      return (
        <div className="h-full flex items-center justify-center bg-dark-900">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load page</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              className="btn-primary px-4 py-2"
              onClick={() => handleNavigation({ preventDefault: () => {} })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Render simulated web content (in real implementation, this would be Chromium)
    return (
      <div className="h-full bg-white overflow-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{window.url}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{window.title}</h1>
            
            <div className="prose prose-lg max-w-none text-gray-800">
              {pageContent ? (
                <div dangerouslySetInnerHTML={{ __html: pageContent }} />
              ) : (
                <div>
                  <p className="mb-4">This is a simulated web page for demonstration purposes.</p>
                  <p className="mb-4">In the full implementation, this would display actual web content using Chromium browser engine.</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Fellou AI Features:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Deep Action workflow automation</li>
                      <li>Cross-platform integration (50+ platforms)</li>
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
    <div 
      className={`h-full flex flex-col bg-dark-800 ${
        isActive ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={onActivate}
    >
      {/* Window Controls - Fellou Style */}
      <div className="h-8 bg-dark-700 flex items-center justify-between px-3 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="flex-1 text-center">
          <span className="text-xs text-gray-400 truncate">{window.title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 flex items-center justify-center hover:bg-dark-600 rounded">
            <Minimize2 size={10} className="text-gray-400" />
          </button>
          <button className="w-4 h-4 flex items-center justify-center hover:bg-dark-600 rounded">
            <Maximize2 size={10} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Bar - Browser Style */}
      <div className="h-10 bg-dark-700 border-b border-dark-600 flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-dark-600 rounded">
            <ArrowLeft size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-dark-600 rounded">
            <ArrowRight size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-dark-600 rounded">
            <RefreshCw size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-dark-600 rounded">
            <Home size={14} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleNavigation} className="flex-1">
          <div className="flex items-center bg-dark-800 border border-dark-600 rounded px-2 py-1">
            <Lock size={12} className="text-green-500 mr-2" />
            <input
              ref={inputRef}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search..."
              className="flex-1 bg-transparent text-white text-xs placeholder-gray-400 outline-none"
            />
            {isLoading && <Loader size={12} className="animate-spin text-primary-500 ml-2" />}
          </div>
        </form>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {renderPageContent()}
      </div>

      {/* Window Status Bar */}
      <div className="h-5 bg-dark-700 border-t border-dark-600 flex items-center justify-between px-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Globe size={10} />
          <span>Connected</span>
        </div>
        <div className="text-xs text-gray-500">
          {isActive ? 'Active' : 'Background'}
        </div>
      </div>
    </div>
  );
};

export default BrowserWindow;