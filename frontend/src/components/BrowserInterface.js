import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from './TabBar';
import NavigationBar from './NavigationBar';
import AISidebar from './AISidebar';
import WelcomePage from '../pages/WelcomePage';
import StatusBar from './StatusBar';

import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';

const BrowserInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const { tabs, activeTabId, getActiveTab, navigateToUrl, createNewTab } = useBrowser();
  const { initWebSocket, sessionId, registerBrowserNavigation } = useAI();

  useEffect(() => {
    if (sessionId) {
      initWebSocket();
    }
  }, [sessionId, initWebSocket]);

  useEffect(() => {
    // Register the Native Browser Engine navigation function with AI context
    console.log(`🔧 Registering Native Browser Engine navigation function`);
    registerBrowserNavigation((url, proxyUrl, nativeBrowser = true) => {
      console.log(`🌐 AI requesting Native Browser Engine navigation to: ${url}`);
      console.log(`🔗 Using proxy URL: ${proxyUrl}`);
      
      // Use Native Browser Engine navigation (full functionality, not screenshots)
      return navigateToUrl(url, proxyUrl, null, nativeBrowser); // nativeBrowser = true
    });
    console.log(`✅ Native Browser Engine navigation function registered successfully`);
  }, [registerBrowserNavigation, navigateToUrl]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAI = () => {
    setAiOpen(!aiOpen);
  };

  const closeAI = () => {
    setAiOpen(false);
  };

  const activeTab = getActiveTab();
  const shouldShowNativeBrowser = activeTab && activeTab.nativeBrowser && activeTab.url !== 'emergent://welcome';
  const shouldShowScreenshot = activeTab && activeTab.screenshot && activeTab.url !== 'emergent://welcome' && !shouldShowNativeBrowser;

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-white via-gray-50 to-gray-100 text-black overflow-hidden will-change-auto">
      {/* Main App Content Area */}
      <motion.div 
        className="flex flex-col"
        animate={{ 
          width: aiOpen ? 'calc(100% - 480px)' : '100%' 
        }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween"
        }}
      >
        {/* Tab Bar */}
        <TabBar />
        
        {/* Navigation Bar */}
        <NavigationBar 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Browser Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {shouldShowNativeBrowser ? (
            // Native Browser Engine - Full Website Functionality
            <div className="flex-1 bg-white overflow-hidden relative">
              <div className="absolute top-2 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                🌐 Native Browser Engine Active - Full Functionality
              </div>
              {console.log('🖥️ Rendering Native Browser iframe with:', {
                url: activeTab.url,
                proxyUrl: activeTab.proxyUrl,
                nativeBrowser: activeTab.nativeBrowser,
                iframeSrc: activeTab.proxyUrl || activeTab.url
              })}
              <iframe 
                src={activeTab.proxyUrl || activeTab.url}
                className="w-full h-full border-0"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: 'none',
                  background: 'white'
                }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
                allow="fullscreen; picture-in-picture; encrypted-media; microphone; camera; geolocation"
                title="Native Browser Engine"
                onLoad={() => {
                  console.log('🌐 Native Browser Engine iframe loaded successfully:', activeTab.url);
                  console.log('🔗 Loaded URL in iframe:', activeTab.proxyUrl || activeTab.url);
                }}
                onError={(e) => {
                  console.error('❌ Native Browser Engine iframe error:', e);
                  console.error('❌ Failed URL:', activeTab.proxyUrl || activeTab.url);
                }}
              />
            </div>
          ) : shouldShowScreenshot ? (
            // Fallback: Screenshot display (legacy mode)
            <div className="flex-1 bg-white overflow-auto relative">
              <div className="absolute top-2 left-4 z-10 bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                📸 Screenshot Mode - Limited Functionality
              </div>
              <img 
                src={`data:image/png;base64,${activeTab.screenshot}`}
                alt="Browser content"
                className="w-full h-auto min-h-full object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          ) : (
            // Welcome Page
            <WelcomePage />
          )}
        </div>
        
        {/* Status Bar */}
        <StatusBar />
      </motion.div>

      {/* Premium AI Assistant Panel */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1],
              type: "tween"
            }}
            className="h-full w-[480px] overflow-hidden fixed right-0 top-0 z-50"
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%),
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)
              `,
              boxShadow: `
                -8px 0 32px rgba(0, 0, 0, 0.1),
                -2px 0 16px rgba(0, 0, 0, 0.05),
                inset 1px 0 0 rgba(0, 0, 0, 0.05)
              `
            }}
          >
            <AISidebar onClose={closeAI} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Floating Action Button */}
      <AnimatePresence mode="wait">
        {!aiOpen && (
          <motion.button
            initial={{ 
              scale: 0, 
              opacity: 0, 
              rotate: -180,
              y: 20
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 0,
              y: 0
            }}
            exit={{ 
              scale: 0, 
              opacity: 0, 
              rotate: 180,
              y: 20
            }}
            transition={{ 
              duration: 0.5, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: aiOpen ? 0 : 0.3
            }}
            className="group fixed bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl flex items-center justify-center z-40 overflow-hidden cursor-pointer"
            style={{
              boxShadow: `
                0 0 0 1px rgba(34, 197, 94, 0.2),
                0 20px 60px rgba(34, 197, 94, 0.4),
                0 40px 120px rgba(34, 197, 94, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
            whileHover={{ 
              scale: 1.05,
              y: -6,
              rotate: [0, -2, 2, 0],
              boxShadow: `
                0 0 0 1px rgba(34, 197, 94, 0.3),
                0 24px 72px rgba(34, 197, 94, 0.5),
                0 48px 144px rgba(34, 197, 94, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.25)
              `,
              transition: { 
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            onClick={() => setAiOpen(true)}
          >
            {/* Premium background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Native Browser Engine Icon */}
            <motion.div
              className="relative z-20"
              animate={{ 
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg 
                className="w-10 h-10 text-white drop-shadow-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                />
              </svg>
            </motion.div>
            
            {/* Premium pulse rings with green theme for Native Browser */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 border-2 border-green-400/30 rounded-3xl"
                  animate={{ 
                    scale: [1, 1.8, 2.2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.8,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 rounded-3xl"
              animate={{ 
                x: ["-200%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2
              }}
            />
            
            {/* Native Browser Badge */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              🌐
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Premium Workflow Execution Overlay */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: 'none' }} // Will be controlled by workflow context
        >
          <motion.div 
            className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 max-w-lg w-full mx-6 shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              background: `
                linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%),
                radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)
              `,
              boxShadow: `
                0 32px 96px rgba(0, 0, 0, 0.4),
                0 16px 48px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `
            }}
          >
            {/* Premium background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-3xl" />
            
            <div className="relative text-center">
              <motion.div 
                className="relative w-24 h-24 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/30 backdrop-blur-sm"
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(34, 197, 94, 0.2),
                    0 16px 48px rgba(34, 197, 94, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                }}
              >
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                
                {/* Premium pulse rings */}
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0 border-2 border-green-400/20 rounded-3xl"
                    animate={{ 
                      scale: [1, 1.5, 2],
                      opacity: [0.5, 0.2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.6,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.h3 
                className="text-2xl font-bold mb-4 text-white tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Native Browser Loading
              </motion.h3>
              
              <motion.p 
                className="text-slate-400 mb-8 leading-relaxed text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Native Browser Engine is loading your website with full functionality...
              </motion.p>
              
              {/* Premium progress bar */}
              <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-white/20">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 h-4 rounded-full shadow-lg"
                  style={{
                    boxShadow: `
                      0 0 20px rgba(34, 197, 94, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ 
                    duration: 4, 
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                />
              </div>
              
              <motion.p 
                className="text-xs text-slate-500 mt-6 font-medium tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Initializing full website functionality...
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BrowserInterface;