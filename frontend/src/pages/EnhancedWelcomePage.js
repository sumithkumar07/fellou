import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useBrowser } from '../contexts/BrowserContext';
import { Search, ArrowRight, Zap, Users, Star, TrendingUp, Globe, Camera, Bot } from 'lucide-react';
import { ProgressiveLoader, TypingIndicator, SpinLoader } from '../components/LoadingSkeleton';

const EnhancedWelcomePage = ({ onNavigate }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const { sendMessage, isLoading, createWorkflow, executeWorkflow } = useAI();
  const { navigateToUrl, getActiveTab } = useBrowser();

  // Enhanced card interactions with better shadows and micro-animations
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
      rotateX: 15
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: -2,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    tap: {
      scale: 0.98,
      y: -4,
      transition: {
        duration: 0.1
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading || isProcessing) return;

    setIsProcessing(true);
    setProcessingStep('Analyzing request...');

    try {
      // Simulate processing steps for better UX
      setTimeout(() => setProcessingStep('Connecting to AI...'), 500);
      setTimeout(() => setProcessingStep('Processing response...'), 1500);

      await sendMessage(searchInput);
      setSearchInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const quickActions = [
    {
      title: 'AI Research Hub',
      description: 'Multi-source research with data extraction, analysis, and automated report generation',
      icon: Search,
      gradient: 'from-blue-500/20 via-blue-600/15 to-cyan-500/20',
      borderGradient: 'from-blue-500/40 to-cyan-500/40',
      iconBg: 'from-blue-500 to-cyan-600',
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      action: async () => {
        setIsProcessing(true);
        setProcessingStep('Setting up research workflow...');
        try {
          await sendMessage("Show me your most advanced research capabilities. I want to see multi-site data extraction, analysis, and automated report generation with screenshots.");
        } catch (error) {
          console.error('Research workflow failed:', error);
        } finally {
          setIsProcessing(false);
          setProcessingStep('');
        }
      }
    },
    {
      title: 'Browser Automation Engine',
      description: 'Native Chromium automation with forms, clicks, screenshots, and cross-platform sync',
      icon: Zap,
      gradient: 'from-purple-500/20 via-purple-600/15 to-indigo-500/20',
      borderGradient: 'from-purple-500/40 to-indigo-500/40',
      iconBg: 'from-purple-500 to-indigo-600',
      shadowColor: 'rgba(147, 51, 234, 0.3)',
      action: async () => {
        setIsProcessing(true);
        setProcessingStep('Initializing browser automation...');
        try {
          await sendMessage("Demonstrate your Native Chromium browser automation capabilities. Show me form filling, data extraction, screenshot analysis, and multi-tab workflows.");
        } catch (error) {
          console.error('Automation demo failed:', error);
        } finally {
          setIsProcessing(false);
          setProcessingStep('');
        }
      }
    },
    {
      title: 'Cross-Platform Integration',
      description: 'Connect 50+ platforms: LinkedIn, Twitter, GitHub, Slack, Google Sheets, and more',
      icon: Globe,
      gradient: 'from-green-500/20 via-emerald-600/15 to-teal-500/20',
      borderGradient: 'from-green-500/40 to-teal-500/40',
      iconBg: 'from-green-500 to-teal-600',
      shadowColor: 'rgba(34, 197, 94, 0.3)',
      action: async () => {
        setIsProcessing(true);
        setProcessingStep('Loading platform integrations...');
        try {
          await sendMessage("Show me your cross-platform integration capabilities. I want to see LinkedIn automation, Twitter data extraction, GitHub workflow management, and Google Sheets synchronization.");
        } catch (error) {
          console.error('Integration demo failed:', error);
        } finally {
          setIsProcessing(false);
          setProcessingStep('');
        }
      }
    }
  ];

  const stats = [
    { 
      icon: Star, 
      label: '50+ Platform Integrations', 
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-orange-500'
    },
    { 
      icon: TrendingUp, 
      label: '10x Faster Workflows', 
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    { 
      icon: Bot, 
      label: 'Native AI Engine', 
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden relative">
      {/* Enhanced background with better depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]" />
      </div>

      <div className="relative max-w-4xl w-full px-6 py-12">
        {/* Enhanced Main Interface with better hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          {/* Premium Logo with enhanced effects */}
          <div className="flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.3, 
                duration: 1.2,
                type: "spring", 
                stiffness: 200,
                damping: 20
              }}
              className="relative"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(59, 130, 246, 0.3),
                    0 20px 60px rgba(59, 130, 246, 0.4),
                    0 40px 120px rgba(59, 130, 246, 0.2),
                    inset 0 2px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <Zap size={32} className="text-white drop-shadow-lg" />
              </div>
              
              {/* Enhanced pulse rings */}
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 border-2 border-blue-400/20 rounded-3xl"
                  animate={{ 
                    scale: [1, 1.8, 2.4],
                    opacity: [0.6, 0.2, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 tracking-tight"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            Welcome to Kairo AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Advanced AI Browser with Native Chromium Engine, 50+ Platform Integrations, and Intelligent Automation
          </motion.p>

          {/* Enhanced Search Bar with better micro-interactions */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            onSubmit={handleSearch}
            className="mb-12 relative"
          >
            <div className="relative max-w-2xl mx-auto group">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700" />
              
              <div className="relative flex items-center bg-white/80 backdrop-blur-2xl border-2 border-gray-200/50 rounded-3xl shadow-xl hover:shadow-2xl focus-within:shadow-2xl transition-all duration-500"
                style={{
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    0 1px 0 rgba(255, 255, 255, 0.9),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9)
                  `
                }}
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Try: 'Show advanced automation features' | 'Connect LinkedIn + Google Sheets' | 'Extract website data'"
                  className="flex-1 px-8 py-5 text-lg bg-transparent text-gray-800 placeholder-gray-500 rounded-3xl focus:outline-none font-medium"
                  disabled={isLoading || isProcessing}
                />
                
                <motion.button
                  type="submit"
                  className="mr-3 w-12 h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center shadow-xl transition-all duration-300"
                  disabled={!searchInput.trim() || isLoading || isProcessing}
                  whileHover={{ 
                    scale: searchInput.trim() && !isLoading && !isProcessing ? 1.05 : 1,
                    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading || isProcessing ? (
                    <SpinLoader size={20} />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </motion.button>
              </div>
              
              {/* Processing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-4 flex items-center justify-center"
                >
                  <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-6 py-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <TypingIndicator />
                      <span className="text-sm text-gray-600 font-medium">{processingStep}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.form>
        </motion.div>

        {/* Enhanced Quick Actions with superior visual hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.9 + index * 0.1 }}
              className="group relative cursor-pointer"
              onClick={action.action}
            >
              {/* Enhanced card with premium shadows */}
              <div 
                className={`relative p-8 bg-gradient-to-br ${action.gradient} border-2 border-transparent rounded-3xl overflow-hidden backdrop-blur-xl`}
                style={{
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%),
                    ${action.gradient}
                  `,
                  borderImage: `linear-gradient(135deg, ${action.borderGradient}) 1`,
                  boxShadow: `
                    0 8px 32px ${action.shadowColor},
                    0 2px 16px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9)
                  `
                }}
              >
                {/* Enhanced icon with better effects */}
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${action.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -3, 3, 0],
                    transition: { duration: 0.6 }
                  }}
                  style={{
                    boxShadow: `
                      0 12px 40px ${action.shadowColor},
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <action.icon size={28} className="text-white drop-shadow-lg" />
                </motion.div>
                
                <h3 className="font-bold text-gray-900 mb-4 text-xl tracking-tight">{action.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{action.description}</p>
                
                {/* Hover overlay effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Stats with better visual treatment */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center justify-center gap-12 text-sm"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + index * 0.15, duration: 0.6 }}
              className="flex items-center gap-3 group"
            >
              <motion.div
                className={`w-10 h-10 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.6 }
                }}
              >
                <stat.icon size={18} className="text-white drop-shadow-sm" />
              </motion.div>
              <span className="text-gray-700 font-semibold tracking-wide group-hover:text-gray-900 transition-colors duration-300">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedWelcomePage;