# FlowForge

FlowForge translates natural language into ComfyUI execution. It functions as an intelligent layer that validates requirements and orchestrates image and video rendering end-to-end, removing manual bottlenecks.

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

## Key Engineering Differentiators
* **Schema-First Validation:** Ensures that the LLM's output is consistently executable, minimizing runtime failures.
* **Asynchronous Job Handling:** Robust queuing mechanism to process high-compute rendering tasks without blocking the application.
* **Versioned Workflows:** Separation and versioning of ComfyUI pipelines for different media types (image vs. video).
* **Observability & Debugging:** Comprehensive logs that capture the prompt, JSON state, execution errors, and final output metadata.

## Roadmap
- [x] Schema Design & Contract Definition
- [ ] LLM Prompt Engineering & Parser Logic
- [ ] Backend API (FastAPI) & Job Orchestration
- [ ] ComfyUI Integration (Image/Video workflows)
- [ ] React Interface (Chat/Preview/Download)
- [ ] Advanced Features: JSON Editor, A/B Variant Comparison, Auto-Correction

## License
MIT
