import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Trash2, 
  Link, 
  Check,
  AlertCircle,
  Loader,
  Clock,
  Zap
} from 'lucide-react';

const WorkflowNode = ({ 
  node, 
  onMove, 
  onDelete, 
  onSelect, 
  onConnectionStart, 
  onConnectionEnd,
  zoom = 1 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef(null);

  const [{ isDragItem }, drag] = useDrag(() => ({
    type: 'workflow-node',
    item: { id: node.id, type: 'move' },
    collect: (monitor) => ({
      isDragItem: monitor.isDragging(),
    }),
    begin: () => setIsDragging(true),
    end: (item, monitor) => {
      setIsDragging(false);
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult();
        if (dropResult && dropResult.position) {
          onMove(dropResult.position);
        }
      }
    },
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'border-primary-500 shadow-primary-500/20';
      case 'completed': return 'border-green-500 shadow-green-500/20';
      case 'failed': return 'border-red-500 shadow-red-500/20';
      case 'paused': return 'border-yellow-500 shadow-yellow-500/20';
      default: return 'border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Loader size={12} className="animate-spin text-primary-500" />;
      case 'completed': return <Check size={12} className="text-green-500" />;
      case 'failed': return <AlertCircle size={12} className="text-red-500" />;
      case 'paused': return <Pause size={12} className="text-yellow-500" />;
      default: return <Clock size={12} className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      ref={(el) => {
        nodeRef.current = el;
        drag(el);
      }}
      className={`absolute cursor-move select-none ${isDragItem ? 'opacity-50' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: zoom * 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect()}
    >
      <div
        className={`w-64 bg-dark-800 border-2 rounded-xl p-4 shadow-lg transition-all duration-200 ${
          getStatusColor(node.status)
        } ${isHovered ? 'shadow-xl' : 'shadow-lg'}`}
      >
        {/* Node Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${node.color} flex items-center justify-center text-lg flex-shrink-0`}>
              {node.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm truncate">{node.title}</h3>
              <p className="text-xs text-gray-400 truncate">{node.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {getStatusIcon(node.status)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Node Content */}
        <div className="space-y-2 mb-3">
          {/* Inputs */}
          {node.inputs && node.inputs.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Inputs</div>
              <div className="flex flex-wrap gap-1">
                {node.inputs.map((input, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30"
                  >
                    {input}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outputs */}
          {node.outputs && node.outputs.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Outputs</div>
              <div className="flex flex-wrap gap-1">
                {node.outputs.map((output, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30"
                  >
                    {output}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Connection Points */}
        <div className="flex items-center justify-between">
          {/* Input Connection Point */}
          <div
            className="w-3 h-3 bg-blue-500 rounded-full border-2 border-dark-800 cursor-pointer hover:scale-125 transition-transform"
            onMouseEnter={() => onConnectionEnd && onConnectionEnd()}
            title="Input connection"
          />
          
          {/* Node Actions */}
          <div className="flex items-center gap-1">
            {node.status === 'running' ? (
              <button className="p-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded transition-colors">
                <Pause size={12} />
              </button>
            ) : (
              <button className="p-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-500 rounded transition-colors">
                <Play size={12} />
              </button>
            )}
            
            <button className="p-1 hover:bg-dark-700 text-gray-400 rounded transition-colors">
              <Settings size={12} />
            </button>
          </div>

          {/* Output Connection Point */}
          <div
            className="w-3 h-3 bg-green-500 rounded-full border-2 border-dark-800 cursor-pointer hover:scale-125 transition-transform"
            onMouseDown={() => onConnectionStart && onConnectionStart('data')}
            title="Output connection"
          />
        </div>

        {/* Status Progress Bar */}
        {node.status === 'running' && (
          <div className="mt-3">
            <div className="w-full bg-dark-700 rounded-full h-1">
              <motion.div
                className="bg-primary-500 h-1 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '70%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* Execution Info */}
        {(node.status === 'running' || node.status === 'completed') && (
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>
              {node.status === 'running' ? 'Processing...' : 'Completed'}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={10} />
              {node.estimatedCredits || 50} credits
            </span>
          </div>
        )}
      </div>

      {/* Hover Controls */}
      {isHovered && !isDragItem && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 flex items-center gap-1 shadow-lg"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1 hover:bg-dark-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Configure"
          >
            <Settings size={10} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Duplicate node logic would go here
            }}
            className="p-1 hover:bg-dark-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Duplicate"
          >
            <Link size={10} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={10} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorkflowNode;