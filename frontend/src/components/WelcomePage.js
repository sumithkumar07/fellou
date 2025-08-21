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
    <div className="h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative min-h-full flex flex-col items-center justify-center p-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="text-center mb-16 max-w-4xl"
        >
          {/* Logo and title */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25"
              whileHover={{ 
                scale: 1.05,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              animate={{
                boxShadow: [
                  "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
                  "0 25px 50px -12px rgba(99, 102, 241, 0.4)",
                  "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap size={36} className="text-white" />
            </motion.div>
            <div className="text-left">
              <motion.h1 
                className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Welcome to Fellou
              </motion.h1>
              <motion.p 
                className="text-slate-400 text-lg font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Your AI-powered browser assistant
              </motion.p>
            </div>
          </div>

          {/* Enhanced tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Beyond browsing, into <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-semibold">intelligent action</span>.
            <br />
            Express your ideas, and Fellou brings them to life with precision.
          </motion.p>

          {/* Enhanced feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            {[
              { icon: Sparkles, text: "AI-Powered Workflows", color: "blue" },
              { icon: Globe, text: "50+ Platform Integration", color: "green" },
              { icon: Brain, text: "Intelligent Automation", color: "purple" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 px-6 py-3 rounded-full text-sm flex items-center gap-3 hover:bg-slate-700/40 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  y: -2
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <feature.icon size={18} className={`text-${feature.color}-400`} />
                <span className="text-slate-200 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced search input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="w-full max-w-2xl mb-16"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-1.5 group-hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 px-6 py-4">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Ask me anything or describe what you want to do..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Ask me anything"]');
                    if (input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced quick actions grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-7xl"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl cursor-pointer hover:bg-slate-700/40 transition-all duration-500"
              onClick={action.action}
              whileHover={{ 
                y: -8,
                scale: 1.02
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.15, duration: 0.6 }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
              
              <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                <action.icon size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-3 text-lg group-hover:text-blue-200 transition-colors">{action.title}</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed group-hover:text-slate-300 transition-colors">{action.description}</p>
              <div className="flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Explore now</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced example commands */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          <motion.h3 
            className="text-2xl font-bold text-center text-white mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
          >
            Or try these popular workflows:
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exampleCommands.map((command, index) => (
              <motion.button
                key={index}
                className="text-left p-6 bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-xl hover:border-blue-500/50 hover:bg-slate-700/30 transition-all duration-300 group"
                onClick={() => sendMessage(command)}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.0 + index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  x: 8,
                  scale: 1.02
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <MessageSquare size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                      "{command}"
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <motion.p 
            className="text-slate-400 mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            Ready to experience the future of browsing?
          </motion.p>
          <motion.button
            className="group relative bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300"
            onClick={() => sendMessage('Hello! I want to explore what you can do for me.')}
            whileHover={{ 
              scale: 1.05,
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} />
              <span>Start Your AI Journey</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;