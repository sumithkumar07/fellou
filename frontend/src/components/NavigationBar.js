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
  Search,
  MoreHorizontal,
  History,
  Download,
  Settings,
  Bookmark,
  HelpCircle,
  Shield,
  Bot
} from 'lucide-react';

const NavigationBar = ({ onToggleSidebar, sidebarOpen }) => {
  const [urlInput, setUrlInput] = useState('');
  const [showControlMenu, setShowControlMenu] = useState(false);
  const { getActiveTab, navigateToUrl } = useBrowser();
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

  const controlMenuItems = [
    { id: 'history', label: 'History', icon: History },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
  ];

  const handleMenuItemClick = (itemId) => {
    setShowControlMenu(false);
    // Handle menu item actions here
    console.log(`Clicked: ${itemId}`);
  };

  return (
    <div className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center px-6 gap-4 relative shadow-lg">
      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        <motion.button 
          className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={18} />
        </motion.button>
        
        <motion.button 
          className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={18} />
        </motion.button>
        
        <motion.button 
          className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.05, rotate: -90 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={18} />
        </motion.button>

        <motion.button 
          className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateToUrl('emergent://home')}
        >
          <Home size={18} />
        </motion.button>
      </div>

      {/* Enhanced address bar with AI integration */}
      <div className="flex-1 relative">
        <form onSubmit={handleNavigate} className="relative group">
          <div className="relative flex items-center bg-slate-800/60 backdrop-blur-xl border border-slate-600/50 rounded-xl overflow-hidden focus-within:border-blue-500/70 focus-within:shadow-lg focus-within:shadow-blue-500/20 transition-all duration-300">
            {/* Security indicator */}
            <div className="px-4 py-3 flex items-center gap-3 border-r border-slate-600/30">
              <Lock size={14} className="text-green-400" />
              <span className="text-xs text-slate-400 hidden sm:block font-medium">Secure</span>
            </div>
            
            {/* URL input */}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name - powered by AI"
              className="flex-1 bg-transparent text-white placeholder-slate-400 py-3 px-4 focus:outline-none text-sm font-medium"
            />
            
            {/* AI search button */}
            <motion.button
              type="submit"
              className="px-4 py-3 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-200 border-l border-slate-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={16} />
            </motion.button>
          </div>
        </form>

        {/* Enhanced AI suggestions dropdown */}
        <AnimatePresence>
          {urlInput && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3">
                <div className="text-xs text-slate-400 mb-3 px-3 font-medium">AI Suggestions</div>
                <motion.div
                  className="p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer flex items-center gap-3 transition-all duration-200"
                  onClick={() => handleAICommand(urlInput)}
                  whileHover={{ x: 4, backgroundColor: 'rgba(100, 116, 139, 0.1)' }}
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Bot size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Ask AI Assistant</div>
                    <div className="text-xs text-slate-400 truncate">"{urlInput}"</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Control/Customization Menu */}
        <div className="relative">
          <motion.button 
            className="p-2.5 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowControlMenu(!showControlMenu)}
            title="Control & Customization"
          >
            <MoreHorizontal size={18} />
          </motion.button>

          {/* Enhanced Control Menu Dropdown */}
          <AnimatePresence>
            {showControlMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute right-0 top-full mt-3 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="py-2">
                  <div className="px-4 py-3 text-xs text-slate-400 border-b border-slate-600/30 font-medium">
                    Control & Customization
                  </div>
                  {controlMenuItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center gap-3"
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                        <item.icon size={16} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay to close menu */}
          {showControlMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowControlMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;