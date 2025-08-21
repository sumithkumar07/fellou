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
    console.log(`Clicked: ${itemId}`);
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
      {/* Premium Navigation Controls */}
      <div className="flex items-center gap-1">
        {[
          { icon: ChevronLeft, tooltip: 'Go Back' },
          { icon: ChevronRight, tooltip: 'Go Forward' },
          { icon: RotateCcw, tooltip: 'Refresh', special: 'rotate' },
          { icon: Home, tooltip: 'Home', action: () => navigateToUrl('emergent://home') }
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
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Icon size={18} className="relative z-10" />
          </motion.button>
        ))}
      </div>

      {/* Premium Address Bar */}
      <div className="flex-1 relative">
        <form onSubmit={handleNavigate} className="relative group">
          {/* Premium glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-gray-100/50 backdrop-blur-2xl border border-gray-300/30 rounded-2xl overflow-hidden focus-within:border-blue-500/50 focus-within:bg-gray-50/80 group-hover:border-gray-400/50 transition-all duration-300 shadow-lg">
            {/* Premium Security Indicator */}
            <div className="px-5 py-4 flex items-center gap-3 border-r border-white/10">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
              >
                <Lock size={16} className="text-green-400 drop-shadow-sm" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm" />
              </motion.div>
              <span className="text-xs text-slate-400 hidden sm:block font-semibold tracking-wide">SECURE</span>
            </div>
            
            {/* Premium URL Input */}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name - powered by AI"
              className="flex-1 bg-transparent text-white placeholder-slate-400 py-4 px-5 focus:outline-none font-medium tracking-wide"
            />
            
            {/* Premium Search Button */}
            <motion.button
              type="submit"
              className="group/btn px-5 py-4 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 border-l border-white/10"
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

        {/* Premium AI Suggestions Dropdown */}
        <AnimatePresence>
          {urlInput && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-full left-0 right-0 mt-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%),
                  radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
                `,
                boxShadow: `
                  0 24px 64px rgba(0, 0, 0, 0.4),
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
            >
              <div className="p-4">
                <div className="text-xs text-slate-400 mb-4 px-4 font-semibold tracking-wide flex items-center gap-2">
                  <Bot size={14} className="text-blue-400" />
                  AI SUGGESTIONS
                </div>
                <motion.div
                  className="group p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-4 transition-all duration-300"
                  onClick={() => handleAICommand(urlInput)}
                  whileHover={{ x: 6, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white mb-1">Ask AI Assistant</div>
                    <div className="text-sm text-slate-400 truncate font-medium">"{urlInput}"</div>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Action Button */}
      <div className="flex items-center">
        <div className="relative">
          <motion.button 
            className="group relative p-3 hover:bg-gray-100/50 rounded-xl text-gray-500 hover:text-black transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowControlMenu(!showControlMenu)}
            title="Control & Customization"
          >
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <MoreHorizontal size={18} className="relative z-10" />
          </motion.button>

          {/* Premium Control Menu Dropdown */}
          <AnimatePresence>
            {showControlMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute right-0 top-full mt-3 w-72 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
                style={{
                  background: `
                    linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%),
                    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
                  `,
                  boxShadow: `
                    0 24px 64px rgba(0, 0, 0, 0.4),
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                }}
              >
                <div className="py-3">
                  <div className="px-5 py-3 text-xs text-slate-400 border-b border-white/10 font-bold tracking-wider flex items-center gap-2">
                    <Settings size={14} />
                    CONTROL & CUSTOMIZATION
                  </div>
                  {controlMenuItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className="group w-full px-5 py-4 text-left text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-4"
                      whileHover={{ x: 6 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                        <item.icon size={16} />
                      </div>
                      <span className="font-semibold tracking-wide">{item.label}</span>
                      <div className="ml-auto w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ChevronRight size={12} className="text-slate-500" />
                      </div>
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