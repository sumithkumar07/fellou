import asyncio
import json
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
import uuid
import httpx
from bs4 import BeautifulSoup

class ExecutionAgent:
    """
    Core execution engine for Fellou's Trinity Architecture.
    Handles actual task execution with shadow workspace support.
    """
    
    def __init__(self, db_client=None, websocket_manager=None):
        self.db = db_client
        self.websocket_manager = websocket_manager
        self.active_executions = {}
        self.shadow_workspace_tasks = {}
        
    async def execute_workflow(self, workflow_plan: Dict[str, Any], session_id: str, 
                             progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Execute a complete workflow with shadow workspace support.
        
        Args:
            workflow_plan: Structured workflow plan from PlanningAgent
            session_id: User session identifier
            progress_callback: Optional callback for progress updates
            
        Returns:
            Execution results with step outcomes
        """
        
        workflow_id = workflow_plan["workflow_id"]
        execution_id = str(uuid.uuid4())
        
        # Initialize execution tracking
        execution_context = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "session_id": session_id,
            "status": "running",
            "started_at": datetime.now(),
            "steps_completed": 0,
            "total_steps": len(workflow_plan.get("steps", [])),
            "results": {},
            "shadow_tasks": []
        }
        
        self.active_executions[execution_id] = execution_context
        
        try:
            # Execute workflow based on strategy
            strategy = workflow_plan.get("execution_strategy", "sequential")
            
            if strategy == "sequential":
                results = await self._execute_sequential(workflow_plan, execution_context, progress_callback)
            elif strategy == "parallel":
                results = await self._execute_parallel(workflow_plan, execution_context, progress_callback)
            else:  # hybrid
                results = await self._execute_hybrid(workflow_plan, execution_context, progress_callback)
            
            # Mark as completed
            execution_context["status"] = "completed"
            execution_context["completed_at"] = datetime.now()
            execution_context["final_results"] = results
            
            # Store results in database
            if self.db:
                await self.db.executions.insert_one(execution_context)
            
            return {
                "execution_id": execution_id,
                "status": "completed",
                "results": results,
                "execution_time": (execution_context.get("completed_at", datetime.now()) - execution_context["started_at"]).total_seconds(),
                "steps_completed": execution_context["steps_completed"]
            }
            
        except Exception as e:
            # Mark as failed
            execution_context["status"] = "failed"
            execution_context["error"] = str(e)
            execution_context["failed_at"] = datetime.now()
            
            return {
                "execution_id": execution_id,
                "status": "failed", 
                "error": str(e),
                "results": execution_context.get("results", {}),
                "steps_completed": execution_context["steps_completed"]
            }

    async def _execute_sequential(self, workflow_plan: Dict, execution_context: Dict, 
                                progress_callback: Optional[Callable]) -> Dict[str, Any]:
        """Execute workflow steps sequentially."""
        
        results = {}
        steps = workflow_plan.get("steps", [])
        
        for i, step in enumerate(steps):
            step_id = step["step_id"]
            
            # Check dependencies
            if not await self._check_dependencies(step, results):
                raise Exception(f"Dependencies not met for step {step_id}")
            
            # Execute step (shadow or foreground)
            if step.get("shadow_workspace", False):
                step_result = await self._execute_shadow_step(step, results, execution_context)
            else:
                step_result = await self._execute_foreground_step(step, results, execution_context)
            
            results[step_id] = step_result
            execution_context["steps_completed"] += 1
            
            # Send progress update
            progress = (i + 1) / len(steps) * 100
            if progress_callback:
                await progress_callback(progress, step_id, step_result)
            
            # Send WebSocket update
            if self.websocket_manager:
                await self.websocket_manager.send_update(
                    execution_context["session_id"],
                    {
                        "type": "step_completed",
                        "step_id": step_id,
                        "progress": progress,
                        "result": step_result
                    }
                )
        
        return results

    async def _execute_parallel(self, workflow_plan: Dict, execution_context: Dict,
                              progress_callback: Optional[Callable]) -> Dict[str, Any]:
        """Execute workflow steps in parallel where possible."""
        
        steps = workflow_plan.get("steps", [])
        results = {}
        completed_steps = set()
        
        # Group steps by dependency levels
        step_groups = self._create_dependency_groups(steps)
        
        for group_index, step_group in enumerate(step_groups):
            # Execute all steps in this group in parallel
            group_tasks = []
            
            for step in step_group:
                if step.get("shadow_workspace", False):
                    task = self._execute_shadow_step(step, results, execution_context)
                else:
                    task = self._execute_foreground_step(step, results, execution_context)
                group_tasks.append((step["step_id"], task))
            
            # Wait for all tasks in group to complete
            group_results = await asyncio.gather(*[task for _, task in group_tasks])
            
            # Store results
            for (step_id, _), result in zip(group_tasks, group_results):
                results[step_id] = result
                completed_steps.add(step_id)
                execution_context["steps_completed"] += 1
                
                # Send progress update
                progress = len(completed_steps) / len(steps) * 100
                if progress_callback:
                    await progress_callback(progress, step_id, result)
        
        return results

    async def _execute_hybrid(self, workflow_plan: Dict, execution_context: Dict,
                            progress_callback: Optional[Callable]) -> Dict[str, Any]:
        """Execute workflow with hybrid sequential/parallel strategy."""
        
        # Implement sophisticated hybrid execution
        # For now, fall back to sequential
        return await self._execute_sequential(workflow_plan, execution_context, progress_callback)

    async def _execute_shadow_step(self, step: Dict, context_results: Dict, 
                                 execution_context: Dict) -> Dict[str, Any]:
        """Execute a step in shadow workspace (background)."""
        
        shadow_task_id = str(uuid.uuid4())
        
        # Add to shadow workspace tracking
        shadow_task = {
            "task_id": shadow_task_id,
            "step_id": step["step_id"],
            "status": "running",
            "started_at": datetime.now(),
            "agent": step.get("agent", "default"),
            "platform": step.get("platform", "web")
        }
        
        self.shadow_workspace_tasks[shadow_task_id] = shadow_task
        execution_context["shadow_tasks"].append(shadow_task_id)
        
        try:
            # Execute the actual step
            result = await self._execute_step_action(step, context_results)
            
            shadow_task["status"] = "completed"
            shadow_task["completed_at"] = datetime.now()
            shadow_task["result"] = result
            
            return result
            
        except Exception as e:
            shadow_task["status"] = "failed"
            shadow_task["error"] = str(e)
            shadow_task["failed_at"] = datetime.now()
            raise

    async def _execute_foreground_step(self, step: Dict, context_results: Dict,
                                     execution_context: Dict) -> Dict[str, Any]:
        """Execute a step in foreground (visible to user)."""
        
        # Execute the actual step action
        return await self._execute_step_action(step, context_results)

    async def _execute_step_action(self, step: Dict, context_results: Dict) -> Dict[str, Any]:
        """Execute the actual step action based on step type."""
        
        action_type = step.get("action_type", "unknown")
        parameters = step.get("parameters", {})
        
        # Route to appropriate handler based on action type
        if action_type == "navigate":
            return await self._handle_navigate_action(step, parameters, context_results)
        elif action_type == "search":
            return await self._handle_search_action(step, parameters, context_results)
        elif action_type == "extract":
            return await self._handle_extract_action(step, parameters, context_results)
        elif action_type == "analyze":
            return await self._handle_analyze_action(step, parameters, context_results)
        elif action_type == "report":
            return await self._handle_report_action(step, parameters, context_results)
        elif action_type == "integrate":
            return await self._handle_integrate_action(step, parameters, context_results)
        else:
            # Default simulation
            await asyncio.sleep(1)  # Simulate work
            return {
                "action": action_type,
                "status": "completed",
                "message": f"Executed {action_type} action",
                "data": {"simulated": True}
            }

    async def _handle_navigate_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle web navigation action."""
        
        url = parameters.get("url", "")
        if not url:
            raise ValueError("Navigation requires URL parameter")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                content = response.text
                
            # Parse content
            soup = BeautifulSoup(content, 'html.parser')
            title = soup.find('title').get_text() if soup.find('title') else url
            
            return {
                "action": "navigate",
                "status": "completed",
                "url": url,
                "title": title,
                "content_length": len(content),
                "status_code": response.status_code
            }
            
        except Exception as e:
            return {
                "action": "navigate",
                "status": "failed",
                "error": str(e),
                "url": url
            }

    async def _handle_search_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle search action across platforms."""
        
        query = parameters.get("query", "")
        platform = step.get("platform", "web")
        
        # Platform-specific search implementations would go here
        # For now, simulate search results
        
        await asyncio.sleep(2)  # Simulate search time
        
        results = [
            {"title": f"Result 1 for '{query}'", "url": "https://example1.com", "snippet": "Sample result..."},
            {"title": f"Result 2 for '{query}'", "url": "https://example2.com", "snippet": "Another result..."},
            {"title": f"Result 3 for '{query}'", "url": "https://example3.com", "snippet": "Third result..."}
        ]
        
        return {
            "action": "search",
            "status": "completed", 
            "query": query,
            "platform": platform,
            "results_count": len(results),
            "results": results
        }

    async def _handle_extract_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle data extraction action."""
        
        # Simulate data extraction
        await asyncio.sleep(1.5)
        
        return {
            "action": "extract",
            "status": "completed",
            "extracted_data": {
                "items": 15,
                "categories": ["tech", "ai", "browser"],
                "metadata": {"extraction_time": 1.5}
            }
        }

    async def _handle_analyze_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle data analysis action."""
        
        await asyncio.sleep(2.5)
        
        return {
            "action": "analyze",
            "status": "completed",
            "analysis": {
                "insights": ["Insight 1", "Insight 2", "Insight 3"],
                "metrics": {"score": 85, "confidence": 0.92},
                "recommendations": ["Recommendation 1", "Recommendation 2"]
            }
        }

    async def _handle_report_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle report generation action."""
        
        await asyncio.sleep(1)
        
        return {
            "action": "report",
            "status": "completed",
            "report": {
                "title": "Generated Report",
                "sections": 5,
                "word_count": 1200,
                "charts": 3,
                "format": "html"
            }
        }

    async def _handle_integrate_action(self, step: Dict, parameters: Dict, context: Dict) -> Dict[str, Any]:
        """Handle cross-platform integration action."""
        
        platform = step.get("platform", "unknown")
        
        await asyncio.sleep(1.5)
        
        return {
            "action": "integrate",
            "status": "completed",
            "platform": platform,
            "integration": {
                "connected": True,
                "data_synced": True,
                "actions_completed": 3
            }
        }

    async def _check_dependencies(self, step: Dict, completed_results: Dict) -> bool:
        """Check if step dependencies are satisfied."""
        
        dependencies = step.get("dependencies", [])
        if not dependencies:
            return True
        
        for dep_step_id in dependencies:
            if dep_step_id not in completed_results:
                return False
            if completed_results[dep_step_id].get("status") != "completed":
                return False
        
        return True

    def _create_dependency_groups(self, steps: List[Dict]) -> List[List[Dict]]:
        """Create groups of steps that can run in parallel."""
        
        groups = []
        remaining_steps = steps.copy()
        completed_steps = set()
        
        while remaining_steps:
            current_group = []
            
            # Find steps with satisfied dependencies
            for step in remaining_steps.copy():
                dependencies = step.get("dependencies", [])
                if all(dep in completed_steps for dep in dependencies):
                    current_group.append(step)
                    remaining_steps.remove(step)
            
            if not current_group:
                # No steps can run - circular dependency or error
                break
            
            groups.append(current_group)
            completed_steps.update(step["step_id"] for step in current_group)
        
        return groups

    def get_shadow_workspace_status(self) -> Dict[str, Any]:
        """Get current shadow workspace status."""
        
        active_tasks = [
            task for task in self.shadow_workspace_tasks.values()
            if task["status"] == "running"
        ]
        
        return {
            "active_tasks": len(active_tasks),
            "total_tasks": len(self.shadow_workspace_tasks),
            "tasks": active_tasks,
            "system_load": {
                "cpu": 23,  # Would be actual system metrics
                "memory": 41,
                "network": "active"
            }
        }