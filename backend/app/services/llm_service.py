"""
Service for LLM interactions using GPT4All.
"""
import os
import json
from gpt4all import GPT4All


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
MODEL_PATH = os.path.join(PROJECT_ROOT, "llm_models")
MODEL_NAME = "deepseek-llm-7b-chat.Q4_K_M.gguf"
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

# Create the global variable.
model = None

def get_llm_model():
    """
    Makes sure the model is only loaded into memory after the startup download.
    """

    global model

    if model is None:
        model = GPT4All(model_name=MODEL_NAME, model_path=MODEL_PATH, device="cuda", verbose=True, allow_download=False)
    
    return model

async def generate_refined_prompt(user_input: str) -> str:
    """
    Processes user input through the LLM to generate structured tags. Returns only the content of the 'positive_prompt' 
    key.
    """

    # Pull the model instance on demand to ensure it's loaded after the startup event.
    llm = get_llm_model()

    with llm.chat_session(system_prompt=INTERPRETER_DIRECTIVES):
        response = llm.generate(user_input, max_tokens=200)
        
    try:
        data = json.loads(response)
        return data.get("positive_prompt", "")
    except json.JSONDecodeError:
        return response