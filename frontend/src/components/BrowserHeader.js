import React from 'react';
import { motion } from 'framer-motion';

const BrowserHeader = () => {
  return (
    <div className="h-8 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 select-none">
      {/* Traffic lights - macOS style */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>

      {/* App title */}
      <div className="flex-1 text-center">
        <span className="text-sm font-medium text-gray-300">Kairo AI Browser</span>
      </div>

      {/* Menu button */}
      <div className="flex items-center">
        <motion.button
          className="w-6 h-6 flex items-center justify-center hover:bg-dark-700 rounded"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default BrowserHeader;