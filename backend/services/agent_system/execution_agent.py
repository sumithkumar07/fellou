import asyncio
from datetime import datetime

class ExecutionAgent:
    def __init__(self):
        self.active_workflows = {}
        self.execution_history = []
    
    async def execute_workflow(self, workflow_plan, workflow_id, shadow_mode=False):
        """Execute workflow in shadow environment."""
        try:
            self.active_workflows[workflow_id] = {
                "status": "running",
                "started_at": datetime.now().isoformat(),
                "shadow_mode": shadow_mode
            }
            
            # Simulate workflow execution
            steps = workflow_plan.get("steps", [])
            results = []
            
            for i, step in enumerate(steps):
                # Update step status
                step["status"] = "running"
                await asyncio.sleep(0.5)  # Simulate processing
                
                # Complete step
                step["status"] = "completed"
                results.append({
                    "step_id": step["id"],
                    "result": f"Step {i+1} completed successfully",
                    "timestamp": datetime.now().isoformat()
                })
            
            execution_result = {
                "workflow_id": workflow_id,
                "status": "completed",
                "results": results,
                "shadow_workspace_used": shadow_mode,
                "completed_at": datetime.now().isoformat(),
                "execution_time_seconds": len(steps) * 1
            }
            
            # Add to history
            self.execution_history.append(execution_result)
            
            # Remove from active workflows
            if workflow_id in self.active_workflows:
                del self.active_workflows[workflow_id]
            
            return execution_result
            
        except Exception as e:
            return {
                "workflow_id": workflow_id,
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            }
    
    def get_shadow_workspace_status(self):
        """Get current shadow workspace status."""
        return {
            "active": len(self.active_workflows) > 0,
            "active_workflows": len(self.active_workflows),
            "total_executions": len(self.execution_history),
            "last_execution": self.execution_history[-1]["completed_at"] if self.execution_history else None
        }
    
    def get_execution_history(self, limit=10):
        """Get recent execution history."""
        return self.execution_history[-limit:] if self.execution_history else []