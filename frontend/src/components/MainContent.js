import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Globe, Search, ArrowRight, Zap, Star, Users, TrendingUp } from 'lucide-react';

const MainContent = ({ sidebarOpen, onToggleSidebar }) => {
  const [searchInput, setSearchInput] = useState('');
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
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div className="text-lg font-semibold text-gray-900">Fellou</div>
          </div>
          
          {/* URL/Address Bar */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 min-w-[400px]">
            <Globe size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search or enter website URL"
              className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* AI Chat Toggle */}
          {!sidebarOpen && (
            <motion.button
              onClick={onToggleSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare size={16} />
              <span className="text-sm font-medium">AI Assistant</span>
            </motion.button>
          )}
          
          {/* Profile/Settings */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Main Browser Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-2">
            <div className="flex items-center gap-2">
              {/* Active Tab */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <Globe size={14} className="text-gray-500" />
                <span className="text-sm text-gray-700">New Tab</span>
              </div>
              
              {/* Add Tab Button */}
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>

          {/* Browser Content */}
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="max-w-2xl w-full px-6">
              {/* Main Search Interface */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Zap size={28} className="text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Fellou
                </h1>
                
                <p className="text-xl text-gray-600 mb-8">
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
                      className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                      disabled={isLoading}
                    />
                    <motion.button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-xl p-3 hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                  className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSearchInput("Research the latest AI trends")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Search size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Research</h3>
                  <p className="text-sm text-gray-600">Deep research on any topic with AI-powered analysis</p>
                </motion.div>

                <motion.div
                  className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSearchInput("Automate data collection from websites")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Zap size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Automate</h3>
                  <p className="text-sm text-gray-600">Automate repetitive tasks across multiple websites</p>
                </motion.div>

                <motion.div
                  className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSearchInput("Generate leads from LinkedIn")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <Users size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Generate Leads</h3>
                  <p className="text-sm text-gray-600">Find and collect leads from social platforms</p>
                </motion.div>
              </div>

              {/* Stats/Features */}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span>50+ Integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span>90% Time Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
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