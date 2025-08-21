import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from './TabBar';
import NavigationBar from './NavigationBar';
import AISidebar from './AISidebar';
import WelcomePage from '../pages/WelcomePage';

import { useBrowser } from '../contexts/BrowserContext';
import { useAI } from '../contexts/AIContext';

const BrowserInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with sidebar closed
  const [aiOpen, setAiOpen] = useState(false); // New state for AI assistant
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
    <div className="h-screen w-screen flex bg-dark-900 text-white overflow-hidden">
      {/* Main App Content Area */}
      <motion.div 
        className="flex flex-col"
        animate={{ 
          width: aiOpen ? 'calc(100% - 400px)' : '100%' 
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1],
          type: "tween"
        }}
      >
        {/* Tab Bar - Shortened when AI open */}
        <TabBar />
        
        {/* Navigation Bar - Shortened when AI open */}
        <NavigationBar 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Browser Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <WelcomePage />
        </div>
      </motion.div>

      {/* AI Assistant Panel - Full Height from Top */}
      <AnimatePresence mode="wait">
        {aiOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.1, 0.25, 1],
              type: "tween"
            }}
            className="h-full bg-dark-900 border-l border-dark-700 shadow-2xl overflow-hidden"
          >
            <AISidebar onClose={closeAI} />
          </motion.div>
        )}
      </AnimatePresence>



      {/* Fellou-style floating action button for workflows - Hidden when AI panel is open */}
      <AnimatePresence mode="wait">
        {!aiOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: aiOpen ? 0 : 0.1
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-xl flex items-center justify-center z-40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Workflow execution overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ display: 'none' }} // Will be controlled by workflow context
      >
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Executing Workflow</h3>
            <p className="text-gray-400 mb-4">Fellou is working on your task in the background...</p>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300" style={{width: '0%'}}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BrowserInterface;