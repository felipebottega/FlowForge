# FlowForge

FlowForge translates natural language into ComfyUI execution. It functions as an intelligent layer that validates requirements and orchestrates image and video rendering end-to-end, removing manual bottlenecks.

## Installation

To try FlowForge, first clone this project to your local machine. After that, install the ComfyUI Window Portable version inside the project folder ([direct download link here](https://github.com/comfyanonymous/ComfyUI/releases/latest/download/ComfyUI_windows_portable_nvidia.7z)). The folder should have the structure shown below.

<p align="center">
  <img width="300" src="https://github.com/user-attachments/assets/167de616-c5a4-48a9-8b7a-e7fe7aa19ebf" />
</p>

Finally, open the terminal in the folder location and run the following commands to install [FastAPI](https://fastapi.tiangolo.com/) and [gpt4all](https://pypi.org/project/gpt4all/):


```
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install "fastapi[standard]"
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install -U "gpt4all[cuda]"
.\ComfyUI_windows_portable\python_embeded\python.exe -m pip install gpt4all requests
```

After setup, launch `run_flow_forge.bat`.

Alternatively, you can download the standalone version of this project with everything already installed and ready to use [here](https://github.com/felipebottega/FlowForge/releases/tag/v0.1.0).

## Core Philosophy
This project was built to solve the "prototyping gap", where many AI implementations fail to move from a chat-interface demo to a reliable, production-ready system. FlowForge emphasizes:

* **Structural Integrity:** Enforcing schema-first design to ensure reliable communication between LLMs and visual engines.
* **Observability:** Treating media rendering as an asynchronous job, with clear state management, logging, and error handling.
* **UX-First Engineering:** Providing a natural, conversational interface that abstracts the underlying complexity of node-based workflows without sacrificing control.

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

## Roadmap
- [x] Schema Design & Contract Definition
- [x] LLM Prompt Engineering & Parser Logic
- [ ] Backend API (FastAPI) & Job Orchestration
- [ ] ComfyUI Integration (Image/Video workflows)
- [ ] React Interface (Chat/Preview/Download)
- [ ] Advanced Features: JSON Editor, A/B Variant Comparison, Auto-Correction

## License
MIT
