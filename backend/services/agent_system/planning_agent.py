import asyncio
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from groq import Groq
import os

class PlanningAgent:
    """
    Agentic planning system that breaks down complex tasks into executable workflows.
    Implements Fellou's Deep Action technology for multi-step reasoning.
    """
    
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"
        
    async def create_workflow_plan(self, instruction: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Create a comprehensive workflow plan from natural language instruction.
        
        Args:
            instruction: User's natural language instruction
            context: Additional context like browser state, previous tasks
            
        Returns:
            Detailed workflow plan with steps, agents, and execution strategy
        """
        
        planning_prompt = self._build_planning_prompt(instruction, context)
        
        try:
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": planning_prompt}
                ],
                temperature=0.3,
                max_tokens=3000
            )
            
            plan_text = response.choices[0].message.content
            workflow_plan = await self._parse_workflow_plan(plan_text)
            
            # Add metadata
            workflow_plan.update({
                "created_at": datetime.now().isoformat(),
                "original_instruction": instruction,
                "planning_agent": "v1.0",
                "estimated_total_time": self._estimate_total_time(workflow_plan.get("steps", [])),
                "complexity_score": self._calculate_complexity(workflow_plan.get("steps", [])),
                "required_platforms": self._extract_platforms(workflow_plan.get("steps", []))
            })
            
            return workflow_plan
            
        except Exception as e:
            # Fallback plan generation
            return self._create_fallback_plan(instruction)
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the planning agent."""
        return """You are Fellou's Planning Agent, part of the Trinity Architecture (Browser + Workflow + Agent).

Your role is to analyze user instructions and create detailed, executable workflow plans using Deep Action technology.

Key capabilities:
1. Break complex tasks into atomic, executable steps
2. Identify required platforms and integrations (Twitter, LinkedIn, Reddit, GitHub, etc.)
3. Assign appropriate specialized agents to each step
4. Estimate time and credit costs
5. Plan parallel execution where possible
6. Consider shadow workspace execution for non-disruptive tasks

Output a JSON workflow plan with this structure:
{
  "workflow_id": "unique_id",
  "title": "descriptive_title",
  "description": "what_this_workflow_accomplishes",
  "execution_strategy": "sequential|parallel|hybrid",
  "steps": [
    {
      "step_id": "step_1",
      "action_type": "navigate|search|extract|analyze|report|integrate",
      "agent": "research_agent|social_agent|data_agent|web_agent",
      "platform": "twitter|linkedin|reddit|github|web|none",
      "description": "what_this_step_does",
      "inputs": ["required_inputs"],
      "outputs": ["expected_outputs"],
      "estimated_time": 30,
      "estimated_credits": 50,
      "shadow_workspace": true,
      "dependencies": ["step_ids_this_depends_on"],
      "parameters": {
        "url": "if_applicable",
        "query": "search_terms",
        "filters": {},
        "actions": []
      }
    }
  ],
  "estimated_credits": 500,
  "estimated_time_minutes": 15,
  "success_criteria": ["what_defines_success"],
  "fallback_strategies": ["what_to_do_if_steps_fail"]
}

Always prioritize:
- Atomic, executable steps
- Clear dependencies between steps  
- Realistic time/credit estimates
- Platform-specific optimizations
- Shadow workspace for non-disruptive execution
- Parallel execution where possible"""

    def _build_planning_prompt(self, instruction: str, context: Optional[Dict] = None) -> str:
        """Build the planning prompt with instruction and context."""
        
        prompt = f"""Plan a comprehensive workflow for this instruction:
"{instruction}"

"""
        
        if context:
            prompt += f"Additional context:\n"
            if context.get("browser_tabs"):
                prompt += f"- Current browser tabs: {context['browser_tabs']}\n"
            if context.get("previous_tasks"):
                prompt += f"- Previous tasks: {context['previous_tasks']}\n"
            if context.get("available_platforms"):
                prompt += f"- Available platforms: {context['available_platforms']}\n"
            prompt += "\n"
        
        prompt += """Consider these capabilities:

RESEARCH & DATA:
- Web search and content analysis
- LinkedIn profile and post extraction  
- Twitter/X post search and analysis
- Reddit discussion mining
- GitHub repository analysis
- News and blog monitoring
- Competitive intelligence gathering

AUTOMATION & INTEGRATION:
- Cross-platform posting and engagement
- Data synchronization between platforms
- Automated follow-up and outreach
- Report generation with visualizations
- Email and message automation
- File organization and processing

WEB INTERACTION:
- Form filling and submission
- Page navigation and interaction
- Element clicking and text input
- Screenshot capture and analysis
- Cookie and session management

Create a detailed workflow plan that maximizes efficiency and leverages shadow workspace execution."""

        return prompt

    async def _parse_workflow_plan(self, plan_text: str) -> Dict[str, Any]:
        """Parse the AI-generated workflow plan text into structured data."""
        
        try:
            # Extract JSON from the response
            start_idx = plan_text.find('{')
            end_idx = plan_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = plan_text[start_idx:end_idx]
                workflow_plan = json.loads(json_str)
                
                # Validate required fields
                required_fields = ["workflow_id", "title", "steps"]
                for field in required_fields:
                    if field not in workflow_plan:
                        raise ValueError(f"Missing required field: {field}")
                
                # Add step IDs if missing
                for i, step in enumerate(workflow_plan.get("steps", [])):
                    if "step_id" not in step:
                        step["step_id"] = f"step_{i+1}"
                
                return workflow_plan
            
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            print(f"Plan parsing error: {e}")
            # Return structured fallback
            return self._create_fallback_plan(plan_text[:100])

    def _create_fallback_plan(self, instruction: str) -> Dict[str, Any]:
        """Create a basic fallback workflow plan."""
        
        workflow_id = f"workflow_{int(datetime.now().timestamp())}"
        
        return {
            "workflow_id": workflow_id,
            "title": f"Workflow: {instruction[:50]}...",
            "description": "Fallback workflow generated due to planning error",
            "execution_strategy": "sequential",
            "steps": [
                {
                    "step_id": "step_1",
                    "action_type": "research",
                    "agent": "research_agent", 
                    "platform": "web",
                    "description": "Research and analyze the requested topic",
                    "inputs": [instruction],
                    "outputs": ["research_results"],
                    "estimated_time": 120,
                    "estimated_credits": 100,
                    "shadow_workspace": True,
                    "dependencies": [],
                    "parameters": {
                        "query": instruction,
                        "depth": "comprehensive"
                    }
                },
                {
                    "step_id": "step_2", 
                    "action_type": "report",
                    "agent": "data_agent",
                    "platform": "none",
                    "description": "Generate comprehensive report",
                    "inputs": ["research_results"],
                    "outputs": ["final_report"],
                    "estimated_time": 60,
                    "estimated_credits": 50,
                    "shadow_workspace": False,
                    "dependencies": ["step_1"],
                    "parameters": {
                        "format": "comprehensive",
                        "include_visuals": True
                    }
                }
            ],
            "estimated_credits": 150,
            "estimated_time_minutes": 3,
            "success_criteria": ["Research completed", "Report generated"],
            "fallback_strategies": ["Manual research", "Simplified report"]
        }

    def _estimate_total_time(self, steps: List[Dict]) -> int:
        """Estimate total execution time in minutes."""
        if not steps:
            return 0
            
        # Check if steps can run in parallel
        sequential_time = sum(step.get("estimated_time", 60) for step in steps)
        
        # Simple parallel optimization (in real implementation, this would be more sophisticated)
        parallel_groups = self._group_parallel_steps(steps)
        parallel_time = max(
            sum(step.get("estimated_time", 60) for step in group)
            for group in parallel_groups
        ) if parallel_groups else sequential_time
        
        return min(sequential_time, parallel_time) // 60  # Convert to minutes

    def _calculate_complexity(self, steps: List[Dict]) -> int:
        """Calculate workflow complexity score (1-10)."""
        if not steps:
            return 1
            
        complexity_factors = {
            "step_count": min(len(steps), 10),
            "platform_count": len(set(step.get("platform", "web") for step in steps)),
            "agent_count": len(set(step.get("agent", "basic") for step in steps)),
            "dependencies": sum(1 for step in steps if step.get("dependencies"))
        }
        
        # Weighted complexity score
        score = (
            complexity_factors["step_count"] * 0.3 +
            complexity_factors["platform_count"] * 0.25 + 
            complexity_factors["agent_count"] * 0.25 +
            complexity_factors["dependencies"] * 0.2
        )
        
        return min(int(score), 10)

    def _extract_platforms(self, steps: List[Dict]) -> List[str]:
        """Extract unique platforms required for this workflow."""
        platforms = set()
        for step in steps:
            platform = step.get("platform")
            if platform and platform != "none":
                platforms.add(platform)
        return list(platforms)

    def _group_parallel_steps(self, steps: List[Dict]) -> List[List[Dict]]:
        """Group steps that can run in parallel."""
        # Simple implementation - in real system this would use dependency analysis
        groups = []
        current_group = []
        
        for step in steps:
            dependencies = step.get("dependencies", [])
            if not dependencies:  # No dependencies, can run in parallel
                current_group.append(step)
            else:  # Has dependencies, start new group
                if current_group:
                    groups.append(current_group)
                current_group = [step]
        
        if current_group:
            groups.append(current_group)
            
        return groups