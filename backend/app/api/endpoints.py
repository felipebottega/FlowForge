import os
import httpx
from fastapi import APIRouter, HTTPException
from backend.app.schemas.request_schema import WorkflowRequest
from backend.app.services.llm_service import generate_refined_prompt
from backend.app.services.comfy_service import clear_output_directory, submit_workflow, COMFY_URL


router = APIRouter()



# Define internal paths relative to the project root directory.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
COMFY_OUTPUT_PATH = os.path.join(PROJECT_ROOT, "ComfyUI_windows_portable", "ComfyUI", "output")


@router.post("/generate")
async def start_generation(request: WorkflowRequest):
    """
    Receives the initial prompt, uses LLM to generate the technical tags, and submits the flow for execution in ComfyUI.
    """

    # Clear the outputs folder before anything else.
    clear_output_directory()

    # Refine prompt via LLM.
    refined_prompt = await generate_refined_prompt(request.prompt)
    
    if not refined_prompt:
         raise HTTPException(status_code=500, detail="Failed to structure the prompt in the LLM.")

    # Submit to ComfyUI.
    response = await submit_workflow(refined_prompt)
    
    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])
        
    prompt_id = response.get("prompt_id")
    
    return {
        "message": "Workflow submitted to the queue successfully",
        "prompt_id": prompt_id,
        "refined_prompt": refined_prompt
    }

@router.get("/status/{prompt_id}")
async def check_status(prompt_id: str):
    """
    Verifies in ComfyUI if the image generation has been completed, extracting the filename to build the final URL.
    """
    
    async with httpx.AsyncClient() as client:
        try:
            # Consult the history of ComfyUI.
            response = await client.get(f"{COMFY_URL}/history/{prompt_id}")
            response.raise_for_status()
            history = response.json()
            
            if len(os.listdir(COMFY_OUTPUT_PATH)) > 1 and prompt_id in history and "outputs" in history[prompt_id]:
                outputs = history[prompt_id]["outputs"]
                image_filename = None
                
                for node_id, node_output in outputs.items():
                    if "images" in node_output and len(node_output["images"]) > 0:
                        image_filename = node_output["images"][0]["filename"]
                        break
                
                if image_filename:
                    return {
                        "status": "finished", 
                        "image_url": f"http://127.0.0.1:8000/outputs/{image_filename}"
                    }
                else:
                    return {"status": "error", "error_details": "Image metadata missing in ComfyUI output."}
            else:
                return {"status": "processing"}
                
        except httpx.RequestError as e:
             raise HTTPException(status_code=500, detail=f"Failed communication with ComfyUI: {str(e)}")