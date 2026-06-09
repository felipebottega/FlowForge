/**
 * PromptForm component for user natural language input.
 * Integrates with the main forge handler to trigger generation.
 */
import React, { useState } from 'react';

interface PromptFormProps {
  onForge: (prompt: string, cfg: number) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onForge, isLoading }) => {
  const [text, setText] = useState('');
  const [cfg, setCfg] = useState(2); // CFG state initialized at 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onForge(text, cfg);
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

        {/* CFG Slider positioned to the right side of the main form box */}
        <div className="absolute left-full top-0 ml-4 w-48 flex flex-col gap-2">
          <label className="text-zinc-400 text-sm flex justify-between font-bold">
            <span>CFG Scale</span>
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