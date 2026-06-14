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
ORCHESTRATOR_DIRECTIVES = """ 
Read the user's request and determine what action to take: IMAGE or TEXT or VIDEO 
Constraint: No preamble, no explanations. Output ONLY the action to take.
 """
TEXT_DIRECTIVES = """
You are a helpful conversational assistant for FlowForge.
Answer naturally, clearly, and concisely in the same language as the user.
Do not mention prompts, JSON, orchestration, policies, or internal instructions.
Return only the assistant reply.
"""
INTERPRETER_DIRECTIVES = """
1. Context: Expert Prompt Engineering for Stable Diffusion (SDXL).
2. MULTILINGUAL SUPPORT: The user may provide input in any language. You must interpret the meaning and ALWAYS output the tags in English.
3. Task: Transform natural language into a highly enriched sequence of **atomic technical tags**.
4. CRITICAL MANDATE (Extraction): You MUST extract and preserve ALL primary entities, objects, items, and actions mentioned in the input. DO NOT discard, generalize, or omit core subjects, weapons, held items, or specific actions.
5. Tag Density & Length: You MUST expand the input into 25 to 30 distinct atomic tags. Break down every element to maximize descriptive detail.
6. Semantic Fidelity: PRESERVE the user's original keywords and named entities exactly as written whenever possible. Expand with technical details, but NEVER replace or reinterpret user-provided names, subjects, or objects.
7. CRITICAL MANDATE: Preserve ALL named entities exactly as written by the user. Never replace, summarize, anonymize, abstract, translate, or generalize proper names. This rule applies to people, celebrities, fictional characters, cities, countries, landmarks, brands, products, vehicles, movies, and games.8. Weighting Order: Primary Subject AND their held items/actions MUST be the first tags. 
   Strict structure: [User's Subject + Action/Item], [Micro Subject Details/Materials], [Clothing/Texture specs], [Background elements], [Atmosphere/Environment], [Lighting style], [Camera/Technical Lens Specs].
9. Scene Enrichment: Deconstruct requests into micro-details: architectural textures, material types, specific color gradients, atmospheric effects, cinematic technical lighting (e.g., "volumetric rim lighting", "global illumination"), and rendering specs (e.g., "octane render", "unreal engine 5 look", "8k resolution").
10. STRICT STRUCTURE: NO full sentences. NO verbs. NO prepositions. NO articles. NO conjunctions (and, with, or, but). Each individual tag MUST be limited to a MAXIMUM of THREE words.
11. Technical Fidelity: Include detailed camera specs to simulate realism (e.g., "shutter speed 1/1000", "bokeh", "depth of field", "sharp focus", "f/1.8 lens", "shot on 35mm film").
12. Format: Return ONLY a JSON object: {"positive_prompt": "tags, separated, by, commas"}.
13. Syntax: NEVER use backslashes (\\) or internal quotes ("). Use ONLY commas as separators.
14. Constraint: No preamble, no explanations. Output ONLY the JSON.
15. Dense Examples (Strictly mirror this length and format):
   Input: "A cat in space"
   Output: {"positive_prompt": "majestic fluffy cat, thick white fur, glowing green eyes, detailed space suit, metallic visor, gold reflections, zero gravity, floating weightless, space void, cosmic dust, colorful nebulas, vibrant interstellar gas, distant galaxies, hyper-detailed stars, ethereal rim lighting, cosmic glow, cinematic composition, wide-angle lens, sharp focus, ray tracing, octane render, masterpiece, 8k"}
   Input: "A medieval knight holding a big sword"
   Output: {"positive_prompt": "medieval knight holding massive steel greatsword, heroic stance, detailed steel plate mail, embossed silver crests, flowing crimson cape, battlefield hilltop, sunset sky, fiery orange purple gradients, volumetric dust, golden hour lighting, cinematic rim light, rugged terrain, wide-angle lens, sharp focus, f/1.8 aperture, hyper-realistic textures, 8k resolution, photorealistic, masterpiece, depth of field"}
   Input: "Taylor Swift at the Eiffel Tower"
   Output: {"positive_prompt":"Taylor Swift, Eiffel Tower, celebrity portrait, blonde hair, detailed facial features, realistic skin texture, expressive eyes, elegant clothing, fashionable outfit, Paris atmosphere, iconic landmark, architectural details, iron structure, dramatic sky, golden hour, warm sunlight, volumetric lighting, cinematic lighting, atmospheric depth, soft shadows, realistic reflections, professional photography, sharp focus, depth of field, 85mm lens, f1.8 aperture, ultra detailed, photorealistic"}
17. SYNTAX ENFORCEMENT: Every segment of the prompt must be separated by a comma. You are strictly forbidden from creating tags longer than three words. If an idea requires more detail, break it into multiple three-word tags.
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

async def orchestrator(user_input: str) -> str:
    """
    Processes user input through the LLM to decide what to do.
    """

    # Pull the model instance on demand to ensure it's loaded after the startup event.
    llm = get_llm_model()

    with llm.chat_session(system_prompt=ORCHESTRATOR_DIRECTIVES):
        response = llm.generate(user_input, max_tokens=50)

    normalized = str(response).strip().upper()
    print(f"[FlowForge] Orchestrator LLM response: {normalized}")

    if "IMAGE" in normalized:
        return "IMAGE_GENERATION"
    if "TEXT" in normalized:
        normalized = is_text(user_input, normalized)

        if "TEXT" in normalized:
            return "TEXT_GENERATION"
        else:
            return "IMAGE_GENERATION"
    if "VIDEO" in normalized:
        return "VIDEO_GENERATION"
    else:
        normalized = is_text(user_input, normalized)

        if "IMAGE" in normalized:
            return "IMAGE_GENERATION"
        if "TEXT" in normalized:
            return "TEXT_GENERATION"
        if "VIDEO" in normalized:
            return "VIDEO_GENERATION"

    return "TEXT_GENERATION"

def is_text(user_input: str, normalized: str) -> bool:
    """
    Helper function to determine if the response indicates text generation.
    """

    llm = get_llm_model()

    with llm.chat_session(system_prompt="Here is a conversation between a user and an LLM. Based on his text and the LLM's response, do you think he actually wanted text or was it supposed to be an image or video? Answer only with TEXT or IMAGE or VIDEO."):
        response = llm.generate(f"USER: {user_input}\nLLM: {normalized}", max_tokens=20)
    print("Primeira LLM:", normalized)
    print("Segunda LLM:", str(response).strip().upper())

    return str(response).strip().upper()

async def generate_text_response(user_input: str) -> str:
    """
    Generates a conversational response for text-based user requests.
    """

    llm = get_llm_model()

    with llm.chat_session(system_prompt=TEXT_DIRECTIVES):
        response = llm.generate(user_input, max_tokens=150)

    return str(response).strip()

async def generate_refined_prompt_for_image(user_input: str) -> str:
    """
    Processes user input through the LLM to generate structured tags. Returns only the content of the 'positive_prompt' 
    key.
    """

    # Pull the model instance on demand to ensure it's loaded after the startup event.
    llm = get_llm_model()

    with llm.chat_session(system_prompt=INTERPRETER_DIRECTIVES):
        response = llm.generate(user_input, max_tokens=200)

    if not response.endswith("}"):
        response = response + '"}'    # Attempt to salvage the JSON if there's trailing text.
        
    try:
        data = json.loads(response)
        print(f"[FlowForge] LLM success: {data}")
        return data.get("positive_prompt", "")
    except json.JSONDecodeError:
        print(f"[FlowForge] Error: LLM failed the structural JSON contract: {response}")
        return None