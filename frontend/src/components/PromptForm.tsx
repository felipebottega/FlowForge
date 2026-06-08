import React, { useState } from 'react';

/**
 * PromptForm component for user natural language input.
 * Integrates with the main forge handler to trigger generation.
 */
interface PromptFormProps {
  onForge: (prompt: string) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onForge, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onForge(text);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <textarea
        className="w-full h-32 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder="Describe the image you want to create..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />
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