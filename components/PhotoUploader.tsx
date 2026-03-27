"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiAperture } from 'react-icons/fi';

export default function PhotoUploader({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    maxFiles: 100
  });

  return (
    <div 
      {...getRootProps()} 
      className={`w-full max-w-2xl mx-auto p-12 mt-8 rounded-none border transition-all cursor-pointer ${
        isDragActive 
          ? 'border-[#CC0000] bg-[#CC0000]/5 scale-[1.02]' 
          : 'border-white/10 hover:border-[#CC0000]/50 bg-[#141414]/80 backdrop-blur-sm hover:bg-[#1A1A1A]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center gap-4">
        {/* Leica lens circle */}
        <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${
          isDragActive ? 'border-[#CC0000] text-[#CC0000]' : 'border-white/20 text-[#666666]'
        }`}>
          <FiAperture className={`${isDragActive ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        </div>

        <div>
          <p className="text-base font-medium tracking-widest uppercase text-[#E8E2D9] mb-2"
            style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
            {isDragActive ? "Release to load film" : "Load images"}
          </p>
          <p className="text-[#444444] text-xs tracking-wider uppercase"
            style={{ fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.12em' }}>
            Drag & drop · click to browse · max 100 frames
          </p>
        </div>
      </div>
    </div>
  );
}
