/**
 * App.tsx - Main Orchestrator for FlowForge Frontend.
 * Handles the generation lifecycle: Input -> Submission -> Polling -> Display.
 */
import React, { useState, useEffect } from 'react';
import { workflowApi } from './services/api';
import { GenerationResponse, StatusResponse } from './types';

const App: React.FC = () => {
  // State management for the generation flow
  const [prompt, setPrompt] = useState<string>('');
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

    if (promptId && status === 'processing') {
      pollInterval = setInterval(async () => {
        try {
          const { data } = await workflowApi.checkStatus(promptId);
          
          if (data.status === 'finished' && data.filename) {
            // ComfyUI outputs are served through the backend static mount
            setImageUrl(`http://localhost:8000/outputs/${data.filename}`);
            setStatus('finished');
            setLoading(false);
            clearInterval(pollInterval);
          } else if (data.status === 'error') {
            setStatus('error');
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds for offline efficiency
    }

    return () => clearInterval(pollInterval);
  }, [promptId, status]);

  /**
   * Submits the user prompt to the FastAPI orchestrator.
   */
  const handleForge = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStatus('processing');
    setImageUrl(null);
    setRefinedPrompt(null);

    try {
      const { data } = await workflowApi.generate(prompt);
      setPromptId(data.prompt_id);
      setRefinedPrompt(data.interpreted_prompt);
    } catch (err) {
      console.error("Generation failed:", err);
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">FLOW<span className="text-blue-500">FORGE</span></h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">LLM Orchestrator for ComfyUI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs font-mono text-zinc-400">{status.toUpperCase()}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Natural Language Prompt</label>
            <textarea
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all"
              placeholder="e.g., 'A futuristic knight in a rainy neon city'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleForge}
              disabled={loading || !prompt.trim()}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 py-3 rounded-lg font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
            >
              {loading ? 'FORGING...' : 'GENERATE ASSETS'}
            </button>
          </div>

          {/* Prompt Refinement Feedback (LLM Output) */}
          {refinedPrompt && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">LLM Refined Tags</h3>
              <p className="text-xs font-mono text-blue-400 leading-relaxed italic">
                {refinedPrompt}
              </p>
            </div>
          )}
        </section>

        {/* Right Column: Preview Area */}
        <section className="lg:col-span-7">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[512px] flex items-center justify-center relative shadow-2xl">
            {!imageUrl && !loading && (
              <div className="text-center space-y-2">
                <div className="text-zinc-700 text-5xl">✦</div>
                <p className="text-zinc-600 text-sm">Idle. Waiting for generation.</p>
              </div>
            )}

            {loading && status === 'processing' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm font-medium text-zinc-400 animate-pulse">ComfyUI is rendering your vision...</p>
              </div>
            )}

            {imageUrl && (
              <div className="w-full h-full p-2">
                <img 
                  src={imageUrl} 
                  alt="Generated Result" 
                  className="w-full h-auto rounded-lg object-contain shadow-inner"
                />
                <a 
                  href={imageUrl} 
                  download 
                  className="absolute bottom-6 right-6 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-700 p-3 rounded-full backdrop-blur-sm transition-colors"
                  title="Download Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="text-red-400 text-sm flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <p>An error occurred during orchestration.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto p-8 text-center border-t border-zinc-900 mt-8">
        <p className="text-zinc-600 text-[10px] tracking-widest uppercase italic">© 2026 FlowForge System - Local Environment Ready</p>
      </footer>
    </div>
  );
};

export default App;