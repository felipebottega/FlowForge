import httpx
from fastapi import APIRouter, HTTPException
from app.schemas.request_schema import WorkflowRequest
from app.services.llm_service import generate_refined_prompt
from app.services.comfy_service import submit_workflow, COMFY_URL


router = APIRouter()


@router.post("/generate")
async def start_generation(request: WorkflowRequest):
    """
    Receives the initial prompt, uses LLM to generate the technical tags, and submits the flow for execution in ComfyUI.
    """

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
    Verifies in ComfyUI if the image generation has been completed, replacing the need for a sleep() in the backend.
    """

    async with httpx.AsyncClient() as client:
        try:
            # Consult the history of ComfyUI.
            response = await client.get(f"{COMFY_URL}/history/{prompt_id}")
            response.raise_for_status()
            history = response.json()
            
            if prompt_id in history and "outputs" in history[prompt_id]:
                return {"status": "completed", "outputs": history[prompt_id]["outputs"]}
            else:
                return {"status": "processing_or_queued"}
                
        except httpx.RequestError as e:
             raise HTTPException(status_code=500, detail=f"Failed communication with ComfyUI: {str(e)}")