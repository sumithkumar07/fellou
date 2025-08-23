import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Loading States with Advanced Micro-Interactions
export const SkeletonLoader = ({ className = "", lines = 3 }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-200/80 via-gray-100/50 to-gray-200/80 h-4"
        style={{
          width: i === 0 ? '75%' : i === lines - 1 ? '50%' : '100%'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1, duration: 0.6 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
          animate={{ 
            x: ["-200%", "200%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
        />
      </motion.div>
    ))}
  </div>
);

export const ProgressiveLoader = ({ progress = 0, className = "" }) => (
  <div className={`relative h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
    <motion.div 
      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-lg"
      style={{
        boxShadow: `
          0 0 20px rgba(59, 130, 246, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `
      }}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute right-0 top-0 h-full w-8 bg-white/30 blur-sm"
        animate={{ 
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  </div>
);

export const TypingIndicator = ({ className = "" }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`
          }}
        />
      ))}
    </div>
    <motion.span 
      className="text-sm text-gray-600 font-medium ml-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Kairo is thinking...
    </motion.span>
  </div>
);

export const PulsingLoader = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-r ${colorClasses[color]} rounded-full shadow-xl`}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          boxShadow: `0 0 30px rgba(59, 130, 246, 0.4)`
        }}
      />
      
      {/* Pulse rings */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 border-2 border-blue-400/30 rounded-full ${sizeClasses[size]}`}
          animate={{ 
            scale: [1, 2, 2.5],
            opacity: [0.6, 0.2, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: index * 0.8,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

export const SpinLoader = ({ size = 20, className = "" }) => (
  <motion.div 
    className={`border-2 border-white/30 border-t-white rounded-full ${className}`}
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

export const ContentLoader = ({ isLoading, children, lines = 3 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {isLoading ? (
      <SkeletonLoader lines={lines} />
    ) : (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {children}
      </motion.div>
    )}
  </motion.div>
);