import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Panel
} from 'reactflow';
import { motion } from 'framer-motion';
import { Play, Pause, Save, Download, Upload, Zap, Database, MessageSquare, Settings, Code, Users, Globe } from 'lucide-react';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Custom Node Components
const TriggerNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-green-400 to-green-600 border-2 border-green-300 min-w-[150px]">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-white" />
        <div className="text-white font-medium">{data.label}</div>
      </div>
      <div className="text-green-100 text-xs mt-1">{data.description}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="trigger-out"
        style={{ background: '#10b981' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const ActionNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-blue-300 min-w-[150px]">
      <Handle
        type="target"
        position={Position.Left}
        id="action-in"
        style={{ background: '#3b82f6' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        <data.icon size={16} className="text-white" />
        <div className="text-white font-medium">{data.label}</div>
      </div>
      <div className="text-blue-100 text-xs mt-1">{data.description}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="action-out"
        style={{ background: '#3b82f6' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const ConditionNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-yellow-300 min-w-[150px]">
      <Handle
        type="target"
        position={Position.Left}
        id="condition-in"
        style={{ background: '#f59e0b' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        <Settings size={16} className="text-white" />
        <div className="text-white font-medium">{data.label}</div>
      </div>
      <div className="text-yellow-100 text-xs mt-1">{data.description}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="condition-true"
        style={{ background: '#10b981', top: '60%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="condition-false"
        style={{ background: '#ef4444', top: '80%' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const EndNode = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 border-2 border-purple-300 min-w-[150px]">
      <Handle
        type="target"
        position={Position.Left}
        id="end-in"
        style={{ background: '#8b5cf6' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-white" />
        <div className="text-white font-medium">{data.label}</div>
      </div>
      <div className="text-purple-100 text-xs mt-1">{data.description}</div>
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  end: EndNode,
};

const WorkflowCanvas = ({ workflow, onWorkflowUpdate, onExecute, isExecuting }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [isValidWorkflow, setIsValidWorkflow] = useState(false);

  // Validate workflow structure
  const validateWorkflow = useCallback(() => {
    const hasStart = nodes.some(node => node.type === 'trigger');
    const hasEnd = nodes.some(node => node.type === 'end');
    const hasConnections = edges.length > 0;
    setIsValidWorkflow(hasStart && hasEnd && hasConnections && nodes.length >= 2);
  }, [nodes, edges]);

  // Update validation when nodes or edges change
  React.useEffect(() => {
    validateWorkflow();
    if (onWorkflowUpdate) {
      onWorkflowUpdate({ nodes, edges });
    }
  }, [nodes, edges, validateWorkflow, onWorkflowUpdate]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: '#3b82f6' }
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      
      if (!nodeData) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode = {
        id: uuidv4(),
        type: nodeData.type,
        position,
        data: nodeData.data,
        style: { zIndex: 1000 }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const saveWorkflow = () => {
    const workflowData = {
      id: workflow?.id || uuidv4(),
      name: workflow?.name || 'Untitled Workflow',
      nodes,
      edges,
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflowData.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
  };

  const executeWorkflow = () => {
    if (isValidWorkflow && onExecute) {
      onExecute({ nodes, edges });
    }
  };

  return (
    <div className="h-full w-full bg-dark-900 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dark-900"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls className="bg-dark-800 border border-dark-700" />
        <MiniMap 
          className="bg-dark-800 border border-dark-700"
          nodeColor="#3b82f6"
          maskColor="rgba(17, 24, 39, 0.8)"
        />
        <Background variant="dots" gap={20} size={1} color="#374151" />
        
        {/* Workflow Controls Panel */}
        <Panel position="top-right" className="bg-dark-800 border border-dark-700 rounded-lg p-4 m-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white font-semibold">Workflow Controls</h3>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Execute Button */}
            <motion.button
              onClick={executeWorkflow}
              disabled={!isValidWorkflow || isExecuting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isValidWorkflow && !isExecuting
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={{ scale: isValidWorkflow ? 1.02 : 1 }}
              whileTap={{ scale: isValidWorkflow ? 0.98 : 1 }}
            >
              {isExecuting ? <Pause size={16} /> : <Play size={16} />}
              {isExecuting ? 'Executing...' : 'Execute'}
            </motion.button>
            
            {/* Save Button */}
            <motion.button
              onClick={saveWorkflow}
              disabled={nodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              Save
            </motion.button>
            
            {/* Clear Button */}
            <motion.button
              onClick={clearWorkflow}
              disabled={nodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear
            </motion.button>
          </div>
          
          {/* Workflow Status */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <div className="text-sm">
              <div className={`flex items-center gap-2 ${isValidWorkflow ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isValidWorkflow ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {isValidWorkflow ? 'Ready to Execute' : 'Invalid Workflow'}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Nodes: {nodes.length} | Connections: {edges.length}
              </div>
            </div>
          </div>
        </Panel>
        
        {/* Empty State */}
        {nodes.length === 0 && (
          <Panel position="center" className="pointer-events-none">
            <div className="text-center bg-dark-800/80 rounded-lg p-8 border border-dark-700">
              <Zap size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Workflow</h3>
              <p className="text-gray-400 mb-4">Drag components from the sidebar to create your automated workflow</p>
              <div className="text-sm text-gray-500">
                1. Add a Trigger to start<br/>
                2. Add Actions to execute<br/>
                3. Connect the nodes<br/>
                4. Execute your workflow
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;