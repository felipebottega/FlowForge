/**
 * PromptForm component for user natural language input.
 * Integrates with the main forge handler to trigger generation.
 */
import React, { useState } from 'react';

interface PromptFormProps {
  onForge: (prompt: string, cfg: number, steps: number) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onForge, isLoading }) => {
  const [text, setText] = useState('');
  const [cfg, setCfg] = useState(2); // CFG state initialized at 2
  const [steps, setSteps] = useState(20); // Steps state initialized at 20

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onForge(text, cfg, steps);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 relative">
      {/* Container for the text area and the absolute positioned slider */}
      <div className="relative w-full">
        <textarea
          className="w-full h-32 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Describe the image you want to create..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />

        {/* Adjustments Panel positioned to the right side of the main form box */}
        <div className="absolute left-full top-0 ml-4 w-48 flex flex-col gap-4">
          {/* CFG Slider container */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm flex justify-between font-bold">
              <span className="flex items-center gap-1">
                CFG Scale
                {/* Tooltip implementation using pure Tailwind CSS utility classes */}
                <span className="relative flex items-center group cursor-help normal-case font-normal">
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400 font-bold select-none">
                    ?
                  </span>
                  {/* Floating help container visible on hover state */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
                    Controls the fidelity to your text. Lower values give the AI more creative freedom, while higher values force the image to strictly follow the prompt.
                  </span>
                </span>
              </span>
              <span>{cfg}</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={cfg}
              onChange={(e) => setCfg(parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Steps Slider container positioned right below CFG */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-sm flex justify-between font-bold">
              <span className="flex items-center gap-1">
                Sampling Steps
                {/* Tooltip implementation using pure Tailwind CSS utility classes */}
                <span className="relative flex items-center group cursor-help normal-case font-normal">
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400 font-bold select-none">
                    ?
                  </span>
                  {/* Floating help container visible on hover state */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
                    Defines the number of denoising iterations. Fewer steps are faster but lower quality, while more steps refine details up to a point of stability.
                  </span>
                </span>
              </span>
              <span>{steps}</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value, 10))}
              disabled={isLoading}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
      >
        {isLoading ? 'FORGING...' : 'FORGE IMAGE'}
      </button>
    </form>
  );
};

export default PromptForm;