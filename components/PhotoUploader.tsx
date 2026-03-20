"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

export default function PhotoUploader({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles: 100
  });

  return (
    <div 
      {...getRootProps()} 
      className={`w-full max-w-2xl mx-auto p-12 mt-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
        isDragActive 
          ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 bg-background/50 backdrop-blur-sm'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 text-3xl">
          <FiUploadCloud />
        </div>
        <p className="text-xl font-bold mb-2">
          {isDragActive ? "Drop the photos here..." : "Drag & drop photos here"}
        </p>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          or click to browse from your device (Max 100 images)
        </p>
      </div>
    </div>
  );
}
