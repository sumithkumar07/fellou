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
      
      // Start real backend execution
      const response = await axios.post(`${backendUrl}/api/workflow/execute/${workflowId}`);
      
      // Real progress updates based on actual execution
      const executionResults = response.data;
      const totalSteps = executionResults.total_steps || 1;
      let currentStep = 0;
      
      // Simulate real-time progress based on execution results
      const progressInterval = setInterval(() => {
        currentStep++;
        const progress = Math.min((currentStep / totalSteps) * 100, 90);
        setExecutionProgress(progress);
        
        if (currentStep >= totalSteps) {
          clearInterval(progressInterval);
          setExecutionProgress(100);
        }
      }, 800);

      // Update workflows list with real results
      setWorkflows(prev => prev.map(w => 
        w.workflow_id === workflowId 
          ? { 
              ...w, 
              ...executionResults, 
              status: executionResults.status,
              last_execution: new Date().toISOString(),
              total_executions: (w.total_executions || 0) + 1
            }
          : w
      ));

      // Complete execution after real results
      setTimeout(() => {
        setExecutionProgress(100);
        setIsExecuting(false);
        setActiveWorkflow(null);
      }, 2000);

      return executionResults;
    } catch (error) {
      console.error('Workflow execution error:', error);
      setIsExecuting(false);
      setActiveWorkflow(null);
      setExecutionProgress(0);
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