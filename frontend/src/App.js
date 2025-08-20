import React, { useState, useEffect } from 'react';
import { BrowserProvider } from './contexts/BrowserContext';
import { AIProvider } from './contexts/AIContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import BrowserInterface from './components/BrowserInterface';
import MultiWindowManager from './components/BrowserGrid/MultiWindowManager';
import TaskExecutionPanel from './components/TaskPanel/TaskExecutionPanel';
import TimelineNavigation from './components/Timeline/TimelineNavigation';
import DragDropWorkflow from './components/DragDrop/DragDropWorkflow';
import CentralCommandInterface from './components/DeepSearch/CentralCommandInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Maximize2, 
  Minimize2, 
  Layers,
  Zap,
  Grid,
  Eye,
  Workflow
} from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('central'); // central, browser, workflow
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveView('central');
            break;
          case '2':
            e.preventDefault();
            setActiveView('browser');
            break;
          case '3':
            e.preventDefault();
            setWorkflowBuilderOpen(true);
            break;
          case 't':
            e.preventDefault();
            setTimelineExpanded(!timelineExpanded);
            break;
          case 'b':
            e.preventDefault();
            setSidebarOpen(!sidebarOpen);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timelineExpanded, sidebarOpen]);

  const handleWorkflowStart = (workflow) => {
    console.log('Starting workflow:', workflow);
    setActiveView('browser');
    setTaskPanelOpen(true);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'central':
        return (
          <CentralCommandInterface
            isActive={true}
            onWorkflowStart={handleWorkflowStart}
          />
        );
      case 'browser':
        return (
          <MultiWindowManager
            splitView={splitView}
            sidebarOpen={sidebarOpen}
          />
        );
      default:
        return (
          <CentralCommandInterface
            isActive={true}
            onWorkflowStart={handleWorkflowStart}
          />
        );
    }
  };

  return (
    <AIProvider>
      <BrowserProvider>
        <WorkflowProvider>
          <div className="h-screen w-screen overflow-hidden bg-dark-900 flex flex-col">
            {/* Top Navigation Bar - Fellou Style */}
            <div className="h-12 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 flex-shrink-0">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <Zap size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-white">Emergent AI</span>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
                  <motion.button
                    onClick={() => setActiveView('central')}
                    className={`px-3 py-1.5 rounded text-sm transition-all ${
                      activeView === 'central'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-dark-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Grid size={14} className="mr-2 inline" />
                    Deep Search
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setActiveView('browser')}
                    className={`px-3 py-1.5 rounded text-sm transition-all ${
                      activeView === 'browser'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-dark-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={14} className="mr-2 inline" />
                    Browser Grid
                  </motion.button>
                </div>
              </div>

              {/* Center Section */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Trinity Architecture Active</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Workflow Builder */}
                <motion.button
                  onClick={() => setWorkflowBuilderOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Workflow Builder"
                >
                  <Workflow size={16} />
                </motion.button>

                {/* Task Panel Toggle */}
                <motion.button
                  onClick={() => setTaskPanelOpen(!taskPanelOpen)}
                  className={`p-2 rounded-lg transition-colors ${
                    taskPanelOpen
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Toggle Task Panel"
                >
                  <Layers size={16} />
                </motion.button>

                {/* Settings */}
                <motion.button
                  className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings size={16} />
                </motion.button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar - AI Chat */}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 border-r border-dark-700"
                  >
                    <BrowserInterface />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 overflow-hidden"
                >
                  {renderMainContent()}
                </motion.div>

                {/* Timeline Navigation */}
                <TimelineNavigation
                  onTimelineChange={(entry) => console.log('Timeline changed:', entry)}
                  sessions={[]}
                  currentSession={null}
                />
              </div>

              {/* Task Execution Panel */}
              <AnimatePresence>
                {taskPanelOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 350, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <TaskExecutionPanel width={350} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Drag & Drop Workflow Builder Modal */}
            <AnimatePresence>
              {workflowBuilderOpen && (
                <DragDropWorkflow
                  isVisible={workflowBuilderOpen}
                  onClose={() => setWorkflowBuilderOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Overlay */}
            <div className="fixed bottom-4 right-4 bg-dark-800/80 backdrop-blur rounded-lg p-3 text-xs text-gray-400">
              <div className="space-y-1">
                <div><kbd className="bg-dark-700 px-1 rounded">Ctrl+1</kbd> Deep Search</div>
                <div><kbd className="bg-dark-700 px-1 rounded">Ctrl+2</kbd> Browser Grid</div>
                <div><kbd className="bg-dark-700 px-1 rounded">Ctrl+3</kbd> Workflow Builder</div>
                <div><kbd className="bg-dark-700 px-1 rounded">Ctrl+T</kbd> Timeline</div>
              </div>
            </div>
          </div>
        </WorkflowProvider>
      </BrowserProvider>
    </AIProvider>
  );
}

export default App;