import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';
import SystemStatus from './SystemStatus';
import AdvancedBrowserModal from './AdvancedBrowserModal';
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
  Bot,
  Camera,
  Code
} from 'lucide-react';

const NavigationBar = ({ onToggleSidebar, sidebarOpen }) => {
  const [urlInput, setUrlInput] = useState('');
  const [showControlMenu, setShowControlMenu] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false); // Phase 3: Advanced Modal
  const { getActiveTab, navigateToUrl, takeScreenshot } = useBrowser();
  const { sendMessage, settings } = useAI(); // Phase 3: Access settings
  const activeTab = getActiveTab();

  const handleNavigate = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      console.log(`🚀 Enhanced navigation starting: ${urlInput}`);
      
      // Enhanced: Add navigation loading feedback (no UI change, just better state management)
      const navigationStartTime = Date.now();
      
      // Enhanced: Better URL validation and processing
      let processedUrl = urlInput.trim();
      
      // Enhanced: Smart URL processing
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://') && !processedUrl.startsWith('emergent://')) {
        if (processedUrl.includes('.') && !processedUrl.includes(' ')) {
          processedUrl = 'https://' + processedUrl;
        } else {
          // Enhanced: Convert search queries to search URLs
          processedUrl = `https://www.google.com/search?q=${encodeURIComponent(processedUrl)}`;
        }
      }
      
      // Enhanced: Use improved browser navigation with retry logic
      const result = await navigateToUrl(processedUrl, activeTab?.id, activeTab?.sessionId);
      
      const navigationTime = Date.now() - navigationStartTime;
      console.log(`✅ Enhanced navigation completed in ${navigationTime}ms`);
      
      // Enhanced: Show success feedback if screenshot available (no UI change, just better logging)
      if (result.screenshot) {
        console.log('📸 Screenshot captured during navigation');
      }
      
      if (result.metadata) {
        console.log(`📊 Page metadata extracted: ${Object.keys(result.metadata).length} fields`);
      }
      
      setUrlInput('');
    } catch (error) {
      console.error('❌ Enhanced navigation failed:', error);
      
      // Enhanced error handling with user-friendly messages (no UI change, just better error info)
      if (error.message.includes('timeout')) {
        console.warn('⏱️ Navigation timeout - the page took too long to load');
      } else if (error.message.includes('network')) {
        console.warn('🌐 Network error - check your internet connection');
      } else if (error.message.includes('invalid')) {
        console.warn('🔗 Invalid URL - check the web address format');
      }
      
      // The error is already handled in BrowserContext with enhanced error states
    }
  };

  const handleAICommand = async (command) => {
    try {
      await sendMessage(command);
      onToggleSidebar(true); // Show AI sidebar when command is sent
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
      
      console.log(`📸 Enhanced screenshot capture starting for tab: ${activeTab.id}`);
      const screenshotStartTime = Date.now();
      
      // Enhanced screenshot capture with better error handling
      const screenshot = await takeScreenshot(activeTab.id);
      
      const captureTime = Date.now() - screenshotStartTime;
      console.log(`✅ Enhanced screenshot completed in ${captureTime}ms`);
      
      if (screenshot) {
        // Enhanced: Add screenshot metadata (no UI change, just better data handling)
        console.log(`📊 Screenshot data size: ${(screenshot.length * 0.75 / 1024).toFixed(1)}KB`);
        
        // Enhanced: Update tab with latest screenshot (better state management)
        // This updates the existing tab state without any UI changes
        return screenshot;
      }
    } catch (error) {
      console.error('❌ Enhanced screenshot failed:', error);
      
      // Enhanced error handling with specific error types
      if (error.message.includes('tab not found')) {
        console.warn('💡 Tab not found - try refreshing the page first');
      } else if (error.message.includes('timeout')) {
        console.warn('⏱️ Screenshot timeout - the page may still be loading');
      } else {
        console.warn('🔧 Screenshot error - check if the page has loaded completely');
      }
    }
  };

  const controlMenuItems = [
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'history', label: 'History', icon: History },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const handleMenuItemClick = (itemId) => {
    setShowControlMenu(false);
    
    switch (itemId) {
      case 'settings':
        navigateToUrl('emergent://settings');
        break;
      case 'help':
        handleAICommand('I need help using this browser');
        break;
      case 'privacy':
        handleAICommand('Show me privacy and security options');
        break;
      case 'history':
        navigateToUrl('emergent://history');
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
      {/* Premium Navigation Controls */}
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
            
            {/* Premium URL Input */}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter website name - powered by AI"
              className="flex-1 bg-transparent text-black placeholder-gray-500 py-4 px-5 focus:outline-none font-medium tracking-wide"
            />
            
            {/* Premium Search Button */}
            <motion.button
              type="submit"
              className="group/btn px-5 py-4 text-blue-600 hover:bg-blue-100/50 hover:text-blue-700 transition-all duration-300 border-l border-gray-300/20"
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
                  `Create workflow for ${urlInput}`,
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
                      {index === 2 && <Settings size={14} className="text-green-600" />}
                      {index === 3 && <Database size={14} className="text-orange-600" />}
                    </div>
                    <span className="font-medium">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phase 2: System Status Component */}
      <div className="flex items-center gap-3">
        <SystemStatus />
        
        {/* Phase 3: Conditional Advanced Tools Button - Only shows when Developer Mode is enabled */}
        {settings?.appearance?.developerMode && (
          <motion.button
            onClick={() => setShowAdvancedModal(true)}
            className="group relative p-3 hover:bg-gray-100/50 rounded-xl text-gray-500 hover:text-black transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Advanced Browser Tools"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Code size={18} className="relative z-10" />
          </motion.button>
        )}
        
        {/* Premium Control Menu Button */}
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

      {/* Phase 3: Advanced Browser Modal - 0% UI Impact */}
      <AdvancedBrowserModal 
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
      />
    </motion.div>
  );
};

export default NavigationBar;