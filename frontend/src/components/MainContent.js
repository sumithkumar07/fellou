import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { MessageSquare, Search, Zap } from 'lucide-react';

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

  const suggestions = [
    "Research the latest AI trends and create a report",
    "Find contact information for tech companies",
    "Monitor social media for brand mentions",
    "Analyze competitor websites and pricing"
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Fellou</h1>
              <p className="text-sm text-gray-500">AI-Powered Browser Assistant</p>
            </div>
          </div>
          
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <MessageSquare size={16} />
              <span className="text-sm font-medium">Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Main Search */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What would you like to do?
            </h2>
            <p className="text-gray-600 mb-8">
              Describe any task and I'll help you get it done efficiently
            </p>
            
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Try: 'Research AI trends and create a report'"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors pr-16"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={!searchInput.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search size={20} />
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-4">Popular tasks:</p>
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSearchInput(suggestion)}
                  className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="text-gray-700">{suggestion}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={24} className="text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Smart Research</h3>
              <p className="text-sm text-gray-600">I can research any topic and compile comprehensive reports</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap size={24} className="text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Task Automation</h3>
              <p className="text-sm text-gray-600">Automate repetitive tasks across multiple websites</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={24} className="text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Natural Language</h3>
              <p className="text-sm text-gray-600">Just describe what you need in plain English</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;