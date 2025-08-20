import React from 'react';
import { motion } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { 
  Settings, 
  Zap, 
  ArrowRight,
  Grip
} from 'lucide-react';

const DraggableTask = ({ task, onDragStart, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: task,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      onDragStart?.(task);
    },
    end: () => {
      onDragEnd?.();
    }
  }));

  return (
    <motion.div
      ref={drag}
      className={`bg-dark-700 border border-dark-600 rounded-lg p-3 cursor-grab hover:border-primary-500 transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-102'
      }`}
      whileHover={{ scale: isDragging ? 0.95 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-start gap-3">
        {/* Task Icon */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${task.color} flex items-center justify-center text-lg flex-shrink-0`}>
          {task.icon}
        </div>
        
        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-white text-sm truncate">{task.title}</h3>
            <Grip size={12} className="text-gray-500 flex-shrink-0" />
          </div>
          
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          
          {/* Task I/O Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-green-400">
              <span>{task.inputs?.length || 0}</span>
              <ArrowRight size={10} />
              <span>{task.outputs?.length || 0}</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-500">
              <Settings size={10} />
              <span>{Object.keys(task.parameters || {}).length}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Drag Indicator */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 border-2 border-dashed border-primary-500 rounded-lg bg-primary-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
};

export default DraggableTask;