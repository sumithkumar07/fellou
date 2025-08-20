import React from 'react';
import { motion } from 'framer-motion';

const Connection = ({ id, start, end, type = 'data', animated = false }) => {
  // Calculate connection path
  const calculatePath = () => {
    const startX = start.x + 256; // Node width
    const startY = start.y + 80;  // Approximate center height
    const endX = end.x;
    const endY = end.y + 80;

    // Calculate control points for smooth curve
    const controlPointOffset = Math.abs(endX - startX) * 0.5;
    const controlPoint1X = startX + controlPointOffset;
    const controlPoint1Y = startY;
    const controlPoint2X = endX - controlPointOffset;
    const controlPoint2Y = endY;

    return `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  };

  const getConnectionColor = (type) => {
    switch (type) {
      case 'data': return '#3b82f6'; // Blue
      case 'control': return '#f59e0b'; // Amber
      case 'error': return '#ef4444'; // Red
      case 'preview': return '#8b5cf6'; // Purple
      default: return '#6b7280'; // Gray
    }
  };

  const connectionColor = getConnectionColor(type);
  const strokeWidth = type === 'preview' ? 3 : 2;
  const opacity = type === 'preview' ? 0.7 : 1;

  return (
    <g className="connection">
      {/* Connection Path */}
      <motion.path
        d={calculatePath()}
        stroke={connectionColor}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeDasharray={type === 'preview' ? '5,5' : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={ animated ? {
          pathLength: 1,
          opacity: opacity,
          strokeDashoffset: [0, -10, 0]
        } : {
          pathLength: 1,
          opacity: opacity
        }}
        transition={{
          pathLength: { duration: 0.5, ease: "easeInOut" },
          opacity: { duration: 0.3 },
          strokeDashoffset: animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          } : {}
        }}
        className="drop-shadow-sm"
      />

      {/* Connection Arrow */}
      <motion.polygon
        points={`${end.x - 8},${end.y + 75} ${end.x},${end.y + 80} ${end.x - 8},${end.y + 85}`}
        fill={connectionColor}
        opacity={opacity}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: opacity, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      />

      {/* Animated Data Flow Dots */}
      {animated && type !== 'preview' && (
        <>
          <motion.circle
            r="3"
            fill={connectionColor}
            opacity="0.8"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={calculatePath()}
            />
          </motion.circle>
          
          <motion.circle
            r="2"
            fill={connectionColor}
            opacity="0.6"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={calculatePath()}
            />
          </motion.circle>
        </>
      )}

      {/* Connection Label */}
      {type !== 'preview' && (
        <motion.text
          x={(start.x + end.x + 256) / 2}
          y={(start.y + end.y + 160) / 2 - 10}
          textAnchor="middle"
          className="text-xs fill-gray-400 font-medium pointer-events-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5 }}
        >
          {type}
        </motion.text>
      )}

      {/* Connection Hit Area (for selection/deletion) */}
      {id && type !== 'preview' && (
        <path
          d={calculatePath()}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
          className="cursor-pointer hover:stroke-red-500 hover:stroke-opacity-20 transition-colors"
          onClick={() => {
            // Handle connection deletion
            console.log('Connection clicked:', id);
          }}
        />
      )}
    </g>
  );
};

export default Connection;