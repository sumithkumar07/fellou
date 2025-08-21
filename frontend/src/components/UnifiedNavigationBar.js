import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Lock, 
  Star,
  Menu,
  Layout,
  Zap,
  Search,
  X,
  Plus,
  Globe
} from 'lucide-react';

const UnifiedNavigationBar = ({ onToggleSidebar, onToggleSplitView, sidebarOpen, splitView }) => {
  const [urlInput, setUrlInput] = useState('');
  const { tabs, activeTabId, switchToTab, closeTab, createNewTab, getActiveTab, navigateToUrl, addBookmark } = useBrowser();
  const { sendMessage } = useAI();
  const activeTab = getActiveTab();

  const handleNavigate = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      await navigateToUrl(urlInput, activeTab?.id);
      setUrlInput('');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleAICommand = async (command) => {
    await sendMessage(`Navigate to: ${command}`);
  };

  return (
    <div className="h-14 bg-dark-800 border-b border-dark-700 flex items-center px-4 gap-3">
      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Back"
        >
          <ChevronLeft size={16} className="text-gray-400" />
        </motion.button>
        
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Forward"
        >
          <ChevronRight size={16} className="text-gray-400" />
        </motion.button>
        
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Refresh"
        >
          <RotateCcw size={16} className="text-gray-400" />
        </motion.button>

        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateToUrl('emergent://home')}
          title="Home"
        >
          <Home size={16} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center gap-1">
        <AnimatePresence>
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer group min-w-0 max-w-[180px] ${
                tab.active 
                  ? 'bg-dark-700 border border-dark-600' 
                  : 'hover:bg-dark-700/50'
              }`}
              onClick={() => switchToTab(tab.id)}
            >
              {/* Favicon or loading indicator */}
              <div className="flex-shrink-0">
                {tab.loading ? (
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : tab.favicon ? (
                  <img src={tab.favicon} alt="" className="w-3 h-3" />
                ) : (
                  <Globe size={12} className="text-gray-400" />
                )}
              </div>
              
              {/* Tab title */}
              <span className="text-xs truncate flex-1 min-w-0 text-gray-300">
                {tab.title || 'New Tab'}
              </span>
              
              {/* Close button */}
              <motion.button
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-dark-600 rounded transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={10} className="text-gray-400" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* New tab button */}
        <motion.button
          className="p-1.5 hover:bg-dark-700 rounded-lg"
          onClick={() => createNewTab()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="New Tab"
        >
          <Plus size={14} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Address bar with AI integration */}
      <div className="flex-1 relative">
        <form onSubmit={handleNavigate} className="relative">
          <div className="relative flex items-center bg-dark-700 border border-dark-600 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
            {/* Security indicator */}
            <div className="px-3 py-2 flex items-center gap-2">
              <Lock size={12} className="text-green-500" />
              <span className="text-xs text-gray-400 hidden sm:block">Secure</span>
            </div>
            
            {/* URL input */}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name - powered by AI"
              className="flex-1 bg-transparent text-white placeholder-gray-400 py-2 px-2 focus:outline-none text-sm"
            />
            
            {/* AI search button */}
            <motion.button
              type="submit"
              className="px-3 py-2 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={14} />
            </motion.button>
          </div>
        </form>

        {/* AI suggestions dropdown */}
        {urlInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-50"
          >
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">AI Suggestions</div>
              <motion.div
                className="p-2 hover:bg-dark-600 rounded cursor-pointer flex items-center gap-2"
                onClick={() => handleAICommand(urlInput)}
                whileHover={{ x: 4 }}
              >
                <Zap size={12} className="text-blue-500" />
                <span className="text-sm">Ask AI: "{urlInput}"</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Bookmark button */}
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => activeTab && addBookmark(activeTab.url, activeTab.title)}
          title="Bookmark"
        >
          <Star size={16} className="text-gray-400" />
        </motion.button>

        {/* Split view toggle */}
        <motion.button 
          className={`p-2 hover:bg-dark-700 rounded-lg ${splitView ? 'text-blue-500' : 'text-gray-400'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSplitView}
          title="Split View"
        >
          <Layout size={16} />
        </motion.button>

        {/* Sidebar toggle */}
        <motion.button 
          className={`p-2 hover:bg-dark-700 rounded-lg ${sidebarOpen ? 'text-blue-500' : 'text-gray-400'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={ scale: 0.95 }}
          onClick={onToggleSidebar}
          title="AI Sidebar"
        >
          <Menu size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default UnifiedNavigationBar;