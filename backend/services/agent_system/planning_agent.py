"""
Planning Agent - Enhanced Agentic Workflow Creation
Mimics Fellou's Deep Action technology with advanced planning capabilities
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from groq import Groq
import os

class PlanningAgent:
    """
    Advanced planning agent that converts natural language to executable workflows.
    Matches Fellou's Deep Action sophistication.
    """
    
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.workflow_templates = self._load_workflow_templates()
        self.platform_capabilities = self._load_platform_capabilities()
        
    def _load_workflow_templates(self) -> Dict[str, Any]:
        """Load pre-defined workflow templates matching Fellou's library"""
        return {
            "research_report": {
                "title": "Research & Report Generation",
                "description": "Multi-source research with AI analysis and report creation",
                "estimated_time_minutes": 10,
                "estimated_credits": 15,
                "steps": [
                    {"type": "search", "description": "Search across multiple platforms"},
                    {"type": "analyze", "description": "AI-powered content analysis"},
                    {"type": "synthesize", "description": "Data synthesis and insights"},
                    {"type": "report", "description": "Generate comprehensive report"}
                ],
                "required_platforms": ["google", "linkedin", "twitter", "reddit"]
            },
            "social_monitoring": {
                "title": "Social Media Monitoring",
                "description": "Cross-platform social media monitoring and engagement",
                "estimated_time_minutes": 15,
                "estimated_credits": 20,
                "steps": [
                    {"type": "monitor", "description": "Monitor social mentions"},
                    {"type": "sentiment", "description": "Sentiment analysis"},
                    {"type": "engage", "description": "Automated engagement"},
                    {"type": "report", "description": "Activity summary report"}
                ],
                "required_platforms": ["twitter", "linkedin", "facebook", "instagram"]
            },
            "recruitment_outreach": {
                "title": "LinkedIn Recruitment Campaign",
                "description": "Automated talent sourcing and outreach",
                "estimated_time_minutes": 20,
                "estimated_credits": 25,
                "steps": [
                    {"type": "search", "description": "Search for qualified candidates"},
                    {"type": "analyze", "description": "Profile analysis and scoring"},
                    {"type": "personalize", "description": "Personalized message creation"},
                    {"type": "outreach", "description": "Send connection requests"}
                ],
                "required_platforms": ["linkedin", "email", "crm"]
            }
        }
        
    def _load_platform_capabilities(self) -> Dict[str, Any]:
        """Platform-specific capabilities for intelligent planning"""
        return {
            "twitter": {
                "actions": ["search", "post", "follow", "like", "retweet", "dm"],
                "data_types": ["tweets", "users", "trends", "analytics"],
                "rate_limits": {"search": 450, "post": 300, "follow": 400},
                "best_for": ["social_monitoring", "engagement", "trending_analysis"]
            },
            "linkedin": {
                "actions": ["search_profiles", "send_message", "connect", "post", "company_search"],
                "data_types": ["profiles", "companies", "jobs", "posts"],
                "rate_limits": {"search": 100, "connections": 100, "messages": 25},
                "best_for": ["recruitment", "lead_generation", "professional_networking"]
            },
            "google": {
                "actions": ["search", "scholar_search", "trends", "maps"],
                "data_types": ["web_results", "academic_papers", "trend_data", "location_data"],
                "rate_limits": {"search": 10000, "trends": 1000},
                "best_for": ["research", "market_analysis", "fact_checking"]
            }
        }

    async def create_workflow_plan(self, instruction: str, context: Dict = None) -> Dict[str, Any]:
        """
        Create sophisticated workflow plan from natural language instruction.
        Enhanced to match Fellou's Deep Action capabilities.
        """
        
        try:
            # Generate workflow ID
            workflow_id = str(uuid.uuid4())
            
            # Analyze instruction using AI
            workflow_analysis = await self._analyze_instruction(instruction)
            
            # Select optimal template or create custom
            template = self._select_optimal_template(workflow_analysis)
            
            # Generate detailed workflow
            detailed_workflow = await self._generate_detailed_workflow(
                instruction, workflow_analysis, template
            )
            
            # Optimize for platforms and resources
            optimized_workflow = self._optimize_workflow(detailed_workflow)
            
            # Add execution strategy
            execution_strategy = self._determine_execution_strategy(optimized_workflow)
            
            return {
                "workflow_id": workflow_id,
                "title": optimized_workflow.get("title"),
                "description": optimized_workflow.get("description"),
                "instruction": instruction,
                "steps": optimized_workflow.get("steps", []),
                "estimated_time_minutes": optimized_workflow.get("estimated_time_minutes", 5),
                "estimated_credits": optimized_workflow.get("estimated_credits", 10),
                "required_platforms": optimized_workflow.get("required_platforms", []),
                "execution_strategy": execution_strategy,
                "complexity_score": workflow_analysis.get("complexity", 0.5),
                "success_probability": workflow_analysis.get("success_probability", 0.8),
                "created_at": datetime.now().isoformat(),
                "context": context or {},
                "shadow_workspace_enabled": True,
                "parallel_execution": execution_strategy.get("parallel", False)
            }
            
        except Exception as e:
            # Fallback workflow creation
            return await self._create_fallback_workflow(instruction, str(e))

    async def _analyze_instruction(self, instruction: str) -> Dict[str, Any]:
        """Use AI to deeply analyze the instruction"""
        
        analysis_prompt = f"""
        Analyze this workflow instruction and extract key information:
        
        Instruction: "{instruction}"
        
        Provide analysis in JSON format:
        {{
            "intent": "primary goal",
            "complexity": 0.1-1.0,
            "required_data": ["data types needed"],
            "target_platforms": ["platforms to use"],
            "time_estimate": "minutes",
            "automation_level": "manual|semi|full",
            "success_probability": 0.1-1.0,
            "key_challenges": ["potential issues"],
            "workflow_type": "research|social|automation|analysis|communication"
        }}
        """
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are Fellou's workflow analysis expert. Analyze instructions and provide structured analysis in valid JSON."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            response_text = completion.choices[0].message.content
            
            # Extract JSON from response
            try:
                # Try to find JSON in the response
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    return json.loads(response_text)
            except:
                # Fallback analysis
                return {
                    "intent": "general automation task",
                    "complexity": 0.5,
                    "required_data": ["web_data"],
                    "target_platforms": ["google", "twitter"],
                    "time_estimate": "5-10",
                    "automation_level": "semi",
                    "success_probability": 0.7,
                    "key_challenges": ["data extraction", "rate limits"],
                    "workflow_type": "automation"
                }
                
        except Exception as e:
            # Return basic analysis on error
            return {
                "intent": instruction[:50] + "..." if len(instruction) > 50 else instruction,
                "complexity": 0.5,
                "required_data": ["general"],
                "target_platforms": ["google"],
                "time_estimate": "5",
                "automation_level": "semi",
                "success_probability": 0.6,
                "key_challenges": ["execution"],
                "workflow_type": "general"
            }

    def _select_optimal_template(self, analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Select the best matching template based on analysis"""
        
        workflow_type = analysis.get("workflow_type", "general")
        complexity = analysis.get("complexity", 0.5)
        platforms = analysis.get("target_platforms", [])
        
        # Match templates based on type and requirements
        template_scores = {}
        
        for template_name, template in self.workflow_templates.items():
            score = 0
            
            # Type matching
            if workflow_type in template_name or workflow_type in template.get("description", "").lower():
                score += 0.4
            
            # Platform overlap
            template_platforms = template.get("required_platforms", [])
            platform_overlap = len(set(platforms) & set(template_platforms)) / max(len(platforms), 1)
            score += platform_overlap * 0.3
            
            # Complexity matching
            template_complexity = len(template.get("steps", [])) / 10  # Normalize
            complexity_match = 1 - abs(complexity - template_complexity)
            score += complexity_match * 0.3
            
            template_scores[template_name] = score
        
        # Return best matching template or None
        if template_scores:
            best_template = max(template_scores, key=template_scores.get)
            if template_scores[best_template] > 0.6:  # Threshold for good match
                return self.workflow_templates[best_template]
        
        return None

    async def _generate_detailed_workflow(self, instruction: str, analysis: Dict[str, Any], template: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate detailed workflow steps using AI"""
        
        generation_prompt = f"""
        Create a detailed workflow for this instruction:
        "{instruction}"
        
        Analysis: {json.dumps(analysis, indent=2)}
        Template: {json.dumps(template, indent=2) if template else "None"}
        
        Generate a comprehensive workflow in JSON format:
        {{
            "title": "Clear workflow title",
            "description": "Brief description",
            "steps": [
                {{
                    "id": "step_1",
                    "type": "search|analyze|extract|post|send|monitor",
                    "description": "What this step does",
                    "platform": "platform name",
                    "parameters": {{"key": "value"}},
                    "estimated_duration_seconds": 30,
                    "depends_on": ["previous_step_ids"],
                    "success_criteria": "How to verify success"
                }}
            ],
            "estimated_time_minutes": 10,
            "estimated_credits": 15,
            "required_platforms": ["platform1", "platform2"],
            "success_metrics": ["metric1", "metric2"]
        }}
        """
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are Fellou's workflow architect. Create detailed, executable workflows in valid JSON."},
                    {"role": "user", "content": generation_prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            
            response_text = completion.choices[0].message.content
            
            # Extract and parse JSON
            try:
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    workflow = json.loads(json_match.group())
                else:
                    workflow = json.loads(response_text)
                
                # Validate and enhance workflow
                return self._validate_and_enhance_workflow(workflow, instruction, analysis)
                
            except Exception as parse_error:
                # Fallback to template-based generation
                return self._create_template_based_workflow(instruction, analysis, template)
                
        except Exception as e:
            return self._create_template_based_workflow(instruction, analysis, template)

    def _validate_and_enhance_workflow(self, workflow: Dict[str, Any], instruction: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance generated workflow"""
        
        # Ensure required fields
        workflow.setdefault("title", instruction[:50] + "..." if len(instruction) > 50 else instruction)
        workflow.setdefault("description", "AI-generated workflow")
        workflow.setdefault("steps", [])
        workflow.setdefault("estimated_time_minutes", 5)
        workflow.setdefault("estimated_credits", 10)
        workflow.setdefault("required_platforms", ["web"])
        
        # Enhance steps
        enhanced_steps = []
        for i, step in enumerate(workflow.get("steps", [])):
            enhanced_step = {
                "id": step.get("id", f"step_{i+1}"),
                "type": step.get("type", "action"),
                "description": step.get("description", f"Execute step {i+1}"),
                "platform": step.get("platform", "web"),
                "parameters": step.get("parameters", {}),
                "estimated_duration_seconds": step.get("estimated_duration_seconds", 30),
                "depends_on": step.get("depends_on", []),
                "success_criteria": step.get("success_criteria", "Task completed successfully")
            }
            enhanced_steps.append(enhanced_step)
        
        workflow["steps"] = enhanced_steps
        
        return workflow

    def _create_template_based_workflow(self, instruction: str, analysis: Dict[str, Any], template: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Create workflow based on template as fallback"""
        
        if template:
            return {
                **template,
                "title": f"{template['title']} - {instruction[:30]}...",
                "description": f"Custom workflow based on {template['description']}",
                "instruction": instruction
            }
        else:
            # Create basic workflow
            return {
                "title": instruction[:50] + "..." if len(instruction) > 50 else instruction,
                "description": "Custom workflow for your request",
                "steps": [
                    {
                        "id": "step_1",
                        "type": "research",
                        "description": "Research and gather information",
                        "platform": "google",
                        "parameters": {"query": instruction},
                        "estimated_duration_seconds": 60,
                        "depends_on": [],
                        "success_criteria": "Information gathered"
                    },
                    {
                        "id": "step_2", 
                        "type": "analyze",
                        "description": "Analyze gathered information",
                        "platform": "ai",
                        "parameters": {},
                        "estimated_duration_seconds": 30,
                        "depends_on": ["step_1"],
                        "success_criteria": "Analysis completed"
                    }
                ],
                "estimated_time_minutes": 3,
                "estimated_credits": 5,
                "required_platforms": ["google", "ai"]
            }

    def _optimize_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize workflow for performance and resource usage"""
        
        # Analyze step dependencies for parallel execution
        steps = workflow.get("steps", [])
        optimized_steps = []
        
        for step in steps:
            # Add execution optimizations
            platform = step.get("platform", "web")
            step_type = step.get("type", "action")
            
            # Platform-specific optimizations
            if platform in self.platform_capabilities:
                capabilities = self.platform_capabilities[platform]
                
                # Adjust rate limits
                if step_type in ["search", "post", "send"]:
                    step["rate_limit_delay"] = 1 if platform == "linkedin" else 0.5
                
                # Add retry logic
                step["max_retries"] = 3
                step["retry_delay"] = 2
            
            # Add monitoring
            step["monitoring"] = {
                "track_progress": True,
                "log_results": True,
                "alert_on_failure": True
            }
            
            optimized_steps.append(step)
        
        workflow["steps"] = optimized_steps
        
        return workflow

    def _determine_execution_strategy(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Determine optimal execution strategy"""
        
        steps = workflow.get("steps", [])
        platforms = workflow.get("required_platforms", [])
        
        # Analyze parallelization opportunities
        parallel_groups = []
        sequential_steps = []
        
        for step in steps:
            depends_on = step.get("depends_on", [])
            if not depends_on:  # No dependencies - can run in parallel
                if not parallel_groups:
                    parallel_groups.append([])
                parallel_groups[0].append(step["id"])
            else:
                sequential_steps.append(step["id"])
        
        strategy = {
            "execution_mode": "hybrid" if parallel_groups and sequential_steps else "sequential",
            "parallel": len(parallel_groups) > 0,
            "parallel_groups": parallel_groups,
            "sequential_order": sequential_steps,
            "shadow_workspace": len(steps) > 3 or len(platforms) > 2,
            "resource_allocation": {
                "cpu_intensive": any(s.get("type") == "analyze" for s in steps),
                "network_intensive": len(platforms) > 2,
                "memory_intensive": any(s.get("type") in ["extract", "process"] for s in steps)
            },
            "estimated_total_time": sum(s.get("estimated_duration_seconds", 30) for s in steps),
            "checkpoints": [s["id"] for s in steps[::2]]  # Checkpoint every 2 steps
        }
        
        return strategy

    async def _create_fallback_workflow(self, instruction: str, error: str) -> Dict[str, Any]:
        """Create simple fallback workflow when AI generation fails"""
        
        return {
            "workflow_id": str(uuid.uuid4()),
            "title": "Simple Task Execution",
            "description": f"Basic workflow for: {instruction[:50]}...",
            "instruction": instruction,
            "steps": [
                {
                    "id": "fallback_step",
                    "type": "manual",
                    "description": "Execute task manually with AI assistance",
                    "platform": "assistant",
                    "parameters": {"instruction": instruction},
                    "estimated_duration_seconds": 120,
                    "depends_on": [],
                    "success_criteria": "Task completed"
                }
            ],
            "estimated_time_minutes": 2,
            "estimated_credits": 3,
            "required_platforms": ["assistant"],
            "execution_strategy": {
                "execution_mode": "sequential",
                "parallel": False,
                "shadow_workspace": False
            },
            "created_at": datetime.now().isoformat(),
            "fallback": True,
            "error": error
        }