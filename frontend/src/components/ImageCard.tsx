import React from 'react';

/**
 * ImageCard component to display the generated output and its metadata.
 * Features a preview of the refined prompt and a download action.
 */
interface ImageCardProps {
  imageUrl: string | null;
  status: 'idle' | 'processing' | 'finished' | 'error';
  refinedPrompt?: string | null;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, status, refinedPrompt }) => {
  // Helper to handle image download
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `flowforge-${Date.now()}.png`;
      link.click();
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Preview Area */}
      <div className="aspect-square bg-zinc-950 flex items-center justify-center relative group">
        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-500 font-mono text-sm animate-pulse">RENDERING ASSETS...</p>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Generated output" 
              className="w-full h-full object-contain"
            />
            {/* Hover Overlay for Download */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-transform transform hover:scale-105"
              >
                DOWNLOAD IMAGE
              </button>
            </div>
          </>
        ) : status === 'error' ? (
          <p className="text-red-400 font-mono">FORGE_ERROR: FAILED TO GENERATE</p>
        ) : null}
      </div>

      {/* Metadata Area (Advanced Mode) */}
      {refinedPrompt && status === 'finished' && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Interpreted Prompt</h3>
          <p className="text-sm text-zinc-300 italic leading-relaxed">
            "{refinedPrompt}"
          </p>
        </div>
      )}
    </div>
  );
};