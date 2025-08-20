import React from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useBrowser } from '../contexts/BrowserContext';
import { 
  Zap, 
  Globe, 
  Brain, 
  Workflow,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const WelcomePage = () => {
  const { sendMessage } = useAI();
  const { navigateToUrl } = useBrowser();

  const quickActions = [
    {
      title: 'Research & Reports',
      description: 'Generate comprehensive reports on any topic',
      icon: Brain,
      gradient: 'from-blue-500 to-cyan-500',
      action: () => sendMessage('Help me research AI trends in 2025 and create a report')
    },
    {
      title: 'Web Automation',
      description: 'Automate tasks across multiple websites',
      icon: Workflow,
      gradient: 'from-purple-500 to-pink-500',
      action: () => sendMessage('Help me automate social media posting workflow')
    },
    {
      title: 'Smart Search',
      description: 'Search and analyze data from 50+ platforms',
      icon: Search,
      gradient: 'from-green-500 to-emerald-500',
      action: () => sendMessage('Find the latest startup news and summarize key trends')
    },
    {
      title: 'Cross-Platform Tasks',
      description: 'Execute complex workflows across platforms',
      icon: Globe,
      gradient: 'from-orange-500 to-red-500',
      action: () => sendMessage('Help me monitor mentions across Twitter, LinkedIn, and Reddit')
    }
  ];

  const exampleCommands = [
    'Find LinkedIn profiles of AI engineers and create a summary table',
    'Research Tesla stock performance and generate a visual report',
    'Monitor Twitter for mentions of our product and compile feedback',
    'Create a competitive analysis of browser automation tools',
    'Automate data collection from multiple news sources',
    'Generate a market research report on AI startups'
  ];

  return (
    <div className="h-full bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-4xl"
        >
          {/* Logo and title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Zap size={32} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold gradient-text">Emergent AI</h1>
              <p className="text-gray-400">The World's First Agentic Browser</p>
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-300 mb-8 leading-relaxed"
          >
            Beyond browsing, into <span className="gradient-text font-semibold">Action</span>.
            <br />
            Express ideas, Fellou acts with Deep Action technology.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="glass-dark px-4 py-2 rounded-full text-sm">
              <Sparkles size={16} className="inline mr-2 text-primary-500" />
              AI-Powered Workflows
            </div>
            <div className="glass-dark px-4 py-2 rounded-full text-sm">
              <Globe size={16} className="inline mr-2 text-green-500" />
              50+ Platform Integration
            </div>
            <div className="glass-dark px-4 py-2 rounded-full text-sm">
              <Brain size={16} className="inline mr-2 text-purple-500" />
              Intelligent Automation
            </div>
          </motion.div>
        </motion.div>

        {/* Quick actions grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 w-full max-w-6xl"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className="glass-dark p-6 rounded-xl cursor-pointer group hover:scale-105 transition-all duration-300"
              onClick={action.action}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{action.description}</p>
              <div className="flex items-center text-primary-500 text-sm group-hover:gap-2 transition-all">
                <span>Try it now</span>
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Example commands */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          <h3 className="text-xl font-semibold text-center text-white mb-6">
            Or try these example commands:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleCommands.map((command, index) => (
              <motion.button
                key={index}
                className="text-left p-4 bg-dark-700 border border-dark-600 rounded-lg hover:border-primary-500 hover:bg-dark-600 transition-all duration-200 group"
                onClick={() => sendMessage(command)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className="text-primary-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    "{command}"
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Ready to transform how you browse and work?
          </p>
          <button
            className="btn-primary px-8 py-3 text-lg"
            onClick={() => sendMessage('Hello! I want to explore what you can do.')}
          >
            Start Your First Workflow
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;