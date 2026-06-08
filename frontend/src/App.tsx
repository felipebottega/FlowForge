/**
 * App.tsx - Main Orchestrator for FlowForge Frontend.
 * Handles the generation lifecycle: Input -> Submission -> Polling -> Display.
 */
import React, { useState, useEffect } from 'react';
import PromptForm from './components/PromptForm';
import ImageCard from './components/ImageCard';
import { workflowApi } from './services/api';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'processing' | 'finished' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
  // Holds technical error information from the backend
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  /**
   * Polling effect: Watches the promptId and status.
   * Periodically checks the backend until the image is ready.
   */
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (workflowStatus === 'processing' && promptId) {
      pollInterval = setInterval(async () => {
        try {
          const data = await workflowApi.getStatus(promptId);
          
          if (data.status === 'finished' && data.image_url) {
            setImageUrl(data.image_url);
            setWorkflowStatus('finished');
            setLoading(false);
            clearInterval(pollInterval);
          } else if (data.status === 'error') {
            setWorkflowStatus('error');
            // Captures detailed feedback if available in the response
            setErrorDetails(data.error_details || "Unknown execution error");
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [promptId, workflowStatus]);

  /**
   * Submits the user prompt to the FastAPI orchestrator.
   */
  const handleForge = async (userPrompt: string) => {
    try {
      setLoading(true);
      setWorkflowStatus('processing');
      setImageUrl(null);
      setRefinedPrompt(null);
      setErrorDetails(null);

      const data = await workflowApi.generate(userPrompt);
      setPromptId(data.prompt_id);
      setRefinedPrompt(data.refined_prompt);
    } catch (error) {
      console.error("Forge initiation failed:", error);
      setWorkflowStatus('error');
      setErrorDetails("Failed to connect to the orchestration server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            FLOW<span className="text-blue-500">FORGE</span>
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">LLM Orchestrator for ComfyUI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${workflowStatus === 'processing' ? 'bg-yellow-500 animate-pulse' : workflowStatus === 'finished' ? 'bg-green-500' : 'bg-zinc-700'}`} />
          <span className="text-xs font-mono text-zinc-400">{workflowStatus.toUpperCase()}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 flex flex-col items-center gap-12">
        <PromptForm onForge={handleForge} isLoading={loading} />
        
        <ImageCard 
          imageUrl={imageUrl} 
          status={workflowStatus} 
          refinedPrompt={refinedPrompt}
          errorDetails={errorDetails} 
        />
      </main>
    </div>
  );
};

export default App;