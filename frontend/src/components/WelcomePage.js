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
      {/* Premium animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/8 via-indigo-500/6 to-purple-500/8 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/6 via-pink-500/4 to-blue-500/6 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -25, 0],
            y: [0, 15, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}
        />
      </div>
      
      <div className="relative min-h-full flex flex-col items-center justify-center p-8">
        {/* Premium hero section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-center mb-20 max-w-5xl"
        >
          {/* Enhanced logo and title */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <motion.div 
              className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(59, 130, 246, 0.1),
                  0 8px 32px rgba(59, 130, 246, 0.3),
                  0 32px 64px rgba(59, 130, 246, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
              animate={{
                boxShadow: [
                  "0 0 0 1px rgba(59, 130, 246, 0.1), 0 8px 32px rgba(59, 130, 246, 0.3), 0 32px 64px rgba(59, 130, 246, 0.15)",
                  "0 0 0 1px rgba(99, 102, 241, 0.15), 0 12px 40px rgba(99, 102, 241, 0.4), 0 40px 80px rgba(99, 102, 241, 0.2)",
                  "0 0 0 1px rgba(59, 130, 246, 0.1), 0 8px 32px rgba(59, 130, 246, 0.3), 0 32px 64px rgba(59, 130, 246, 0.15)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Zap size={40} className="text-white drop-shadow-lg" />
              </motion.div>
              {/* Inner glow ring */}
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-sm" />
            </motion.div>
            
            <div className="text-left">
              <motion.h1 
                className="text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent tracking-tight"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 30%, #bfdbfe  60%, #93c5fd  100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Welcome to Fellou
              </motion.h1>
              <motion.p 
                className="text-slate-400 text-xl font-semibold tracking-wide mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Your AI-powered browser assistant
              </motion.p>
              {/* Status indicator */}
              <motion.div 
                className="flex items-center gap-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-xs text-slate-500 font-medium tracking-wide">READY TO ASSIST</span>
              </motion.div>
            </div>
          </div>

          {/* Premium tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.0 }}
            className="mb-16"
          >
            <p className="text-2xl text-slate-300 mb-6 leading-relaxed max-w-3xl mx-auto font-light">
              Beyond browsing, into{' '}
              <span className="font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                intelligent action
              </span>
              .
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Express your ideas naturally, and Fellou brings them to life with precision and intelligence.
            </p>
          </motion.div>

          {/* Premium feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 mb-20"
          >
            {[
              { icon: Sparkles, text: "AI-Powered Workflows", color: "blue" },
              { icon: Globe, text: "50+ Platform Integration", color: "emerald" },
              { icon: Brain, text: "Intelligent Automation", color: "purple" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -4 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.2, duration: 0.6 }}
              >
                {/* Premium glass card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl shadow-2xl group-hover:bg-white/8 group-hover:border-white/15 transition-all duration-500">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-${feature.color}-500/10 to-${feature.color}-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                      <feature.icon size={20} className="text-white" />
                    </div>
                    <span className="text-slate-200 font-semibold text-lg tracking-wide">{feature.text}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Premium search input */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1.0 }}
          className="w-full max-w-3xl mb-20"
        >
          <div className="group relative">
            {/* Premium glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl opacity-60 group-hover:opacity-100 transition-all duration-700" />
            
            {/* Glass container */}
            <div className="relative bg-white/8 backdrop-blur-2xl border border-white/20 rounded-3xl p-2 group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-500 shadow-2xl">
              <div className="flex items-center gap-6 px-8 py-6">
                <div className="w-6 h-6 text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  <Search size={24} />
                </div>
                <input
                  type="text"
                  placeholder="Ask me anything or describe what you want to do..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-xl font-medium group-hover:placeholder-slate-300 transition-colors duration-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300"
                  whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Ask me anything"]');
                    if (input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium quick actions grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 w-full max-w-8xl"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className="group relative overflow-hidden cursor-pointer"
              onClick={action.action}
              whileHover={{ 
                y: -12,
                scale: 1.03,
                transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 + index * 0.2, duration: 0.8 }}
            >
              {/* Premium glass card */}
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl group-hover:bg-white/8 group-hover:border-white/20 transition-all duration-700">
                {/* Gradient glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 rounded-3xl transition-all duration-700`} />
                
                {/* Premium floating icon */}
                <div className="relative mb-8">
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -3, 3, 0],
                      transition: { duration: 0.6 }
                    }}
                    style={{
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.2),
                        0 2px 8px rgba(0, 0, 0, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                    }}
                  >
                    <action.icon size={32} className="text-white drop-shadow-sm" />
                  </motion.div>
                </div>
                
                <div className="relative">
                  <h3 className="font-bold text-white mb-4 text-xl group-hover:text-blue-100 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-slate-400 mb-8 leading-relaxed group-hover:text-slate-300 transition-colors duration-300 text-base">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-400 font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>Explore now</span>
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium example commands */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1.0 }}
          className="w-full max-w-6xl"
        >
          <motion.h3 
            className="text-3xl font-bold text-center text-white mb-12 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            Or try these popular workflows:
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exampleCommands.map((command, index) => (
              <motion.button
                key={index}
                className="group text-left p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-blue-500/30 hover:bg-white/8 transition-all duration-500 shadow-xl hover:shadow-2xl"
                onClick={() => sendMessage(command)}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.6 + index * 0.15, duration: 0.8 }}
                whileHover={{ 
                  x: 8,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 border border-blue-500/20 group-hover:border-blue-500/30 transition-all duration-500">
                    <MessageSquare size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-300 group-hover:text-white transition-colors duration-300 leading-relaxed text-base font-medium block">
                      "{command}"
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Premium bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0, duration: 1.0 }}
          className="mt-24 text-center"
        >
          <motion.p 
            className="text-slate-400 mb-10 text-xl font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.1 }}
          >
            Ready to experience the future of intelligent browsing?
          </motion.p>
          <motion.button
            className="group relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-16 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/50 transition-all duration-500 overflow-hidden"
            onClick={() => sendMessage('Hello! I want to explore what you can do for me.')}
            whileHover={{ 
              scale: 1.05,
              y: -3,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Premium shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="relative flex items-center gap-4">
              <Sparkles size={24} />
              <span>Start Your AI Journey</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;