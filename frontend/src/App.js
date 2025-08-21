import React, { useState } from 'react';
import { AIProvider } from './contexts/AIContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import AISidebar from './components/AISidebar';
import MainContent from './components/MainContent';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Minimize2 } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AIProvider>
      <WorkflowProvider>
        <div className="h-screen w-screen bg-dark-900 flex overflow-hidden">
          {/* Left Sidebar - AI Assistant - Compact Design */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 72, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-800 border-r border-dark-700 flex-shrink-0"
              >
                <AISidebar onClose={() => setSidebarOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <MainContent sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          {/* Sidebar Toggle Button (when closed) */}
          <AnimatePresence>
            {!sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-50 bg-dark-800 border border-dark-700 rounded-lg p-2 shadow-lg hover:shadow-xl hover:bg-dark-700 transition-all duration-200"
              >
                <MessageSquare size={20} className="text-blue-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </WorkflowProvider>
    </AIProvider>
  );
}

export default App;