"""
Main entry point for the FlowForge FastAPI backend.
This module initializes the API and defines the initial orchestration routes.
"""
import os
import httpx
from tqdm import tqdm
from fastapi import FastAPI
from .api.endpoints import router as api_router
from .schemas.request_schema import WorkflowRequest


app = FastAPI(title="FlowForge API")
app.include_router(api_router, prefix="/api")


# Define internal paths relative to the project root directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

MODEL_NAME = "deepseek-llm-7b-chat.Q4_K_M.gguf"
MODEL_PATH = os.path.join(PROJECT_ROOT, "llm_models", MODEL_NAME)

COMFYUI_PATH = os.path.join(PROJECT_ROOT, "ComfyUI_windows_portable", "ComfyUI", "models")
CHECKPOINT_PATH = os.path.join(COMFYUI_PATH, "checkpoints", "CyberRealisticPony_V18.0_F16.safetensors")
LORA_PATH = os.path.join(COMFYUI_PATH, "loras", "zy_Realism_Enhancer_v2.safetensors")


def download_missing_file(destination_path: str, url: str):
    """
    Downloads a file from a URL in 1MB chunks with a visual progress bar if it does not exist.

    Args:
        destination_path (str): The local path where the file will be saved.
        url (str): The direct URL to download the file from.
    Raises:
        httpx.HTTPError: If the download fails.
    """

    if os.path.exists(destination_path):
        return

    filename = os.path.basename(destination_path)
    print(f"[FlowForge] File missing: {filename}")
    
    # Ensure the target parent directories exist before writing the file stream.
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    
    # timeout=None guarantees the connection won't drop during huge file transfers.
    with httpx.Client(follow_redirects=True, timeout=None) as client:
        with client.stream("GET", url) as response:
            # Replicates requests.raise_for_status() behavior.
            response.raise_for_status()
            
            total_size = int(response.headers.get("content-length", 0))
            
            with open(destination_path, "wb") as f:
                with tqdm(desc=filename, total=total_size, unit="iB", unit_scale=True, unit_divisor=1024) as bar:
                    # Restored the original efficient 1MB chunk allocation size.
                    for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                        if chunk:
                            size = f.write(chunk)
                            bar.update(size)
                            
    print(f"[FlowForge] Successfully downloaded and verified: {filename}")

    return

@app.on_event("startup")
async def startup_event():
    """
    Triggered automatically when Uvicorn starts the application. Validates and downloads heavy dependencies before 
    opening the API ports.
    """

    print("\n[FlowForge] Verifying local model integrity...")
    
    # Atomic download sequence for both LLM and Stable Diffusion components.
    download_missing_file(
        MODEL_PATH, 
        f"https://huggingface.co/mradermacher/deepseek-llm-7b-chat-GGUF/resolve/main/{MODEL_NAME}"
    )

    download_missing_file(
        CHECKPOINT_PATH, 
        "https://huggingface.co/cyberdelia/CyberRealisticPony/resolve/main/CyberRealisticPony_V18.0_F16.safetensors"
    )

    download_missing_file(
        LORA_PATH, 
        "https://huggingface.co/casque/zy_Realism_Enhancer_v2/resolve/main/zy_Realism_Enhancer_v2.safetensors"
    )

    print("[FlowForge] All core model files verified. Initialization successful.\n")

    return

@app.get("/")
def health_check():
    """
    Basic endpoint to verify if the server is running correctly.
    """

    return {"status": "FlowForge API is operational"}

@app.post("/test_generation")
async def test_generation(request: WorkflowRequest):
    """
    Receives the prompt and prepares it for the orchestration layer. For now, it confirms receipt of the data before we 
    link the services.
    """

    return {"message": "Prompt received successfully", "data": {"prompt": request.prompt}}