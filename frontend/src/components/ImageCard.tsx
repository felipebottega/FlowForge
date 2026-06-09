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

    const handleDownload = async () => {
        if (!imageUrl) return;

        try {
        // 1. Faz a requisição da imagem de forma assíncrona
        const response = await fetch(imageUrl);
        
        // 2. Converte a resposta em um arquivo binário (Blob)
        const blob = await response.blob();
        
        // 3. Cria uma URL local (mesma origem) temporária para esse Blob
        const blobUrl = window.URL.createObjectURL(blob);

        // 4. Cria o elemento <a> e dispara o clique
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `flowforge-${Date.now()}.png`;
        
        // É necessário anexar o link ao body para funcionar corretamente no Firefox
        document.body.appendChild(link);
        link.click();

        // 5. Limpeza de memória
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        } catch (error) {
        console.error("Falha ao realizar o download da imagem:", error);
        }
    };

    return (
    <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all relative">
      
      {/* Media Display Area */}
      <div className="aspect-square w-full flex items-center justify-center bg-zinc-950 relative group">
        
        {/* Spinner de Carregamento */}
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-mono animate-pulse text-sm">FORGING ASSETS...</p>
          </div>
        )}

        {/* Imagem Finalizada e Controles */}
        {status === 'finished' && imageUrl && (
          <>
            <img src={`${imageUrl}?t=${new Date().getTime()}`} alt="Generated" className="w-full h-full object-cover" />
            
            {/* Overlay com Botão de Download */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-transform transform hover:scale-105"
              >
                DOWNLOAD IMAGE
              </button>
            </div>

            {/* Tooltip do Prompt Refinado (Isolado do overlay principal) */}
            {refinedPrompt && (
              <div className="absolute top-4 right-4 z-20 group/tooltip cursor-help">
                <div className="bg-zinc-900/80 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors shadow-lg">
                  <span className="font-mono text-sm font-bold">?</span>
                </div>
                
                {/* Caixa de texto do Tooltip */}
                <div className="absolute top-10 right-0 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all transform origin-top-right scale-95 group-hover/tooltip:scale-100">
                  <p className="text-xs text-blue-400 font-mono uppercase mb-1">Refined Prompt:</p>
                  <p className="text-xs text-zinc-300 italic">"{refinedPrompt}"</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Exibição de Erro */}
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