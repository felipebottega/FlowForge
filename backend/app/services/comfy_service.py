"""
Orchestration service for ComfyUI API interactions.
Handles workflow loading, prompt injection, and job submission.
"""
import os
import json
import httpx


# Server configuration from repository constants
COMFY_URL = "http://127.0.0.1:8188"
WORKFLOW_PATH = "workflows_api/txt2img.json"


async def submit_workflow(prompt_text: str):
    """
    Loads the text-to-image workflow and submits it to the execution queue.
    """
    
    if not os.path.exists(WORKFLOW_PATH):
        return {"error": "Workflow configuration file missing"}

    with open(WORKFLOW_PATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    # Injecting the prompt into the specified conditioning node. Maintaining the required aesthetic score prefixing.
    formatted_prompt = f"score_9, score_8_up, score_7_up, {prompt_text}"
    workflow["2"]["inputs"]["text"] = formatted_prompt

    payload = {"prompt": workflow}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{COMFY_URL}/prompt", json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            return {"error": f"Connection failed: {str(e)}"}