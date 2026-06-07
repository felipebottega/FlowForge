"""
Main entry point for the FlowForge FastAPI backend.
This module initializes the API and defines the initial orchestration routes.
"""
from fastapi import FastAPI
from .schemas.request_schema import WorkflowRequest


app = FastAPI(title="FlowForge API")


@app.get("/")
def health_check():
    """
    Basic endpoint to verify if the server is running correctly.
    """

    return {"status": "FlowForge API is operational"}

@app.post("/generate")
async def start_generation(request: WorkflowRequest):
    """
    Receives the prompt and prepares it for the orchestration layer. For now, it confirms receipt of the data before we 
    link the services.
    """

    return {"message": "Prompt received successfully", "data": {"prompt": request.prompt}}