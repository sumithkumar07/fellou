import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useBrowser } from '../contexts/BrowserContext';
import { MessageSquare, Bot, User, Send, X, Plus, History, Pin, Zap, Search, Youtube, Globe, Sparkles, Camera, Play } from 'lucide-react';

const AISidebar = ({ onClose }) => {
  const [showChat, setShowChat] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage, createWorkflow, executeWorkflow, sendBrowserAction } = useAI();
  const { getActiveTab, takeScreenshot, executeBrowserAction } = useBrowser();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    try {
      // Check for browser commands
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('screenshot') || lowerMessage.includes('capture')) {
        const activeTab = getActiveTab();
        if (activeTab) {
          try {
            const screenshot = await takeScreenshot(activeTab.id);
            // Screenshot will be handled by WebSocket response
          } catch (error) {
            console.error('Screenshot failed:', error);
          }
        }
      }
      
      if (lowerMessage.includes('workflow') || lowerMessage.includes('automate')) {
        try {
          const workflow = await createWorkflow(message);
          // Auto-execute simple workflows
          if (workflow && workflow.workflow_id) {
            setTimeout(() => {
              executeWorkflow(workflow.workflow_id);
            }, 1000);
          }
        } catch (error) {
          console.error('Workflow creation failed:', error);
        }
      }
      
      // Send regular AI message
      await sendMessage(message);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <motion.div 
      className="w-full h-full bg-gradient-to-b from-white/98 via-gray-50/95 to-white/98 backdrop-blur-2xl flex flex-col overflow-hidden border-l border-gray-200/50 shadow-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%),
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)
        `
      }}
    >
      {/* Premium Header */}
      <div className="relative p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-100/80 via-white/80 to-gray-100/80 backdrop-blur-xl">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-t-xl" />
        
        <div className="relative flex items-center justify-between">
          {/* Premium Logo */}
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(59, 130, 246, 0.2),
                  0 8px 24px rgba(59, 130, 246, 0.3),
                  0 16px 48px rgba(59, 130, 246, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.15)
                `
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.6 }
              }}
              animate={{
                boxShadow: [
                  "0 0 0 1px rgba(59, 130, 246, 0.2), 0 8px 24px rgba(59, 130, 246, 0.3)",
                  "0 0 0 1px rgba(99, 102, 241, 0.25), 0 12px 32px rgba(99, 102, 241, 0.4)",
                  "0 0 0 1px rgba(59, 130, 246, 0.2), 0 8px 24px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bot size={20} className="text-white drop-shadow-sm" />
              {/* Inner glow */}
              <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-sm" />
            </motion.div>
            
            <div>
              <h2 className="text-black font-bold text-xl tracking-tight">Fellou AI</h2>
              <div className="flex items-center gap-2 mt-1">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-gray-600 font-medium tracking-wide">ONLINE & READY</span>
              </div>
            </div>
          </div>
          
          {/* Premium Header Actions */}
          <div className="flex items-center gap-2">
            {[
              { icon: Plus, tooltip: "New Chat" },
              { icon: History, tooltip: "History" },
              { icon: Pin, tooltip: "Pin Sidebar" }
            ].map(({ icon: Icon, tooltip }, index) => (
              <motion.button
                key={tooltip}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                title={tooltip}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon size={16} />
              </motion.button>
            ))}
            
            <motion.button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 ml-2"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              title="Close Assistant"
            >
              <X size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Premium Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages Container with Premium Scrollbar */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-8"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(71, 85, 105, 0.5) transparent'
            }}
          >
            {messages.length === 0 && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Premium Welcome Message */}
                <div className="text-center py-12 bg-gradient-to-b from-white/50 to-gray-50/30 rounded-2xl mx-4 backdrop-blur-sm border border-gray-100/50">
                  <motion.div
                    className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    style={{
                      boxShadow: `
                        0 0 0 1px rgba(59, 130, 246, 0.2),
                        0 16px 48px rgba(59, 130, 246, 0.3),
                        0 32px 96px rgba(59, 130, 246, 0.15)
                      `
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles size={28} className="text-white drop-shadow-lg" />
                    {/* Premium glow rings */}
                    <div className="absolute inset-0 rounded-3xl">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-3xl animate-ping opacity-75" />
                      <div className="absolute inset-2 bg-blue-400/20 rounded-2xl animate-ping opacity-50" style={{animationDelay: '1s'}} />
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-black mb-4 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to Fellou AI
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-relaxed max-w-sm mx-auto font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    I'm your intelligent browser assistant. I can help you browse, automate tasks, and get things done with precision.
                  </motion.p>
                </div>

                {/* Premium Quick Actions */}
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
                  
                  {/* Premium Action Cards */}
                  {[
                    {
                      icon: Youtube,
                      title: "Open YouTube",
                      description: "Browse and watch videos",
                      gradient: "from-red-500 to-red-600",
                      action: async () => {
                        const activeTab = getActiveTab();
                        if (activeTab) {
                          try {
                            await sendMessage("Navigate to YouTube and show me trending videos");
                          } catch (error) {
                            console.error('Failed to navigate to YouTube:', error);
                          }
                        }
                      }
                    },
                    {
                      icon: Globe,
                      title: "Web Search",
                      description: "Search intelligently across the web",
                      gradient: "from-blue-500 to-blue-600",
                      action: async () => {
                        setInputMessage("Search the web for latest AI trends and take a screenshot");
                        inputRef.current?.focus();
                      }
                    },
                    {
                      icon: Search,
                      title: "Research Assistant",
                      description: "Deep research and analysis",
                      gradient: "from-purple-500 to-purple-600",
                      action: async () => {
                        try {
                          await createWorkflow("Research the latest developments in browser automation and AI agents, extract key insights from top 5 websites");
                        } catch (error) {
                          console.error('Failed to create research workflow:', error);
                        }
                      }
                    }
                  ].map((item, index) => (
                    <motion.button
                      key={item.title}
                      className="group w-full bg-gray-50/80 backdrop-blur-xl hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/70 rounded-2xl p-6 text-left transition-all duration-500 shadow-sm hover:shadow-lg"
                      whileHover={{ 
                        scale: 1.02, 
                        y: -4,
                        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.action}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.15, duration: 0.6 }}
                    >
                      {/* Premium glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
                      
                      <div className="relative flex items-center gap-5">
                        <motion.div 
                          className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
                          style={{
                            boxShadow: `
                              0 8px 24px rgba(0, 0, 0, 0.2),
                              0 2px 8px rgba(0, 0, 0, 0.1),
                              inset 0 1px 0 rgba(255, 255, 255, 0.2)
                            `
                          }}
                          whileHover={{ 
                            scale: 1.1,
                            rotate: [0, -2, 2, 0],
                            transition: { duration: 0.6 }
                          }}
                        >
                          <item.icon size={22} className="text-white drop-shadow-sm" />
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

            {/* Premium Message Display */}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className={`flex gap-5 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
                      style={{
                        boxShadow: `
                          0 0 0 1px rgba(59, 130, 246, 0.2),
                          0 8px 24px rgba(59, 130, 246, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.15)
                        `
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Bot size={20} className="text-white drop-shadow-sm" />
                    </motion.div>
                  )}
                  
                  <motion.div 
                    className={`max-w-[85%] ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-3xl rounded-br-xl p-6 shadow-xl' 
                        : 'bg-white/8 backdrop-blur-xl text-slate-100 rounded-3xl rounded-bl-xl p-6 border border-white/15 shadow-xl'
                    }`}
                    style={{
                      boxShadow: message.role === 'user' 
                        ? `
                          0 0 0 1px rgba(59, 130, 246, 0.2),
                          0 16px 48px rgba(59, 130, 246, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.15)
                        `
                        : `
                          0 16px 48px rgba(0, 0, 0, 0.2),
                          0 2px 16px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.05)
                        `
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap font-medium">
                      {message.content}
                    </p>
                    
                    {/* Display screenshot if available */}
                    {message.screenshot && (
                      <div className="mt-4 border border-white/20 rounded-xl overflow-hidden">
                        <img 
                          src={`data:image/png;base64,${message.screenshot}`}
                          alt="Browser screenshot"
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    )}
                    
                    {/* Display workflow progress */}
                    {message.type === 'progress' && message.progress !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${message.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{message.progress}% Complete</p>
                      </div>
                    )}
                    
                    {/* Display workflow info */}
                    {message.type === 'workflow' && message.workflow && (
                      <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={16} className="text-blue-400" />
                          <span className="text-sm text-blue-400 font-medium">Workflow Created</span>
                        </div>
                        <button
                          onClick={() => executeWorkflow(message.workflow.workflow_id)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <Play size={14} />
                          Execute Now
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {message.role === 'user' && (
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl border border-white/10"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User size={20} className="text-slate-300" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Premium Loading Animation */}
            <AnimatePresence>
              {isLoading && (
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
                  >
                    <Bot size={20} className="text-white" />
                  </motion.div>
                  
                  <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl rounded-bl-xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((index) => (
                          <motion.div
                            key={index}
                            className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                            animate={{ 
                              scale: [1, 1.3, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: index * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Premium Input Area */}
          <div className="p-6 bg-gradient-to-t from-gray-50/90 via-white/80 to-transparent border-t border-gray-200/50 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  {/* Input glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Try: 'Create workflow for...' | 'Automate this page' | 'Research and extract data'"
                    className="relative w-full bg-gray-50/80 backdrop-blur-xl border border-gray-300/50 rounded-2xl px-6 py-4 pr-14 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/80 hover:bg-white/60 hover:border-gray-400/50 transition-all duration-300 font-medium shadow-lg"
                    disabled={isLoading}
                    style={{
                      boxShadow: `
                        0 4px 16px rgba(0, 0, 0, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `
                    }}
                  />
                  
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-8 bg-gray-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-300/30">
                      <MessageSquare size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 min-w-[60px] flex items-center justify-center font-semibold"
                  style={{
                    boxShadow: !inputMessage.trim() || isLoading 
                      ? '0 4px 16px rgba(0, 0, 0, 0.1)'
                      : `
                        0 0 0 1px rgba(59, 130, 246, 0.2),
                        0 8px 24px rgba(59, 130, 246, 0.3),
                        0 16px 32px rgba(59, 130, 246, 0.15)
                      `
                  }}
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ 
                    scale: inputMessage.trim() && !isLoading ? 1.05 : 1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <motion.div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </motion.button>
              </div>
              

            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISidebar;