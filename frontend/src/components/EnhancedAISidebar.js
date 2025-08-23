import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useBrowser } from '../contexts/BrowserContext';
import { MessageSquare, Bot, User, Send, X, Plus, Pin, Zap, Search, Globe, Sparkles, Camera } from 'lucide-react';
import { TypingIndicator, SpinLoader } from './LoadingSkeleton';

const EnhancedAISidebar = ({ onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { messages, isLoading, sendMessage, sendBrowserAction } = useAI();
  const { getActiveTab, takeScreenshot } = useBrowser();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced message sending with better UX feedback
  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSendMessage called with:', inputMessage);
    
    if (!inputMessage.trim() || isLoading) {
      console.log('❌ Message is empty or loading:', { inputMessage: inputMessage.trim(), isLoading });
      return;
    }

    const message = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    
    try {
      console.log('📤 About to send message:', message);
      console.log('🔍 sendMessage function available:', typeof sendMessage);
      
      // Check for browser commands
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('screenshot') || lowerMessage.includes('capture')) {
        const activeTab = getActiveTab();
        if (activeTab) {
          try {
            await takeScreenshot(activeTab.id);
          } catch (error) {
            console.error('Screenshot failed:', error);
          }
        }
      }
      
      // Send regular AI message
      console.log('🌐 Calling sendMessage function...');
      const result = await sendMessage(message);
      console.log('✅ sendMessage completed with result:', result);
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Enhanced message variants with superior animations
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 30, 
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
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className="w-full h-full backdrop-blur-3xl flex flex-col overflow-hidden border-l shadow-2xl relative"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%),
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)
        `,
        borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: `
          -20px 0 60px rgba(0, 0, 0, 0.1),
          -5px 0 30px rgba(0, 0, 0, 0.05),
          inset 1px 0 0 rgba(255, 255, 255, 0.5)
        `
      }}
    >
      {/* Enhanced Header with premium styling */}
      <motion.div 
        className="relative p-6 border-b backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.8) 100%),
            radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)
          `,
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-indigo-500/3 to-purple-500/3 rounded-t-xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl"
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -3, 3, 0],
                transition: { duration: 0.8 }
              }}
              style={{
                boxShadow: `
                  0 0 0 1px rgba(59, 130, 246, 0.2),
                  0 12px 40px rgba(59, 130, 246, 0.4),
                  0 24px 80px rgba(59, 130, 246, 0.2),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <Bot size={22} className="text-white drop-shadow-lg" />
              
              {/* Enhanced pulse rings */}
              {[0, 1].map((index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 border-2 border-blue-400/20 rounded-3xl"
                  animate={{ 
                    scale: [1, 1.4, 1.8],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 1.25,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
            
            <div>
              <motion.h2 
                className="text-black font-bold text-xl tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Kairo AI
              </motion.h2>
              <div className="flex items-center gap-2 mt-1">
                <motion.div 
                  className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.3, 1], 
                    opacity: [1, 0.6, 1],
                    boxShadow: [
                      "0 0 10px rgba(74, 222, 128, 0.5)",
                      "0 0 20px rgba(74, 222, 128, 0.8)",
                      "0 0 10px rgba(74, 222, 128, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.span 
                  className="text-xs text-gray-600 font-semibold tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  ONLINE & READY
                </motion.span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { icon: Plus, tooltip: "New Chat", delay: 0.1 },
              { icon: Pin, tooltip: "Pin Sidebar", delay: 0.2 }
            ].map(({ icon: Icon, tooltip, delay }, index) => (
              <motion.button
                key={tooltip}
                className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100/50 rounded-2xl transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                title={tooltip}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + delay }}
              >
                <Icon size={16} />
              </motion.button>
            ))}
            
            <motion.button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 ml-2"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              title="Close Assistant"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.8 }}
            >
              <X size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-8"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent'
            }}
          >
            {messages.length === 0 && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Enhanced Welcome Message */}
                <div className="text-center py-12 bg-gradient-to-b from-white/60 to-gray-50/40 rounded-3xl mx-4 backdrop-blur-xl border border-gray-100/60 shadow-xl">
                  <motion.div
                    className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      boxShadow: `
                        0 0 0 1px rgba(59, 130, 246, 0.2),
                        0 20px 60px rgba(59, 130, 246, 0.4),
                        0 40px 120px rgba(59, 130, 246, 0.2)
                      `
                    }}
                  >
                    <Sparkles size={32} className="text-white drop-shadow-lg" />
                    
                    {/* Enhanced pulse rings */}
                    <div className="absolute inset-0 rounded-3xl">
                      {[0, 1, 2].map((index) => (
                        <motion.div
                          key={index}
                          className="absolute inset-0 border-2 border-blue-400/20 rounded-3xl"
                          animate={{ 
                            scale: [1, 1.6, 2.2],
                            opacity: [0.6, 0.3, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 1,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-black mb-4 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to Kairo AI
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-relaxed max-w-md mx-auto font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    I'm your advanced AI assistant with Native Chromium engine, 50+ platform integrations, and powerful automation capabilities. Ask me anything!
                  </motion.p>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="space-y-6">
                  <motion.h4 
                    className="text-black font-bold px-2 flex items-center gap-3 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Zap size={20} className="text-blue-400" />
                    Quick Actions
                  </motion.h4>
                  
                  {[
                    {
                      icon: Search,
                      title: "Advanced Research & Analysis",
                      description: "Multi-site research with data extraction, analysis, and automated reports",
                      gradient: "from-blue-500 to-cyan-600",
                      shadowColor: "rgba(59, 130, 246, 0.3)",
                      action: async () => {
                        setInputMessage("Show me your advanced research capabilities with multi-site data extraction and analysis");
                        inputRef.current?.focus();
                      }
                    },
                    {
                      icon: Zap,
                      title: "Native Browser Automation",  
                      description: "Real Chrome automation - forms, clicks, screenshots, data extraction",
                      gradient: "from-purple-500 to-indigo-600",
                      shadowColor: "rgba(147, 51, 234, 0.3)",
                      action: async () => {
                        setInputMessage("Demonstrate your Native Chromium browser automation with examples");
                        inputRef.current?.focus();
                      }
                    },
                    {
                      icon: Globe,
                      title: "Cross-Platform Integration",
                      description: "Connect LinkedIn, Twitter, GitHub, Slack, Google Sheets, and 45+ more",
                      gradient: "from-green-500 to-emerald-600",
                      shadowColor: "rgba(34, 197, 94, 0.3)",
                      action: async () => {
                        setInputMessage("What platforms can you integrate with? Show me cross-platform automation examples");
                        inputRef.current?.focus();
                      }
                    },
                    {
                      icon: Camera,
                      title: "Screenshot Analysis & Data Mining", 
                      description: "Intelligent screenshot capture, metadata extraction, and automated analysis",
                      gradient: "from-orange-500 to-red-600",
                      shadowColor: "rgba(251, 146, 60, 0.3)",
                      action: async () => {
                        setInputMessage("How does your screenshot analysis work? Show me data extraction capabilities");
                        inputRef.current?.focus();
                      }
                    }
                  ].map((item, index) => (
                    <motion.button
                      key={item.title}
                      className="group w-full bg-white/60 backdrop-blur-xl hover:bg-white/80 border border-gray-200/60 hover:border-gray-300/80 rounded-3xl p-6 text-left transition-all duration-500 shadow-lg hover:shadow-xl"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -6,
                        boxShadow: `0 20px 60px ${item.shadowColor}`,
                        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.action}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.15, duration: 0.6 }}
                      style={{
                        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.06)`
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                      
                      <div className="relative flex items-center gap-5">
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -3, 3, 0],
                            transition: { duration: 0.6 }
                          }}
                          style={{
                            boxShadow: `0 12px 40px ${item.shadowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                          }}
                        >
                          <item.icon size={24} className="text-white drop-shadow-lg" />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-black font-bold mb-2 group-hover:text-blue-700 transition-colors duration-300 text-lg">
                            {item.title}
                          </p>
                          <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Enhanced Message Display */}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`flex gap-5 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      style={{
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <Bot size={20} className="text-white drop-shadow-sm" />
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className={`max-w-[85%] ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-3xl rounded-br-xl p-6 shadow-2xl' 
                        : 'bg-white/80 backdrop-blur-xl text-gray-800 rounded-3xl rounded-bl-xl p-6 border border-gray-200/60 shadow-2xl'
                    }`}
                    whileHover={{ 
                      scale: 1.01,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    style={{
                      boxShadow: message.role === 'user' 
                        ? '0 12px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap font-medium">
                      {message.content}
                    </p>
                    
                    {/* Enhanced screenshot display */}
                    {message.screenshot && (
                      <motion.div 
                        className="mt-4 border border-gray-200/60 rounded-2xl overflow-hidden shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <img 
                          src={`data:image/png;base64,${message.screenshot}`}
                          alt="Browser screenshot"
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  {message.role === 'user' && (
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl border border-white/10"
                      whileHover={{ scale: 1.05 }}
                      style={{
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <User size={20} className="text-gray-300" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Enhanced Loading Animation */}
            <AnimatePresence>
              {(isLoading || isTyping) && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-5"
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Bot size={20} className="text-white" />
                  </motion.div>
                  
                  <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl rounded-bl-xl p-6 shadow-2xl">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <motion.div 
            className="p-6 backdrop-blur-xl border-t"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: `
                linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.04)'
            }}
          >
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-700" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about advanced features, browser automation, or platform integrations..."
                    className="relative w-full bg-gray-50/80 backdrop-blur-xl border-2 border-gray-200/60 rounded-3xl px-6 py-4 pr-14 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/80 hover:bg-white/70 hover:border-gray-300/70 transition-all duration-400 font-medium shadow-lg"
                    disabled={isLoading || isTyping}
                    style={{
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                    }}
                  />
                  
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 bg-gray-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-300/40">
                      <MessageSquare size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-3xl px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-xl transition-all duration-400 min-w-[60px] flex items-center justify-center font-semibold"
                  disabled={!inputMessage.trim() || isLoading || isTyping}
                  whileHover={{ 
                    scale: inputMessage.trim() && !isLoading && !isTyping ? 1.05 : 1,
                    boxShadow: inputMessage.trim() && !isLoading && !isTyping 
                      ? "0 20px 60px rgba(59, 130, 246, 0.4)"
                      : "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {isLoading || isTyping ? (
                    <SpinLoader size={20} />
                  ) : (
                    <Send size={18} />
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedAISidebar;