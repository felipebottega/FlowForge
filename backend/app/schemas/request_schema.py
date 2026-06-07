"""
This module defines the data structures (schemas) for FlowForge requests. It ensures structural integrity by validating 
that the backend receives exactly what is required to initiate the media generation flow.
"""
from pydantic import BaseModel


class WorkflowRequest(BaseModel):
    """
    Defines the data contract for a generation request. Currently validates only the 'prompt' field.
    """
    
    prompt: str