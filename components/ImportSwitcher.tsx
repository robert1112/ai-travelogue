"use client";

import React, { useState } from 'react';
import PhotoUploader from "@/components/PhotoUploader";
import SocialMediaImporter from "@/components/SocialMediaImporter";

interface ImportSwitcherProps {
  onFilesSelected: (files: File[]) => void;
  onUrlsSelected: (urls: string[]) => void;
}

export default function ImportSwitcher({ onFilesSelected, onUrlsSelected }: ImportSwitcherProps) {
  const [importMode, setImportMode] = useState<'file' | 'link'>('file');

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <div className="flex items-center bg-white/10 p-0.5 rounded-sm">
          <button
            onClick={() => setImportMode('file')}
            className={`px-4 py-2 text-xs uppercase font-bold tracking-widest ${
              importMode === 'file' ? 'bg-[#CC0000] text-white' : 'text-neutral-400'
            }`}
          >
            Local Files
          </button>
          <button
            onClick={() => setImportMode('link')}
            className={`px-4 py-2 text-xs uppercase font-bold tracking-widest ${
              importMode === 'link' ? 'bg-[#CC0000] text-white' : 'text-neutral-400'
            }`}
          >
            Social Media
          </button>
        </div>
      </div>
      
      {importMode === 'file' ? (
        <PhotoUploader onFilesSelected={onFilesSelected} />
      ) : (
        <SocialMediaImporter onUrlsSelected={onUrlsSelected} />
      )}
    </div>
  );
}
