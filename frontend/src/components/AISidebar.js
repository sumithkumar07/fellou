import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Bot, User, Send, X, Plus, History, Pin, Zap, Search, Youtube, Globe } from 'lucide-react';

const AISidebar = ({ onClose }) => {
  const [showChat, setShowChat] = useState(true); // Start with chat open
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
    <div className="w-full h-full bg-dark-900 flex flex-col overflow-hidden">
      {/* Clean Header with Icons */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold">Fellou AI</span>
        </div>
        
        {/* Header Icons */}
        <div className="flex items-center gap-1">
          <motion.button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="New Chat"
          >
            <Plus size={16} />
          </motion.button>
          
          <motion.button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="History"
          >
            <History size={16} />
          </motion.button>
          
          <motion.button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Pin"
          >
            <Pin size={16} />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 rounded transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Close"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>



      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Recommendations */}
                <div className="space-y-3">
                  <h3 className="text-white text-sm font-medium px-2">Recommendations</h3>
                  
                  {/* Recommendation Cards */}
                  <motion.button
                    className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg p-4 text-left transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {/* Handle Open YouTube */}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Youtube size={20} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Open YouTube</p>
                        <p className="text-gray-400 text-sm">Browse and watch videos</p>
                      </div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg p-4 text-left transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {/* Handle Web Search */}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Globe size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Web Search</p>
                        <p className="text-gray-400 text-sm">Search the internet</p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>
            )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot size={18} className="text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl rounded-br-md p-4 shadow-lg' 
                      : 'bg-slate-800 text-slate-100 rounded-2xl rounded-bl-md p-4 border border-slate-600/50 shadow-lg'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User size={18} className="text-slate-200" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="bg-slate-800 border border-slate-600/50 rounded-2xl rounded-bl-md p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="text-slate-400 text-sm ml-2">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

                <div ref={messagesEndRef} />
              </div>

            {/* Professional Input Area */}
            <div className="p-6 bg-slate-800/50 border-t border-slate-600/50">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-slate-600/50 rounded-lg flex items-center justify-center">
                      <MessageSquare size={12} className="text-slate-400" />
                    </div>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 min-w-[50px] flex items-center justify-center"
                  disabled={!inputMessage.trim() || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </motion.button>
              </form>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg border border-slate-600/50 transition-all duration-200"
                >
                  💡 Suggestions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg border border-slate-600/50 transition-all duration-200"
                >
                  🔍 Research
                </motion.button>
              </div>
            </div>
            </div>
        </div>
    </div>
  );
};

export default AISidebar;