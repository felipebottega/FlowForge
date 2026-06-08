/**
 * App.tsx - Main Orchestrator for FlowForge Frontend.
 * Handles the generation lifecycle: Input -> Submission -> Polling -> Display.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PromptForm from './components/PromptForm';
import ImageCard from './components/ImageCard';
import { GenerationResponse, StatusResponse } from './types/JobResponse';

const App: React.FC = () => {
  // State management for the generation flow
  const [loading, setLoading] = useState<boolean>(false);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'finished' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);

  /**
   * Polling effect: Watches the promptId and status.
   * Periodically checks the backend until the image is ready.
   */
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (status === 'processing' && promptId) {
      pollInterval = setInterval(async () => {
        try {
          const response = await axios.get<StatusResponse>(`/api/status/${promptId}`);
          
          if (response.data.status === 'finished') {
            setImageUrl(response.data.image_url || null);
            setStatus('finished');
            setLoading(false);
            clearInterval(pollInterval);
          } else if (response.data.status === 'error') {
            setStatus('error');
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Polling error:", error);
          setStatus('error');
          setLoading(false);
          clearInterval(pollInterval);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [promptId, status]);

  /**
   * Submits the user prompt to the FastAPI orchestrator.
   */
  const handleForge = async (userPrompt: string) => {
    setLoading(true);
    setStatus('processing');
    setImageUrl(null);
    setRefinedPrompt(null);

    try {
      const response = await axios.post<GenerationResponse>('/api/generate', {
        prompt: userPrompt
      });

      setPromptId(response.data.prompt_id);
      setRefinedPrompt(response.data.refined_prompt);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
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
          <div className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-yellow-500 animate-pulse' : status === 'finished' ? 'bg-green-500' : 'bg-zinc-700'}`} />
          <span className="text-xs font-mono text-zinc-400">{status.toUpperCase()}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8 flex flex-col items-center gap-12">
        <section className="w-full flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-white">FORGE YOUR VISION</h2>
            <p className="text-zinc-400">Describe your idea, and our LLM will refine the technical workflow.</p>
          </div>
          
          <PromptForm onForge={handleForge} isLoading={loading} />
        </section>

        <section className="w-full flex justify-center pb-20">
          <ImageCard 
            imageUrl={imageUrl} 
            status={status} 
            refinedPrompt={refinedPrompt} 
          />
        </section>
      </main>
    </div>
  );
};

export default App;