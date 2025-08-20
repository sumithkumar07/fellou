import os
import json
from groq import Groq
from datetime import datetime

class PlanningAgent:
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    async def create_workflow_plan(self, instruction, context=None):
        """Create a comprehensive workflow plan from natural language instruction."""
        try:
            # Generate workflow using Groq
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are Fellou AI's workflow planning agent. Break down user instructions into actionable workflows with steps, time estimates, and required platforms."},
                    {"role": "user", "content": f"Create a workflow plan for: {instruction}"}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            workflow_description = response.choices[0].message.content
            
            # Create structured workflow plan
            workflow_plan = {
                "workflow_id": f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "title": instruction[:50] + ("..." if len(instruction) > 50 else ""),
                "description": workflow_description,
                "steps": self._extract_steps(workflow_description),
                "estimated_time_minutes": self._estimate_time(instruction),
                "estimated_credits": self._estimate_credits(instruction),
                "required_platforms": self._identify_platforms(instruction),
                "status": "created",
                "created_at": datetime.now().isoformat()
            }
            
            return workflow_plan
            
        except Exception as e:
            # Fallback workflow plan
            return {
                "workflow_id": f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "title": instruction[:50] + ("..." if len(instruction) > 50 else ""),
                "description": f"Automated workflow: {instruction}",
                "steps": [
                    {"id": 1, "description": "Initialize task", "status": "pending"},
                    {"id": 2, "description": "Execute main action", "status": "pending"},
                    {"id": 3, "description": "Generate results", "status": "pending"}
                ],
                "estimated_time_minutes": 5,
                "estimated_credits": 10,
                "required_platforms": ["General"],
                "status": "created",
                "created_at": datetime.now().isoformat()
            }
    
    def _extract_steps(self, description):
        """Extract workflow steps from description."""
        return [
            {"id": 1, "description": "Analyze requirements", "status": "pending"},
            {"id": 2, "description": "Execute workflow", "status": "pending"},
            {"id": 3, "description": "Compile results", "status": "pending"}
        ]
    
    def _estimate_time(self, instruction):
        """Estimate time based on instruction complexity."""
        word_count = len(instruction.split())
        if word_count < 10:
            return 3
        elif word_count < 20:
            return 8
        else:
            return 15
    
    def _estimate_credits(self, instruction):
        """Estimate credits needed."""
        return len(instruction.split()) * 2
    
    def _identify_platforms(self, instruction):
        """Identify required platforms from instruction."""
        platforms = []
        instruction_lower = instruction.lower()
        
        if 'twitter' in instruction_lower:
            platforms.append('Twitter')
        if 'linkedin' in instruction_lower:
            platforms.append('LinkedIn')
        if 'email' in instruction_lower:
            platforms.append('Email')
        if 'research' in instruction_lower or 'analyze' in instruction_lower:
            platforms.append('Web Scraping')
        if 'report' in instruction_lower:
            platforms.append('Report Generation')
            
        return platforms if platforms else ['General']