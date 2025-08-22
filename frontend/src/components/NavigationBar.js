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
  Download,
  Bookmark,
  HelpCircle,
  Shield,
  Bot,
  Camera
} from 'lucide-react';

const NavigationBar = ({ onToggleSidebar, sidebarOpen }) => {
  const [urlInput, setUrlInput] = useState('');
  const [showControlMenu, setShowControlMenu] = useState(false);
  const { getActiveTab, navigateToUrl, takeScreenshot } = useBrowser();
  const { sendMessage } = useAI();
  const activeTab = getActiveTab();

  const handleNavigate = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      console.log(`🚀 Navigation starting: ${urlInput}`);
      
      let processedUrl = urlInput.trim();
      
      // Smart URL processing
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://') && !processedUrl.startsWith('emergent://')) {
        if (processedUrl.includes('.') && !processedUrl.includes(' ')) {
          processedUrl = 'https://' + processedUrl;
        } else {
          processedUrl = `https://www.google.com/search?q=${encodeURIComponent(processedUrl)}`;
        }
      }
      
      await navigateToUrl(processedUrl, activeTab?.id, activeTab?.sessionId);
      setUrlInput('');
    } catch (error) {
      console.error('❌ Navigation failed:', error);
    }
  };

  const handleAICommand = async (command) => {
    try {
      await sendMessage(command);
      onToggleSidebar(true);
    } catch (error) {
      console.error('AI command failed:', error);
    }
  };

  const handleScreenshot = async () => {
    try {
      if (!activeTab) {
        console.log('⚠️ No active tab to screenshot');
        return;
      }
      
      console.log(`📸 Screenshot capture starting for tab: ${activeTab.id}`);
      await takeScreenshot(activeTab.id);
    } catch (error) {
      console.error('❌ Screenshot failed:', error);
    }
  };

  const controlMenuItems = [
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const handleMenuItemClick = (itemId) => {
    setShowControlMenu(false);
    
    switch (itemId) {
      case 'help':
        handleAICommand('I need help using this browser');
        break;
      case 'privacy':
        handleAICommand('Show me privacy and security options');
        break;
      case 'downloads':
        handleAICommand('Show my downloads and files');
        break;
      case 'bookmarks':
        handleAICommand('Help me manage my bookmarks');
        break;
      default:
        console.log(`Clicked: ${itemId}`);
    }
  };

  return (
    <motion.div 
      className="h-16 bg-gradient-to-r from-white/98 via-gray-50/95 to-white/98 backdrop-blur-2xl border-b border-gray-200/50 flex items-center px-6 gap-6 relative shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%),
          radial-gradient(circle at 10% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 90% 50%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)
        `,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.05),
          0 1px 0 rgba(0, 0, 0, 0.05)
        `
      }}
    >
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        {[
          { icon: ChevronLeft, tooltip: 'Go Back' },
          { icon: ChevronRight, tooltip: 'Go Forward' },
          { icon: RotateCcw, tooltip: 'Refresh', special: 'rotate' },
          { icon: Home, tooltip: 'Home', action: () => navigateToUrl('emergent://home') },
          { icon: Camera, tooltip: 'Screenshot', action: handleScreenshot }
        ].map(({ icon: Icon, tooltip, special, action }, index) => (
          <motion.button 
            key={tooltip}
            className="group relative p-3 hover:bg-gray-100/50 rounded-xl text-gray-500 hover:text-black transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              ...(special === 'rotate' ? { rotate: -90 } : {})
            }}
            whileTap={{ scale: 0.95 }}
            onClick={action}
            title={tooltip}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon size={18} className="relative z-10" />
          </motion.button>
        ))}
      </div>

      {/* Address Bar */}
      <div className="flex-1 relative">
        <form onSubmit={handleNavigate} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-gray-100/50 backdrop-blur-2xl border border-gray-300/30 rounded-2xl overflow-hidden focus-within:border-blue-500/50 focus-within:bg-gray-50/80 group-hover:border-gray-400/50 transition-all duration-300 shadow-lg">
            {/* Security Indicator */}
            <div className="px-5 py-4 flex items-center gap-3 border-r border-gray-300/20">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
              >
                <Lock size={16} className="text-green-400 drop-shadow-sm" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm" />
              </motion.div>
              <span className="text-xs text-gray-600 hidden sm:block font-semibold tracking-wide">SECURE</span>
            </div>
            
            {/* URL Input */}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name - powered by AI"
              className="flex-1 bg-transparent text-black placeholder-gray-500 py-4 px-5 focus:outline-none font-medium tracking-wide"
            />
            
            {/* Search Button */}
            <motion.button
              type="submit"
              className="group/btn px-5 py-4 text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 transition-all duration-300 border-l border-gray-300/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Search size={18} />
                <motion.div
                  className="absolute inset-0 bg-blue-400/20 rounded-lg blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.button>
          </div>
        </form>

        {/* AI Suggestions Dropdown */}
        <AnimatePresence>
          {urlInput && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                boxShadow: `
                  0 20px 64px rgba(0, 0, 0, 0.12),
                  0 8px 32px rgba(0, 0, 0, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9)
                `
              }}
            >
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2 font-semibold tracking-wide">
                  <Bot size={12} />
                  AI-POWERED SUGGESTIONS
                </div>
                {[
                  `Navigate to ${urlInput}`,
                  `Search for "${urlInput}" with AI analysis`,
                  `Analyze and extract data from ${urlInput}`
                ].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => {
                      if (index === 0) {
                        handleNavigate({ preventDefault: () => {} });
                      } else {
                        handleAICommand(suggestion);
                      }
                      setUrlInput('');
                    }}
                    className="w-full p-3 text-left text-gray-700 hover:bg-blue-50/80 rounded-xl transition-all duration-200 flex items-center gap-3 group/suggestion"
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center group-hover/suggestion:from-blue-500/20 group-hover/suggestion:to-purple-500/20 transition-all duration-200">
                      {index === 0 && <Search size={14} className="text-blue-600" />}
                      {index === 1 && <Bot size={14} className="text-purple-600" />}
                      {index === 2 && <Download size={14} className="text-green-600" />}
                    </div>
                    <span className="font-medium">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Menu */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.button 
            className="group relative p-3 hover:bg-gray-100/50 rounded-xl text-gray-500 hover:text-black transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowControlMenu(!showControlMenu)}
            title="Control & Customization"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <MoreHorizontal size={18} className="relative z-10" />
          </motion.button>

          {/* Control Menu Dropdown */}
          <AnimatePresence>
            {showControlMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
                style={{
                  boxShadow: `
                    0 24px 64px rgba(0, 0, 0, 0.12),
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9)
                  `
                }}
              >
                <div className="py-3">
                  <div className="px-5 py-3 text-xs text-gray-600 border-b border-gray-200/50 font-bold tracking-wider flex items-center gap-2">
                    <MoreHorizontal size={14} />
                    CONTROL & CUSTOMIZATION
                  </div>
                  {controlMenuItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className="group w-full px-5 py-4 text-left text-gray-700 hover:text-black hover:bg-gray-100/50 transition-all duration-300 flex items-center gap-4"
                      whileHover={{ x: 6 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="w-10 h-10 bg-gray-100/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-gray-200/50 border border-gray-200/30 group-hover:border-gray-300/50 transition-all duration-300">
                        <item.icon size={16} />
                      </div>
                      <span className="font-semibold tracking-wide">{item.label}</span>
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
    </motion.div>
  );
};

export default NavigationBar;