/**
 * App.tsx - Final Orchestrator for FlowForge.
 * Manages the full lifecycle: Prompt Input -> Technical Refinement -> Polling -> Visual Output.
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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  /**
   * Monitors the generation progress on the backend.
   * Periodically checks the job status until completion or failure.
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
            setErrorDetails(data.error_details || "Generation failed in ComfyUI.");
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling synchronization error:", err);
        }
      }, 5000); // Polls every 5 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [promptId, workflowStatus]);

  /**
   * Initiates the forging process by sending the user prompt to the API.
   */
  const handleForge = async (userPrompt: string, cfg: number, steps: number) => {
    try {
      setLoading(true);
      setWorkflowStatus('processing');
      setImageUrl(null);
      setRefinedPrompt(null);
      setErrorDetails(null);

      const data = await workflowApi.generate(userPrompt, cfg, steps);
      setPromptId(data.prompt_id);
      setRefinedPrompt(data.refined_prompt);
    } catch (error) {
      console.error("Failed to initiate forge flow:", error);
      setWorkflowStatus('error');
      setErrorDetails("Unable to reach the orchestration server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800 p-2 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            FLOW<span className="text-blue-500">FORGE</span>
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">LLM Orchestrator for ComfyUI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            workflowStatus === 'processing' ? 'bg-yellow-500 animate-pulse' : 
            workflowStatus === 'finished' ? 'bg-green-500' : 'bg-zinc-700'
          }`} />
          <span className="text-xs font-mono text-zinc-400">{workflowStatus.toUpperCase()}</span>
        </div>
      </header>

      {/* Main Orchestration Area */}
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