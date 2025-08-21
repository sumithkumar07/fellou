import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Bot, User, Send, X, Plus, History, Pin, Zap, Search, Youtube, Globe, Sparkles } from 'lucide-react';

const AISidebar = ({ onClose }) => {
  const [showChat, setShowChat] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage } = useAI();
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
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900/95 backdrop-blur-xl flex flex-col overflow-hidden border-l border-slate-700/50 shadow-2xl">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
            whileHover={{ 
              scale: 1.1,
              rotate: 5 
            }}
            transition={{ duration: 0.2 }}
          >
            <Bot size={18} className="text-white" />
          </motion.div>
          <div>
            <span className="text-white font-bold text-lg">Fellou AI</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <motion.button
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="New Chat"
          >
            <Plus size={16} />
          </motion.button>
          
          <motion.button
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="History"
          >
            <History size={16} />
          </motion.button>
          
          <motion.button
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Pin Sidebar"
          >
            <Pin size={16} />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200 ml-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Close Assistant"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {messages.length === 0 && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Welcome Message */}
                <div className="text-center py-8">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles size={24} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Welcome to Fellou AI</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                    I'm your intelligent browser assistant. I can help you browse, automate tasks, and get things done efficiently.
                  </p>
                </div>

                {/* Enhanced Recommendations */}
                <div className="space-y-4">
                  <h4 className="text-white text-sm font-semibold px-2 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    Quick Actions
                  </h4>
                  
                  {/* Recommendation Cards */}
                  {[
                    {
                      icon: Youtube,
                      title: "Open YouTube",
                      description: "Browse and watch videos",
                      gradient: "from-red-500 to-red-600",
                      action: () => {}
                    },
                    {
                      icon: Globe,
                      title: "Web Search",
                      description: "Search the internet intelligently",
                      gradient: "from-blue-500 to-blue-600",
                      action: () => {}
                    },
                    {
                      icon: Search,
                      title: "Research Assistant",
                      description: "Deep research on any topic",
                      gradient: "from-purple-500 to-purple-600",
                      action: () => {}
                    }
                  ].map((item, index) => (
                    <motion.button
                      key={item.title}
                      className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 rounded-xl p-4 text-left transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.action}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1 group-hover:text-blue-200 transition-colors">{item.title}</p>
                          <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{item.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Enhanced Message Display */}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                
                <motion.div 
                  className={`max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-lg p-4 shadow-lg shadow-blue-500/25' 
                      : 'bg-slate-800/60 backdrop-blur-sm text-slate-100 rounded-2xl rounded-bl-lg p-4 border border-slate-600/50 shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                </motion.div>

                {message.role === 'user' && (
                  <div className="w-11 h-11 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User size={18} className="text-slate-200" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Enhanced Loading Animation */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl rounded-bl-lg p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="text-slate-400 text-sm ml-2 font-medium">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="p-6 bg-gradient-to-t from-slate-900/80 to-transparent border-t border-slate-700/50">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full bg-slate-800/60 backdrop-blur-xl border border-slate-600/50 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 group-hover:border-slate-500/50 transition-all duration-200 font-medium"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-7 h-7 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <MessageSquare size={14} className="text-slate-400" />
                    </div>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl px-5 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 min-w-[56px] flex items-center justify-center font-medium"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </motion.button>
              </div>
              
              {/* Enhanced Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white text-xs py-2.5 px-4 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 font-medium"
                >
                  💡 Get Ideas
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white text-xs py-2.5 px-4 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 font-medium"
                >
                  🔍 Research
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISidebar;