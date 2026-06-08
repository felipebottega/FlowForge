/**
 * ImageCard.tsx - Displays the result and the technical refinement.
 */
import React from 'react';

interface ImageCardProps {
  imageUrl: string | null;
  status: 'idle' | 'processing' | 'finished' | 'error';
  refinedPrompt?: string | null;
  errorDetails?: string | null;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, status, refinedPrompt, errorDetails }) => {
  if (status === 'idle') return null;

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `flowforge-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all">
      {/* Refined Prompt Section */}
      {refinedPrompt && (
        <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
          <p className="text-xs text-blue-400 font-mono uppercase mb-2">Refined Technical Prompt:</p>
          <p className="text-sm text-zinc-300 italic">"{refinedPrompt}"</p>
        </div>
      )}

      {/* Media Display Area */}
      <div className="aspect-square w-full flex items-center justify-center bg-zinc-950 relative group">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-mono animate-pulse text-sm">FORGING ASSETS...</p>
          </div>
        )}

        {status === 'finished' && imageUrl && (
          <>
            <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-transform transform hover:scale-105"
              >
                DOWNLOAD IMAGE
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="p-6 text-center">
            <p className="text-red-400 font-mono mb-2">FORGE_ERROR</p>
            <p className="text-xs text-zinc-500 max-w-xs">{errorDetails || "Failed to communicate with ComfyUI"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;