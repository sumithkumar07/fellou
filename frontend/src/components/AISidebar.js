import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Bot, User, Send, X } from 'lucide-react';

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
    <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col overflow-hidden">
      {/* Professional Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fellou AI</h2>
              <p className="text-blue-100 text-sm font-medium">Your Intelligent Assistant</p>
            </div>
          </div>
          
          {/* Elegant Close Button */}
          <motion.button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Close Fellou Assistant"
          >
            <X size={20} />
          </motion.button>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-blue-100 text-sm">Online & Ready</span>
        </div>
      </div>



        {/* Chat Content */}
        <div className="flex-1 overflow-hidden bg-slate-900/50">
          <div className="h-full flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center mt-12">
                  {/* Welcome Card */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 shadow-xl border border-slate-600/50">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Bot size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Welcome to Fellou AI!</h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      Your intelligent browser assistant is ready to help with research, automation, and web browsing tasks.
                    </p>
                    
                    {/* Feature Cards */}
                    <div className="grid gap-3 text-left">
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-sm">🌐</span>
                        </div>
                        <span className="text-slate-300 text-sm">Navigate and analyze websites</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-400 text-sm">⚡</span>
                        </div>
                        <span className="text-slate-300 text-sm">Create automated workflows</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 text-sm">🔍</span>
                        </div>
                        <span className="text-slate-300 text-sm">Research and analyze content</span>
                      </div>
                    </div>
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
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-dark-700 border border-dark-600 rounded-r-xl rounded-tl-xl rounded-bl-md p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-dark-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    className="bg-blue-500 text-white rounded-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    disabled={!inputMessage.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={16} />
                  </motion.button>
                </form>
              </div>
            </div>
        </div>
    </div>
  );
};

export default AISidebar;