import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Search, ArrowRight, Zap, Star, Users, TrendingUp, Send, Bot, User } from 'lucide-react';
import UnifiedNavigationBar from './UnifiedNavigationBar';

const MainContent = ({ sidebarOpen, onToggleSidebar }) => {
  const [searchInput, setSearchInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  const { sendMessage, isLoading, messages } = useAI();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading) return;

    // Send message to AI
    try {
      await sendMessage(searchInput);
      setSearchInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || isLoading) return;

    try {
      await sendMessage(aiInput);
      setAiInput('');
    } catch (error) {
      console.error('Failed to send AI message:', error);
    }
  };

  return (
    <div className="h-full bg-dark-900 flex flex-col">
      {/* Unified Navigation Bar - Combines tabs and navigation */}
      <UnifiedNavigationBar 
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Layout with Direct AI Assistant */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Browser Content */}
        <div className="flex-1 flex items-center justify-center bg-dark-900 p-6">
          <div className="max-w-2xl w-full">
            {/* Main Interface */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Zap size={28} className="text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Fellou
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Your AI-powered browser assistant
              </p>

              {/* Main Search Bar */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Ask me anything or describe what you want to do..."
                    className="w-full px-6 py-4 text-lg bg-dark-800 border-2 border-dark-600 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition-colors disabled:opacity-50"
                    disabled={!searchInput.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight size={20} />
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-blue-600/30 transition-all"
                onClick={() => setSearchInput("Research the latest AI trends")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Search size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Research</h3>
                <p className="text-sm text-gray-300">Deep research on any topic with AI-powered analysis</p>
              </motion.div>

              <motion.div
                className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-purple-600/30 transition-all"
                onClick={() => setSearchInput("Automate data collection from websites")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Zap size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Automate</h3>
                <p className="text-sm text-gray-300">Automate repetitive tasks across multiple websites</p>
              </motion.div>

              <motion.div
                className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-green-500/30 hover:to-green-600/30 transition-all"
                onClick={() => setSearchInput("Generate leads from LinkedIn")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Generate Leads</h3>
                <p className="text-sm text-gray-300">Find and collect leads from social platforms</p>
              </motion.div>
            </div>

            {/* Stats/Features */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <span>50+ Integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" />
                <span>90% Time Saved</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                <span>Trusted by 10k+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Direct AI Assistant */}
        <div className="w-96 bg-dark-800 border-l border-dark-700 flex flex-col">
          {/* AI Assistant Header */}
          <div className="p-4 border-b border-dark-700 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-medium text-white">Fellou AI</h2>
              <p className="text-xs text-gray-400">Your AI Assistant</p>
            </div>
          </div>

          {/* AI Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot size={24} className="text-blue-400" />
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Hi! I'm Fellou, your AI assistant. How can I help you today?
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md p-3' 
                    : 'bg-dark-700 text-gray-100 rounded-r-2xl rounded-tl-2xl rounded-bl-md p-3 border border-dark-600'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="w-6 h-6 bg-dark-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-dark-700 border border-dark-600 rounded-r-2xl rounded-tl-2xl rounded-bl-md p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Input Area */}
          <div className="p-4 border-t border-dark-700">
            <form onSubmit={handleAiChat} className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-dark-700 border border-dark-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                className="bg-blue-500 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                disabled={!aiInput.trim() || isLoading}
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

export default MainContent;