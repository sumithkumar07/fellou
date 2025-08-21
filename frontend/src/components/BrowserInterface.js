import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from './TabBar';
import NavigationBar from './NavigationBar';
import AISidebar from './AISidebar';
import WelcomePage from '../pages/WelcomePage';

import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';

const BrowserInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const { tabs, activeTabId } = useBrowser();
  const { initWebSocket, sessionId } = useAI();

  useEffect(() => {
    if (sessionId) {
      initWebSocket();
    }
  }, [sessionId, initWebSocket]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAI = () => {
    setAiOpen(!aiOpen);
  };

  const closeAI = () => {
    setAiOpen(false);
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-white overflow-hidden will-change-auto">
      {/* Main App Content Area */}
      <motion.div 
        className="flex flex-col"
        animate={{ 
          width: aiOpen ? 'calc(100% - 450px)' : '100%' 
        }}
        transition={{ 
          duration: 0.5, 
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
          <WelcomePage />
        </div>
      </motion.div>

      {/* Enhanced AI Assistant Panel */}
      <AnimatePresence mode="wait">
        {aiOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: 50 }}
            animate={{ width: 450, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 50 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.25, 0.1, 0.25, 1],
              type: "tween"
            }}
            className="h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl overflow-hidden"
          >
            <AISidebar onClose={closeAI} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Action Button */}
      <AnimatePresence mode="wait">
        {!aiOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: aiOpen ? 0 : 0.2
            }}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center z-40 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-300 group"
            whileHover={{ 
              scale: 1.05,
              rotate: 5,
              y: -4
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <motion.svg 
              className="w-7 h-7 text-white z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ 
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </motion.svg>
            
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-2xl">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-ping"></div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl animate-ping" style={{animationDelay: '1s'}}></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced Workflow Execution Overlay */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: 'none' }} // Will be controlled by workflow context
        >
          <motion.div 
            className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20"
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-white">Executing Workflow</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">Fellou is working on your task with precision and intelligence...</p>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 3, ease: "easeOut" }}
                ></motion.div>
              </div>
              <p className="text-xs text-slate-500 mt-3">This may take a few moments...</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BrowserInterface;