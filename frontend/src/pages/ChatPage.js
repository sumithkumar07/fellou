import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { Bot, User, Send, Sparkles, MessageSquare } from 'lucide-react';

const ChatPage = () => {
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

  useEffect(() => {
    // Focus input on page load
    inputRef.current?.focus();
  }, []);

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

  const quickSuggestions = [
    "Research the latest AI trends and innovations",
    "Create a workflow to automate social media posting",
    "Help me generate leads from LinkedIn",
    "Build a data extraction workflow for e-commerce sites"
  ];

  return (
    <div className="flex-1 flex flex-col bg-dark-900 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-6 border-b border-dark-700"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Fellou AI</h1>
          <p className="text-sm text-gray-400">Your intelligent browser assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Start a conversation with Fellou AI
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                I can help you automate workflows, research topics, generate leads, and much more. 
                What would you like to accomplish today?
              </p>
              
              {/* Quick Suggestions */}
              <div className="grid gap-3 max-w-2xl mx-auto">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-left p-4 bg-dark-800 border border-dark-600 rounded-xl hover:border-blue-500/50 hover:bg-dark-700 transition-colors group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles size={16} className="text-blue-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {suggestion}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div className={`max-w-3xl ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm p-4' 
                    : 'bg-dark-800 border border-dark-600 text-gray-100 rounded-2xl rounded-bl-sm p-4'
                }`}>
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap m-0">{message.content}</p>
                  </div>
                  <div className="mt-2 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-dark-800 border border-dark-600 rounded-2xl rounded-bl-sm p-4">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-sm text-gray-400">Fellou is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-t border-dark-700"
      >
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message to Fellou AI..."
              className="w-full bg-dark-800 border border-dark-600 rounded-2xl px-6 py-4 pr-14 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-xl p-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              disabled={!inputMessage.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={16} />
            </motion.button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Press Enter to send</span>
            <span>•</span>
            <span>Shift + Enter for new line</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChatPage;