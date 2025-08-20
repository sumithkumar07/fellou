import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrop } from 'react-dnd';
import WorkflowNode from './WorkflowNode';
import Connection from './Connection';
import { 
  Plus, 
  Grid, 
  Zap,
  ArrowRight,
  Target
} from 'lucide-react';

const WorkflowCanvas = forwardRef(({ 
  nodes, 
  connections, 
  onNodeMove, 
  onNodeConnect, 
  onNodeDelete, 
  onNodeSelect,
  onDrop,
  draggedItem
}, ref) => {
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [connectionPreview, setConnectionPreview] = useState(null);
  
  const canvasRef = useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item, monitor) => {
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      const position = {
        x: (clientOffset.x - canvasRect.left - canvasOffset.x) / zoom,
        y: (clientOffset.y - canvasRect.top - canvasOffset.y) / zoom
      };
      
      onDrop(item, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Combine refs
  const combinedRef = (el) => {
    ref.current = el;
    canvasRef.current = el;
    drop(el);
  };

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDraggingCanvas(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingCanvas) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom * delta));
    setZoom(newZoom);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvas, lastMousePos]);

  const handleNodeConnectionStart = (nodeId, outputType) => {
    setConnectionPreview({
      sourceId: nodeId,
      outputType: outputType,
      startPos: getNodePosition(nodeId)
    });
  };

  const handleNodeConnectionEnd = (targetNodeId) => {
    if (connectionPreview && connectionPreview.sourceId !== targetNodeId) {
      onNodeConnect(connectionPreview.sourceId, targetNodeId);
    }
    setConnectionPreview(null);
  };

  const getNodePosition = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  };

  const renderGridPattern = () => {
    const gridSize = 20 * zoom;
    const offsetX = canvasOffset.x % gridSize;
    const offsetY = canvasOffset.y % gridSize;
    
    return (
      <defs>
        <pattern
          id="grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <circle cx={gridSize/2} cy={gridSize/2} r="0.5" fill="#374151" opacity="0.5" />
        </pattern>
      </defs>
    );
  };

  return (
    <div
      ref={combinedRef}
      className={`w-full h-full relative overflow-hidden bg-dark-900 ${
        isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
      } ${isOver && canDrop ? 'bg-primary-500/5' : ''}`}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {/* Grid Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {renderGridPattern()}
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Drop Zone Indicator */}
      <AnimatePresence>
        {isOver && canDrop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-4 border-2 border-dashed border-primary-500 rounded-lg bg-primary-500/10 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <Target size={48} className="text-primary-500 mx-auto mb-2" />
              <p className="text-primary-500 font-medium">Drop to add {draggedItem?.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {connections.map((connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <Connection
                key={connection.id}
                id={connection.id}
                start={sourceNode.position}
                end={targetNode.position}
                type={connection.type}
                animated={sourceNode.status === 'running'}
              />
            );
          })}
          
          {/* Connection Preview */}
          {connectionPreview && (
            <Connection
              start={connectionPreview.startPos}
              end={{ x: lastMousePos.x / zoom, y: lastMousePos.y / zoom }}
              type="preview"
              animated={true}
            />
          )}
        </svg>

        {/* Workflow Nodes */}
        <AnimatePresence>
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              onMove={(newPosition) => onNodeMove(node.id, newPosition)}
              onDelete={() => onNodeDelete(node.id)}
              onSelect={() => onNodeSelect(node)}
              onConnectionStart={(outputType) => handleNodeConnectionStart(node.id, outputType)}
              onConnectionEnd={() => handleNodeConnectionEnd(node.id)}
              zoom={zoom}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <Grid size={64} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Empty Canvas</h3>
            <p className="text-sm max-w-xs">
              Drag tasks from the left panel to build your workflow
            </p>
          </div>
        </div>
      )}

      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <motion.button
          className="w-10 h-10 bg-dark-800 border border-dark-600 rounded-lg flex items-center justify-center hover:bg-dark-700"
          onClick={() => setZoom(1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs text-gray-300">{Math.round(zoom * 100)}%</span>
        </motion.button>
        
        <motion.button
          className="w-10 h-10 bg-dark-800 border border-dark-600 rounded-lg flex items-center justify-center hover:bg-dark-700"
          onClick={() => setCanvasOffset({ x: 0, y: 0 })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Target size={16} className="text-gray-400" />
        </motion.button>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 bg-dark-800/80 backdrop-blur rounded-lg px-3 py-2">
        <div className="text-xs text-gray-400">
          {nodes.length} nodes • {connections.length} connections
        </div>
      </div>
    </div>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';

export default WorkflowCanvas;