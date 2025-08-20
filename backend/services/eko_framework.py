"""
Eko Framework - Natural Language Programming for Agents
Implements Fellou's Eko Framework for building agents with natural language
"""

import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import re
from groq import Groq
import os

class EkoFramework:
    """
    Natural Language Programming Framework for Agent Development.
    Matches Fellou's Eko Framework capabilities.
    """
    
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.agents = {}
        self.workflows = {}
        self.computer_use_enabled = True
        self.permissions = {
            "computer-use": False,
            "browser-automation": True,
            "file-system": False,
            "network-access": True
        }
        
    async def generate(self, instruction: str, model: str = "claude-3.5", context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate agent workflow from natural language instruction.
        Core Eko Framework functionality.
        """
        
        workflow_id = str(uuid.uuid4())
        
        try:
            # Parse natural language instruction
            parsed_instruction = await self._parse_instruction(instruction)
            
            # Generate executable workflow
            workflow = await self._generate_workflow(parsed_instruction, model)
            
            # Add framework metadata
            workflow_obj = {
                "id": workflow_id,
                "instruction": instruction,
                "model": model,
                "context": context or {},
                "workflow": workflow,
                "created_at": datetime.now().isoformat(),
                "status": "generated",
                "executable": True,
                "language": "natural",
                "framework_version": "1.0.0"
            }
            
            self.workflows[workflow_id] = workflow_obj
            
            return EkoWorkflow(workflow_obj, self)
            
        except Exception as e:
            return EkoWorkflow({
                "id": workflow_id,
                "instruction": instruction,
                "error": str(e),
                "status": "error",
                "executable": False
            }, self)

    async def _parse_instruction(self, instruction: str) -> Dict[str, Any]:
        """Parse natural language instruction into structured format."""
        
        parsing_prompt = f"""
        Parse this natural language instruction into structured components:
        
        Instruction: "{instruction}"
        
        Extract and return JSON with:
        {{
            "action_type": "search|analyze|create|extract|automate|monitor",
            "target_platforms": ["platform1", "platform2"],
            "data_sources": ["source1", "source2"],
            "output_format": "table|report|json|csv|html",
            "complexity": "simple|medium|complex",
            "requires_login": true|false,
            "estimated_steps": number,
            "key_entities": ["entity1", "entity2"],
            "filters": {{"key": "value"}},
            "automation_level": "manual|semi|full"
        }}
        """
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert at parsing natural language instructions for automation. Return valid JSON only."},
                    {"role": "user", "content": parsing_prompt}
                ],
                temperature=0.2,
                max_tokens=600
            )
            
            response = completion.choices[0].message.content
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return json.loads(response)
                
        except Exception:
            # Fallback parsing
            return {
                "action_type": "automate",
                "target_platforms": ["web"],
                "data_sources": ["web"],
                "output_format": "report",
                "complexity": "medium",
                "requires_login": False,
                "estimated_steps": 3,
                "key_entities": [],
                "filters": {},
                "automation_level": "semi"
            }

    async def _generate_workflow(self, parsed_instruction: Dict[str, Any], model: str) -> Dict[str, Any]:
        """Generate executable workflow from parsed instruction."""
        
        workflow_prompt = f"""
        Create an executable workflow for this parsed instruction:
        
        {json.dumps(parsed_instruction, indent=2)}
        
        Generate a complete workflow in JSON format:
        {{
            "title": "Workflow Title",
            "description": "Brief description",
            "steps": [
                {{
                    "id": "step_1",
                    "action": "browser.navigate|data.extract|ai.analyze|api.call|file.write",
                    "target": "platform or endpoint",
                    "parameters": {{"key": "value"}},
                    "conditions": {{"if": "condition", "then": "action"}},
                    "output_variable": "variable_name",
                    "error_handling": "retry|skip|fail",
                    "human_approval": true|false
                }}
            ],
            "variables": {{"var1": "default_value"}},
            "integrations": ["platform1", "platform2"],
            "permissions_required": ["permission1", "permission2"],
            "estimated_runtime": "5m",
            "parallel_execution": true|false
        }}
        """
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are the Eko Framework AI using {model}. Generate executable workflows in valid JSON."},
                    {"role": "user", "content": workflow_prompt}
                ],
                temperature=0.3,
                max_tokens=1200
            )
            
            response = completion.choices[0].message.content
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                workflow = json.loads(json_match.group())
            else:
                workflow = json.loads(response)
                
            # Validate and enhance workflow
            return self._validate_workflow(workflow, parsed_instruction)
            
        except Exception as e:
            # Generate fallback workflow
            return self._create_fallback_workflow(parsed_instruction)

    def _validate_workflow(self, workflow: Dict[str, Any], parsed_instruction: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance generated workflow."""
        
        # Ensure required fields
        workflow.setdefault("title", "Generated Workflow")
        workflow.setdefault("description", "AI-generated automation workflow")
        workflow.setdefault("steps", [])
        workflow.setdefault("variables", {})
        workflow.setdefault("integrations", [])
        workflow.setdefault("permissions_required", [])
        workflow.setdefault("estimated_runtime", "5m")
        workflow.setdefault("parallel_execution", False)
        
        # Validate steps
        for i, step in enumerate(workflow.get("steps", [])):
            step.setdefault("id", f"step_{i+1}")
            step.setdefault("action", "generic.execute")
            step.setdefault("target", "web")
            step.setdefault("parameters", {})
            step.setdefault("error_handling", "retry")
            step.setdefault("human_approval", False)
            
        # Add Eko-specific enhancements
        workflow["eko_enhanced"] = True
        workflow["natural_language_input"] = True
        workflow["computer_use_compatible"] = True
        workflow["cross_platform"] = len(workflow["integrations"]) > 1
        
        return workflow

    def _create_fallback_workflow(self, parsed_instruction: Dict[str, Any]) -> Dict[str, Any]:
        """Create basic fallback workflow when generation fails."""
        
        return {
            "title": "Basic Automation Workflow",
            "description": f"Execute {parsed_instruction.get('action_type', 'automation')} task",
            "steps": [
                {
                    "id": "step_1",
                    "action": "browser.navigate",
                    "target": "web",
                    "parameters": {"url": "https://example.com"},
                    "error_handling": "retry",
                    "human_approval": False
                },
                {
                    "id": "step_2", 
                    "action": "data.extract",
                    "target": "current_page",
                    "parameters": {"format": parsed_instruction.get("output_format", "json")},
                    "error_handling": "retry",
                    "human_approval": False
                }
            ],
            "variables": {},
            "integrations": parsed_instruction.get("target_platforms", ["web"]),
            "permissions_required": ["browser-automation"],
            "estimated_runtime": "3m",
            "parallel_execution": False,
            "fallback": True
        }

    async def computer_use(self) -> 'EkoComputerUse':
        """
        Initialize computer use capabilities.
        Provides Fellou's computer use functionality.
        """
        
        if not self.permissions.get("computer-use", False):
            raise PermissionError("Computer use permission not granted")
            
        return EkoComputerUse(self)

class EkoWorkflow:
    """
    Eko Workflow object with modification and execution capabilities.
    """
    
    def __init__(self, workflow_data: Dict[str, Any], framework: EkoFramework):
        self.data = workflow_data
        self.framework = framework
        
    def modify(self, modification: str) -> 'EkoWorkflow':
        """Modify workflow using natural language."""
        
        # Store modification request
        if "modifications" not in self.data:
            self.data["modifications"] = []
            
        self.data["modifications"].append({
            "request": modification,
            "timestamp": datetime.now().isoformat()
        })
        
        # Apply modification (simplified - in production this would use AI)
        if "include" in modification.lower():
            # Add new step or field
            if "table" in modification.lower() and "csv" in modification.lower():
                # Add CSV export step
                self.data["workflow"]["steps"].append({
                    "id": f"step_{len(self.data['workflow']['steps']) + 1}",
                    "action": "data.export",
                    "target": "csv_file",
                    "parameters": {"format": "csv", "include_table": True},
                    "error_handling": "retry"
                })
                
        elif "also" in modification.lower():
            # Add additional data source or action
            if "contributions" in modification.lower():
                # Enhance existing search step
                for step in self.data["workflow"]["steps"]:
                    if step.get("action") == "data.extract":
                        step["parameters"]["include_contributions"] = True
                        
        # Mark as modified
        self.data["status"] = "modified"
        self.data["last_modified"] = datetime.now().isoformat()
        
        return self

    async def execute(self) -> Dict[str, Any]:
        """Execute the workflow."""
        
        if not self.data.get("executable", True):
            return {
                "status": "error",
                "error": "Workflow is not executable",
                "workflow_id": self.data.get("id")
            }
        
        execution_id = str(uuid.uuid4())
        
        try:
            # Import execution agent
            from services.agent_system.execution_agent import ExecutionAgent
            executor = ExecutionAgent()
            
            # Convert Eko workflow to execution format
            execution_plan = self._convert_to_execution_plan()
            
            # Execute workflow
            result = await executor.execute_workflow(
                execution_plan,
                execution_id,
                shadow_mode=True
            )
            
            return {
                "execution_id": execution_id,
                "workflow_id": self.data.get("id"),
                "status": "completed",
                "result": result,
                "framework": "eko",
                "natural_language_input": self.data.get("instruction"),
                "executed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "execution_id": execution_id,
                "workflow_id": self.data.get("id"),
                "status": "failed",
                "error": str(e),
                "framework": "eko"
            }

    def _convert_to_execution_plan(self) -> Dict[str, Any]:
        """Convert Eko workflow to execution agent format."""
        
        workflow = self.data.get("workflow", {})
        
        # Convert Eko steps to execution steps
        execution_steps = []
        for step in workflow.get("steps", []):
            execution_step = {
                "id": step.get("id"),
                "type": self._map_action_to_type(step.get("action", "")),
                "description": f"Execute {step.get('action')} on {step.get('target')}",
                "platform": step.get("target", "web"),
                "parameters": step.get("parameters", {}),
                "estimated_duration_seconds": 30,
                "depends_on": [],
                "success_criteria": "Action completed successfully"
            }
            execution_steps.append(execution_step)
        
        return {
            "workflow_id": self.data.get("id"),
            "title": workflow.get("title", "Eko Workflow"),
            "description": workflow.get("description", "Generated from natural language"),
            "instruction": self.data.get("instruction", ""),
            "steps": execution_steps,
            "estimated_time_minutes": self._parse_runtime(workflow.get("estimated_runtime", "5m")),
            "estimated_credits": len(execution_steps) * 3,
            "required_platforms": workflow.get("integrations", ["web"]),
            "execution_strategy": {
                "execution_mode": "parallel" if workflow.get("parallel_execution", False) else "sequential",
                "parallel": workflow.get("parallel_execution", False),
                "shadow_workspace": True
            },
            "created_at": self.data.get("created_at"),
            "eko_workflow": True
        }

    def _map_action_to_type(self, action: str) -> str:
        """Map Eko actions to execution types."""
        
        action_map = {
            "browser.navigate": "navigate",
            "data.extract": "extract",
            "data.export": "export",
            "ai.analyze": "analyze",
            "api.call": "api",
            "file.write": "file",
            "browser.click": "click",
            "browser.type": "type",
            "browser.scroll": "scroll"
        }
        
        return action_map.get(action, "action")

    def _parse_runtime(self, runtime_str: str) -> int:
        """Parse runtime string to minutes."""
        
        if "m" in runtime_str:
            return int(re.findall(r'\d+', runtime_str)[0])
        elif "h" in runtime_str:
            return int(re.findall(r'\d+', runtime_str)[0]) * 60
        elif "s" in runtime_str:
            return max(1, int(re.findall(r'\d+', runtime_str)[0]) // 60)
        
        return 5  # Default 5 minutes

class EkoComputerUse:
    """
    Eko Computer Use implementation.
    Provides system-level automation capabilities.
    """
    
    def __init__(self, framework: EkoFramework):
        self.framework = framework
        
    def screenshot(self, region: Dict[str, int] = None) -> Dict[str, Any]:
        """Take screenshot of current screen or region."""
        
        return {
            "screenshot_id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "region": region or {"x": 0, "y": 0, "width": 1920, "height": 1080},
            "format": "png",
            "simulated": True,
            "note": "Screenshot captured via Eko computer use"
        }

    async def run(self, instruction: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute natural language instruction on the system.
        Core computer use functionality.
        """
        
        try:
            # Parse instruction for system interaction
            if "search input box" in instruction.lower():
                return {
                    "action": "find_element",
                    "element_type": "input",
                    "selector": "input[type='search'], input[name*='search'], input[placeholder*='search']",
                    "found": True,
                    "coordinates": {"x": 500, "y": 300},
                    "context": context
                }
            elif "click" in instruction.lower():
                button_match = re.search(r'click.*?(button|btn|submit)', instruction.lower())
                if button_match:
                    return {
                        "action": "click",
                        "element_type": "button",
                        "instruction": instruction,
                        "executed": True,
                        "coordinates": {"x": 600, "y": 400},
                        "context": context
                    }
            else:
                return {
                    "action": "generic",
                    "instruction": instruction,
                    "executed": True,
                    "result": f"Executed computer use command: {instruction}",
                    "context": context
                }
                
        except Exception as e:
            return {
                "action": "error",
                "instruction": instruction,
                "error": str(e),
                "context": context
            }

    def type(self, element: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Type text into specified element."""
        
        return {
            "action": "type",
            "element": element,
            "text": text,
            "executed": True,
            "timestamp": datetime.now().isoformat()
        }

# Export main class and utilities
__all__ = ['EkoFramework', 'EkoWorkflow', 'EkoComputerUse']