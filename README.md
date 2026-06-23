<div align="center">
  
# FlowForge

[![Release](https://img.shields.io/badge/release-v0.5.0-orange)](https://github.com/felipebottega/FlowForge/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-05998b?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
<br>
[![CUDA](https://img.shields.io/badge/CUDA-GPU_Accelerated-green?style=flat&logo=nvidia&logoColor=white)](https://developer.nvidia.com/cuda-zone)
[![ComfyUI](https://img.shields.io/badge/ComfyUI-000000?style=flat&logo=comfyui&logoColor=white)](https://github.com/comfyanonymous/ComfyUI)
[![DeepSeek](https://img.shields.io/badge/LLM-DeepSeek-blue?style=flat&logo=deepseek&logoColor=white)](https://www.deepseek.com/)
[![GPT4All](https://img.shields.io/badge/Engine-GPT4All-brightgreen?style=flat&logo=ai&logoColor=white)](https://gpt4all.io/)
</div>

FlowForge translates natural language into ComfyUI execution. It functions as an intelligent layer that validates requirements and orchestrates image and video rendering end-to-end. The entire ecosystem is built on a fully open-source stack for local execution, ensuring transparency, total independence, and no usage limits.

<p align="center">
  <img width="900" src="https://github.com/user-attachments/assets/f25c60b2-2dde-49eb-a839-6641cb70c416" />
</p>

## Installation

To try FlowForge, first clone this project to your local machine. After that, install the ComfyUI Window Portable version inside the project folder ([direct download link here](https://github.com/comfyanonymous/ComfyUI/releases/latest/download/ComfyUI_windows_portable_nvidia.7z)). The folder should have the structure shown below.
**Warning:** This project requires an NVIDIA GPU with CUDA support to run GPU acceleration.

<p align="center">
  <img width="240" src="https://github.com/user-attachments/assets/4c8b7419-96c6-4c71-98c4-a7979b269820" />
</p>

Finally, open the terminal in the folder location and run the following commands to install [FastAPI](https://fastapi.tiangolo.com/), [gpt4all](https://pypi.org/project/gpt4all/) and RAG dependencies:

```
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install "fastapi[standard]"
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install -U "gpt4all[cuda]"
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install gpt4all requests
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install sentence-transformers faiss-cpu
```

FlowForge uses a React frontend and requires Node.js and npm to be installed on your system. You can download Node.js from: https://nodejs.org/. After installing Node.js, open a terminal in the project root and run:

```
cd frontend
npm install
cd ..
```

This will create the node_modules directory inside the frontend folder and install all required frontend dependencies. After setup, launch `run_flow_forge.bat`.

Alternatively, you can download the standalone version of this project with everything already installed and ready to use [here](https://github.com/felipebottega/FlowForge/releases/).

## System Architecture

The system is decoupled into specialized layers, ensuring that business logic, orchestration, and execution remain distinct:

| Layer | Responsibility | Value Proposition |
| :--- | :--- | :--- |
| **React** | Conversation, Preview, Download | Intuitive UX & Result Presentation |
| **FastAPI** | Orchestration, Job/State Management | Robust Backend & Scalability |
| **LLM** | Natural Language to JSON Parsing | Advanced Intent Interpretation |
| **ComfyUI** | Node-based Pipeline Execution | Real-world Generative Integration |
| **Storage** | Outputs, Logs, Metadata | Auditability & History Tracking |

## Technical Implementation
FlowForge operates on a robust data-flow cycle:
1.  **Intent Parsing:** A specialized LLM chain transforms unstructured text into a structured JSON contract.
2.  **Schema Validation:** Pydantic models validate the structure before execution, preventing invalid workflows.
3.  **Job Orchestration:** FastAPI dispatches jobs to ComfyUI, managing status updates via asynchronous queues.
4.  **Feedback Loop:** Results are captured, logged, and surfaced to the UI with download capabilities.

## RAG

FlowForge also features a RAG (*Retrieval-Augmented Generation*) layer to generate specialized prompts from the user's natural language prompt. It searches a vector database of high-quality prompts and injects the most relevant matches into the orchestration prompt, helping generate a better final prompt for image and video generation.

```mermaid
flowchart LR
    A[User Prompt]
    B[Embedding Model]
    C[Vector Database]
    D[Retrieved Examples]
    E[Orchestrator]

    A --> B
    B --> C
    C --> D

    A --> E
    D --> E

    E --> F[Specialized Prompt]
```

By retrieving semantically similar examples from a curated prompt database, the RAG layer helps the orchestrator generate more accurate and specialized prompts than relying on the user's request alone.

## Roadmap
- [x] Schema Design & Contract Definition
- [x] LLM Prompt Engineering & Parser Logic
- [x] Backend API (FastAPI) & Job Orchestration
- [x] ComfyUI Integration (Image workflows)
- [ ] ComfyUI Integration (Video workflows)
- [x] React Interface (Chat/Preview/Download)
- [x] Advanced Features
