import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useBrowser } from '../contexts/BrowserContext';
import CentralCommandInterface from './DeepSearch/CentralCommandInterface';
import MultiWindowManager from './BrowserGrid/MultiWindowManager';
import TaskExecutionPanel from './TaskPanel/TaskExecutionPanel';
import TimelineNavigation from './Timeline/TimelineNavigation';
import DragDropWorkflow from './DragDrop/DragDropWorkflow';
import { 
  Zap, 
  Globe, 
  Brain, 
  Target,
  ArrowRight,
  Play,
  Grid3x3,
  Search,
  Workflow,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Layers,
  Computer
} from 'lucide-react';

const FellowStyleWelcome = () => {
  const [activeMode, setActiveMode] = useState('deep-search'); // deep-search, browser-grid, workflow-builder
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    tasksCompleted: 247,
    timesSaved: '18.5 hours',
    platformsIntegrated: 12,
    reportsGenerated: 31
  });

  const { sendMessage } = useAI();
  const { createWorkflow, workflows } = useWorkflow();
  const { createNewTab } = useBrowser();

  // Featured use cases from Fellou.ai
  const featuredUseCases = [
    {
      id: 1,
      title: "Research & Analysis",
      description: "Generate comprehensive reports with AI-powered insights and visualizations",
      icon: '📊',
      example: "Research AI trends from top 20 Silicon Valley VCs and create detailed report",
      time: "15-20 min",
      platforms: ['Google', 'LinkedIn', 'Twitter', 'News Sites'],
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Social Media Management",
      description: "Monitor mentions, engage with audiences, and distribute content across platforms",
      icon: '📱',
      example: "Monitor brand mentions across social media and auto-respond to queries",
      time: "5-10 min",
      platforms: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Lead Generation",
      description: "Find prospects, gather contact information, and initiate outreach campaigns",
      icon: '🎯',
      example: "Find 50 browser engineers on LinkedIn and send personalized connection requests",
      time: "10-15 min",
      platforms: ['LinkedIn', 'GitHub', 'Email', 'CRM'],
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      title: "Data Collection & Analysis",
      description: "Extract data from multiple sources and create structured reports",
      icon: '🔍',
      example: "Collect Tesla's financial data from multiple sources and analyze trends",
      time: "8-12 min",
      platforms: ['Financial APIs', 'News', 'SEC Filings', 'Reports'],
      color: "from-orange-500 to-red-500"
    }
  ];

  const quickActions = [
    {
      icon: Search,
      title: "Deep Search",
      description: "AI-powered research across platforms",
      action: () => setActiveMode('deep-search')
    },
    {
      icon: Grid3x3,
      title: "Browser Grid",
      description: "Multi-window browsing experience",
      action: () => setActiveMode('browser-grid')
    },
    {
      icon: Workflow,
      title: "Workflow Builder",
      description: "Visual drag-and-drop automation",
      action: () => setShowWorkflowBuilder(true)
    },
    {
      icon: BarChart3,
      title: "Generate Report",
      description: "Create AI-powered reports",
      action: () => handleQuickAction("Generate a comprehensive market analysis report")
    }
  ];

  const handleQuickAction = async (instruction) => {
    await sendMessage(instruction);
  };

  const handleUseCaseExample = async (useCase) => {
    await sendMessage(`Execute: ${useCase.example}`);
  };

  // Stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats(prev => ({
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        timesSaved: `${(parseFloat(prev.timesSaved.split(' ')[0]) + 0.1).toFixed(1)} hours`,
        platformsIntegrated: prev.platformsIntegrated + Math.floor(Math.random() * 0.2),
        reportsGenerated: prev.reportsGenerated + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderModeContent = () => {
    switch (activeMode) {
      case 'deep-search':
        return <CentralCommandInterface isActive={true} onWorkflowStart={createWorkflow} />;
      case 'browser-grid':
        return <MultiWindowManager splitView={false} sidebarOpen={true} />;
      default:
        return <CentralCommandInterface isActive={true} onWorkflowStart={createWorkflow} />;
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Central Content */}
        <div className="flex-1 flex flex-col">
          {/* Mode Selector */}
          <div className="h-16 bg-dark-800/80 backdrop-blur-sm border-b border-dark-700/50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap size={24} className="text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-white">Emergent AI</h1>
                  <p className="text-xs text-gray-400">Agentic Browser</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-dark-700 rounded-lg p-1">
                {[
                  { id: 'deep-search', label: 'Deep Search', icon: Search },
                  { id: 'browser-grid', label: 'Browser Grid', icon: Grid3x3 }
                ].map((mode) => (
                  <motion.button
                    key={mode.id}
                    className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                      activeMode === mode.id 
                        ? 'bg-primary-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-dark-600'
                    }`}
                    onClick={() => setActiveMode(mode.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <mode.icon size={16} />
                    {mode.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-6 text-sm">
              <motion.div 
                className="text-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-primary-500 font-bold">{currentStats.tasksCompleted}</div>
                <div className="text-gray-400 text-xs">Tasks Completed</div>
              </motion.div>
              <div className="w-px h-6 bg-dark-600"></div>
              <div className="text-center">
                <div className="text-green-500 font-bold">{currentStats.timesSaved}</div>
                <div className="text-gray-400 text-xs">Time Saved</div>
              </div>
              <div className="w-px h-6 bg-dark-600"></div>
              <div className="text-center">
                <div className="text-blue-500 font-bold">{currentStats.platformsIntegrated}</div>
                <div className="text-gray-400 text-xs">Platforms Active</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderModeContent()}
              </motion.div>
            </AnimatePresence>

            {/* Floating Quick Actions */}
            <div className="absolute bottom-6 left-6 flex gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  className="bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-xl p-3 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20 transition-all group"
                  onClick={action.action}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon size={20} className="text-gray-400 group-hover:text-primary-500 mb-2" />
                  <div className="text-xs text-gray-300 group-hover:text-white font-medium">
                    {action.title}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Feature Showcase Panel */}
            {activeMode === 'deep-search' && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 right-4 w-80 bg-dark-800/95 backdrop-blur-sm border border-dark-600 rounded-xl p-4"
              >
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target size={16} className="text-primary-500" />
                  Popular Workflows
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {featuredUseCases.map((useCase, index) => (
                    <motion.div
                      key={useCase.id}
                      className="bg-dark-700/50 rounded-lg p-3 hover:bg-dark-700 transition-colors cursor-pointer group"
                      onClick={() => handleUseCaseExample(useCase)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl flex-shrink-0">{useCase.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-1 group-hover:text-primary-500">
                            {useCase.title}
                          </h4>
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                            {useCase.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{useCase.time}</span>
                            <div className="flex items-center gap-1 text-gray-500 group-hover:text-primary-500">
                              <Play size={10} />
                              <span>Try it</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Task Panel (conditionally shown) */}
        {workflows.length > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <TaskExecutionPanel width={320} />
          </motion.div>
        )}
      </div>

      {/* Bottom Timeline */}
      <TimelineNavigation onTimelineChange={(entry) => console.log('Timeline change:', entry)} />

      {/* Drag & Drop Workflow Builder Modal */}
      <AnimatePresence>
        {showWorkflowBuilder && (
          <DragDropWorkflow 
            isVisible={showWorkflowBuilder}
            onClose={() => setShowWorkflowBuilder(false)}
          />
        )}
      </AnimatePresence>

      {/* Feature Highlights Overlay */}
      <motion.div
        className="absolute top-4 left-4 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-lg p-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Shadow Workspace Active</span>
          <span className="text-gray-500">•</span>
          <span>Eko Framework Ready</span>
          <span className="text-gray-500">•</span>
          <span>50+ Integrations</span>
        </div>
      </motion.div>

      {/* Version & Tech Stack */}
      <motion.div
        className="absolute bottom-4 right-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center gap-2">
          <Computer size={12} />
          <span>Emergent AI v2.0.0</span>
          <span>•</span>
          <span>Deep Action Technology</span>
          <span>•</span>
          <span>Agentic Browser</span>
        </div>
      </motion.div>
    </div>
  );
};

export default FellowStyleWelcome;