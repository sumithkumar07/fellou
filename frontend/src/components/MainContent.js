import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Search, ArrowRight, Zap, Star, Users, TrendingUp } from 'lucide-react';
import UnifiedNavigationBar from './UnifiedNavigationBar';

const MainContent = ({ sidebarOpen, onToggleSidebar }) => {
  const [searchInput, setSearchInput] = useState('');
  const [splitView, setSplitView] = useState(false);
  const { sendMessage, isLoading } = useAI();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading) return;

    // If sidebar is closed, open it
    if (!sidebarOpen) {
      onToggleSidebar();
    }

    // Send message to AI
    try {
      await sendMessage(searchInput);
      setSearchInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-full bg-dark-900 flex flex-col">
      {/* Top Navigation Bar - Chrome-like */}
      <div className="bg-dark-800 border-b border-dark-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Browser Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Back"
            >
              <ArrowLeft size={16} />
            </motion.button>
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Forward"
            >
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh"
            >
              <RotateCcw size={16} />
            </motion.button>
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Home"
            >
              <Home size={16} />
            </motion.button>
          </div>
          
          {/* URL/Address Bar - Enhanced */}
          <div className="flex items-center bg-dark-700 border border-dark-600 rounded-full px-4 py-2 flex-1 max-w-2xl">
            <Lock size={14} className="text-green-400 mr-2" />
            <span className="text-xs text-green-400 mr-2">emergent://</span>
            <input
              type="text"
              placeholder="welcome"
              value="welcome"
              className="bg-transparent flex-1 text-sm text-white placeholder-gray-400 focus:outline-none"
              readOnly
            />
            <div className="ml-2 p-1.5 bg-blue-500 rounded-lg">
              <Zap size={12} className="text-white" />
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* AI Assistant Toggle */}
          {!sidebarOpen && (
            <motion.button
              onClick={onToggleSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors border border-blue-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare size={16} />
              <span className="text-sm font-medium">AI Assistant</span>
            </motion.button>
          )}
          
          {/* Profile/Settings */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Main Browser Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar - Enhanced */}
          <div className="bg-dark-800 border-b border-dark-700 px-6 py-2">
            <div className="flex items-center gap-2">
              {/* Active Tab */}
              <div className="flex items-center gap-3 px-4 py-2 bg-dark-700 border border-dark-600 rounded-t-lg">
                <Zap size={14} className="text-blue-400" />
                <span className="text-sm text-white">Welcome</span>
                <button className="ml-2 text-gray-400 hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
              
              {/* Add Tab Button */}
              <motion.button 
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-dark-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="New Tab"
              >
                <span className="text-lg">+</span>
              </motion.button>
            </div>
          </div>

          {/* Browser Content - Dark Theme */}
          <div className="flex-1 flex items-center justify-center bg-dark-900">
            <div className="max-w-2xl w-full px-6">
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

              {/* Quick Actions - Updated for Dark Theme */}
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

              {/* Stats/Features - Dark Theme */}
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
        </div>
      </div>
    </div>
  );
};

export default MainContent;