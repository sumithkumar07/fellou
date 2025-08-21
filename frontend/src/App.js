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
        <div className="h-screen w-screen bg-white flex overflow-hidden">
          {/* Left Sidebar - AI Assistant */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 border-r border-gray-200 flex-shrink-0"
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
                className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageSquare size={20} className="text-gray-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </WorkflowProvider>
    </AIProvider>
  );
}

export default App;