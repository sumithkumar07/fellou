import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Search
} from 'lucide-react';

const NavigationBar = ({ onToggleSidebar, onToggleSplitView, sidebarOpen, splitView }) => {
  const [urlInput, setUrlInput] = useState('');
  const { getActiveTab, navigateToUrl, addBookmark } = useBrowser();
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
    <div className="h-14 bg-dark-800 border-b border-dark-700 flex items-center px-4 gap-2">
      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={18} className="text-gray-400" />
        </motion.button>
        
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={18} className="text-gray-400" />
        </motion.button>
        
        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={18} className="text-gray-400" />
        </motion.button>

        <motion.button 
          className="p-2 hover:bg-dark-700 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateToUrl('emergent://home')}
        >
          <Home size={18} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Address bar with AI integration */}
      <div className="flex-1 relative">
        <form onSubmit={handleNavigate} className="relative">
          <div className="relative flex items-center bg-dark-700 border border-dark-600 rounded-lg overflow-hidden focus-within:border-primary-500 transition-colors">
            {/* Security indicator */}
            <div className="px-3 py-2 flex items-center gap-2">
              <Lock size={14} className="text-green-500" />
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
              className="px-3 py-2 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={16} />
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
                <Zap size={14} className="text-primary-500" />
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
        >
          <Star size={18} className="text-gray-400" />
        </motion.button>

        {/* Split view toggle */}
        <motion.button 
          className={`p-2 hover:bg-dark-700 rounded-lg ${splitView ? 'text-primary-500' : 'text-gray-400'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSplitView}
        >
          <Layout size={18} />
        </motion.button>

        {/* Sidebar toggle */}
        <motion.button 
          className={`p-2 hover:bg-dark-700 rounded-lg ${sidebarOpen ? 'text-primary-500' : 'text-gray-400'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
        >
          <Menu size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default NavigationBar;