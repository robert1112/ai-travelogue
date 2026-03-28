"use client";

import React, { useState } from 'react';
import { FiLink, FiLoader } from 'react-icons/fi';

interface SocialMediaImporterProps {
  onUrlsSelected: (urls: string[]) => void;
}

export default function SocialMediaImporter({ onUrlsSelected }: SocialMediaImporterProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    const urls = inputValue
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (urls.length === 0) {
      setError('Please enter at least one URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allImages: string[] = [];
      
      for (const url of urls) {
        const response = await fetch('/api/scrape-social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `Failed to process ${url}`);
        }
        
        if (data.images && Array.isArray(data.images)) {
          allImages.push(...data.images);
        }
      }
      
      if (allImages.length === 0) {
        throw new Error('No images found in the provided URLs');
      }
      
      onUrlsSelected(allImages);
      setInputValue('');
    } catch (err: any) {
      setError(err.message || 'Failed to import images');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-12 mt-8 rounded-none border border-white/10 bg-[#141414]/80 backdrop-blur-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <FiLink className="text-[#CC0000] text-xl" />
          <h3 className="text-[#E8E2D9] font-mono text-xs uppercase tracking-widest">
            Import from Social Media
          </h3>
        </div>
        
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste Instagram URLs here, one per line..."
          className="w-full h-32 bg-[#0D0D0D] border border-white/20 rounded p-4 text-[#E8E2D9] font-mono text-sm resize-none focus:outline-none focus:border-[#CC0000]"
          disabled={isLoading}
        />
        
        {error && (
          <div className="text-[#CC0000] text-xs font-mono">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={isLoading || !inputValue.trim()}
            className={`px-6 py-2.5 bg-[#CC0000] text-white uppercase tracking-widest text-xs font-bold flex items-center gap-2 ${
              isLoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#AA0000]'
            }`}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" />
                Importing...
              </>
            ) : (
              'Import Images'
            )}
          </button>
        </div>
        
        <p className="text-[#444444] text-xs font-mono text-center">
          Currently supports Instagram posts (single & carousel)
        </p>
      </div>
    </div>
  );
}
