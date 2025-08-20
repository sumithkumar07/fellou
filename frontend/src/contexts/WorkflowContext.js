import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const WorkflowContext = createContext();

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider = ({ children }) => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const createWorkflow = useCallback(async (instruction, sessionId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/workflow/create`, {
        instruction,
        session_id: sessionId,
        workflow_type: 'general'
      });

      const newWorkflow = response.data;
      setWorkflows(prev => [newWorkflow, ...prev]);
      
      return newWorkflow;
    } catch (error) {
      console.error('Workflow creation error:', error);
      throw error;
    }
  }, [backendUrl]);

  const executeWorkflow = useCallback(async (workflowId) => {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    try {
      // Update workflow status
      setActiveWorkflow(workflowId);
      
      const response = await axios.post(`${backendUrl}/api/workflow/execute/${workflowId}`);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Update workflows list with results
      setWorkflows(prev => prev.map(w => 
        w.workflow_id === workflowId 
          ? { ...w, ...response.data, status: 'completed' }
          : w
      ));

      setTimeout(() => {
        setExecutionProgress(100);
        setIsExecuting(false);
        setActiveWorkflow(null);
      }, 3000);

      return response.data;
    } catch (error) {
      console.error('Workflow execution error:', error);
      setIsExecuting(false);
      setActiveWorkflow(null);
      throw error;
    }
  }, [backendUrl]);

  const getWorkflowHistory = useCallback(() => {
    return workflows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [workflows]);

  const value = {
    workflows,
    activeWorkflow,
    isExecuting,
    executionProgress,
    createWorkflow,
    executeWorkflow,
    getWorkflowHistory
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};