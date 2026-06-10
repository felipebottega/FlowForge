"""
Orchestration service for ComfyUI API interactions.
Handles workflow loading, prompt injection, and job submission.
"""
import os
import json
import httpx
import random


# Server configuration from repository constants
COMFY_URL = "http://127.0.0.1:8188"

# Resolve path dynamically using the project root directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
WORKFLOW_PATH = os.path.join(PROJECT_ROOT, "workflows_api", "txt2img.json")
COMFY_OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ComfyUI_windows_portable", "ComfyUI", "output")


async def submit_workflow(prompt_text: str, cfg: float, steps: int):
    """
    Loads the text-to-image workflow and submits it to the execution queue.
    """

    if not os.path.exists(WORKFLOW_PATH):
        return {"error": "Workflow configuration file missing"}

    with open(WORKFLOW_PATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    # Injecting the prompt into the specified conditioning node. Maintaining the required aesthetic score prefixing.
    workflow["2"]["inputs"]["text"] = prompt_text

    # Injects dynamic CFG into KSampler node.
    workflow["6"]["inputs"]["cfg"] = cfg

    # Injects dynamic sampling steps into KSampler node.
    workflow["6"]["inputs"]["steps"] = steps

    # Generates a random seed compatible with the ComfyUI numeric format.
    random_seed = random.randint(1, 1234567890)
    workflow["6"]["inputs"]["seed"] = random_seed

    payload = {"prompt": workflow}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{COMFY_URL}/prompt", json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            return {"error": f"Connection failed: {str(e)}"}
        
def clear_output_directory():
    """
    Remove all files from the outputs folder before a new generation.
    """

    if os.path.exists(COMFY_OUTPUT_PATH):

        for filename in os.listdir(COMFY_OUTPUT_PATH):
            file_path = os.path.join(COMFY_OUTPUT_PATH, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    if "_output_images_will_be_put_here" not in file_path:
                        os.remove(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

    return