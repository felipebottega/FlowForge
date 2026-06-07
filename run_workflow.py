import os
import sys
import json
import time
import requests
from tqdm import tqdm
from urllib import request
from gpt4all import GPT4All


SERVER_URL = "http://127.0.0.1:8188"
MODEL_NAME = "deepseek-llm-7b-chat.Q4_K_M.gguf"
MODEL_PATH = "llm_models"
WORKFLOW_FILEPATH = "workflows_api/txt2img.json"
COMFYUI_PATH = "ComfyUI_windows_portable/ComfyUI/models"
INTERPRETER_DIRECTIVES = """
1. Context: Expert Prompt Engineering for Stable Diffusion (SDXL).
2. Task: Transform natural language into an enriched sequence of **atomic technical tags**.
3. Scene Enrichment: Enhance requests with vivid adjectives, technical lighting (e.g., "rim lighting", "global illumination"), and rendering specs (e.g., "octane render", "8k resolution").
4. Weighting Order: Primary Subject MUST be the first tag. Structure: [Subject], [Subject Details], [Background], [Environment/Lighting], [Camera/Technical Style].
5. Forbidden: NO sentences. NO verbs. NO prepositions. NO articles. NO conjunctions (and, with, or, but). Use ONLY nouns and adjectives.
6. Technical Fidelity: If the request implies realism, include camera specs (e.g., "depth of field", "sharp focus", "f/1.8").
7. Format: Return ONLY a JSON object: {"positive_prompt": "tags, separated, by, commas"}.
8. Syntax: NEVER use backslashes (\\) or internal quotes ("). Use ONLY commas as separators.
9. Examples:
   Input: "A cat in space"
   Output: {"positive_prompt": "majestic fluffy cat, zero gravity, space void, colorful nebulas, distant stars, ethereal rim lighting, cinematic composition, hyper-detailed, masterpiece"}
   Input: "Cyber-wizard in a neon city"
   Output: {"positive_prompt": "tiny cyber-wizard, intricate technological robes, electric blue spells, futuristic neon alley, rain-slicked pavement, lightning reflections, cyberpunk atmosphere, depth of field, high contrast, ray tracing"}
10. Constraint: No preamble, no explanations. Output ONLY the JSON.
"""


def download_missing(path_to_file, url):
    folder = os.path.split(path_to_file)[0]
    filename = os.path.split(path_to_file)[-1]

    if not os.path.exists(path_to_file):
        print(f"Downloading file: {filename}...")
        
        try:
            with requests.get(url, stream=True) as r:
                r.raise_for_status()
                total_size = int(r.headers.get('content-length', 0))
                
                with open(path_to_file, "wb") as f:
                    with tqdm(desc=filename, total=total_size, unit='iB', unit_scale=True, unit_divisor=1024) as bar:
                        for chunk in r.iter_content(chunk_size=1024*1024): # 1MB chunks
                            if chunk:
                                size = f.write(chunk)
                                bar.update(size)
            print("Download complete.")
        except Exception as e:
            if os.path.exists(path_to_file):
                os.remove(path_to_file)
            print(f"\n[ERROR] Automated download failed: {e}")
            print(f"Please download the model manually from: {url}")
            print(f"And place the file inside the '{folder}' folder before restarting.")
            sys.exit(1)
            
            
# Download missing files.
download_missing(os.path.join(MODEL_PATH, MODEL_NAME), f"https://huggingface.co/mradermacher/deepseek-llm-7b-chat-GGUF/resolve/main/{MODEL_NAME}")
download_missing(os.path.join(COMFYUI_PATH, "checkpoints", "CyberRealisticPony_V18.0_F16.safetensors"), "https://huggingface.co/cyberdelia/CyberRealisticPony/resolve/main/CyberRealisticPony_V18.0_F16.safetensors")
download_missing(os.path.join(COMFYUI_PATH, "loras", "zy_Realism_Enhancer_v2.safetensors"), "https://huggingface.co/casque/zy_Realism_Enhancer_v2/resolve/main/zy_Realism_Enhancer_v2.safetensors")

# Initializing the model
model = GPT4All(model_name=MODEL_NAME, model_path=MODEL_PATH, device="cuda", verbose=True, allow_download=False)

while True:
    # Realistic user input.
    print("\n--- FlowForge: Waiting for new image description (or type 'exit')---")
    user_text = input("User input: ")
    
    if user_text.lower() in ["sair", "exit", "quit"]:
        print("Finishing FlowForge...")
        break

    # Generating output.
    data = None
    
    for attempt in range(3):
        with model.chat_session(system_prompt=INTERPRETER_DIRECTIVES):
            response = model.generate(user_text, max_tokens=150)
            
            try:
                data = json.loads(response)
                data["positive_prompt"] = "score_9, score_8_up, score_7_up, " + data["positive_prompt"]
                print(f"Validated JSON: {data}")
                break
            except json.JSONDecodeError:
                print("Error: The model failed the structural contract. Retrying or fallback logic needed.")

    # Return to input again.
    if not data:
        continue    

    # Loads the workflow directly from the JSON file.
    with open(WORKFLOW_FILEPATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)
        
    # Update positive prompt.
    workflow["2"]["inputs"]["text"] = "score_9, score_8_up, score_7_up, " + data["positive_prompt"]
        
    # Dynamically checks if the workflow contains an input node for logging purposes.
    input_log = "Direct execution"

    for x in workflow:
        if workflow[x].get('class_type') == 'LoadImage':
            input_log = workflow[x]['inputs'].get('image', 'Image Node')

    p = {"prompt": workflow}
    payload = json.dumps(p).encode('utf-8')

    # Send workflow directly to execution.
    req = request.Request(f"{SERVER_URL}/prompt", data=payload)
    resp = request.urlopen(req)
    prompt_id = json.load(resp)["prompt_id"]
    print(f'Executing {prompt_id} - {input_log}')

    # Wait to finish.
    for attempt in range(30):
        status = requests.get(f"{SERVER_URL}/history/{prompt_id}").json()
        
        if prompt_id in status and "outputs" in status[prompt_id]:
            break
            
        time.sleep(10)    # Avoid hammering the ComfyUI API with continuous polling and exhausting local sockets.

    print('Finished')
