"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiZap, FiShare2, FiTrash2 } from "react-icons/fi";
import PhotoUploader from "@/components/PhotoUploader";

export default function Home() {
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([]);

  const handleFilesSelected = (files: File[]) => {
    const newPhotos = files.map((file) => ({
      // create strict local ObjectUrl to preview files directly from memory
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  // cleanup on unmount
  useEffect(() => {
    return () => photos.forEach(p => URL.revokeObjectURL(p.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] text-center pt-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl w-full"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-6 border border-neutral-200 dark:border-neutral-700">
          GSD Sandbox Testing: Phase 2
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
          Your Travels. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Beautifully Automated.
          </span>
        </h1>
        
        {/* Photo Uploader Component integrated from 2-1-PLAN */}
        <PhotoUploader onFilesSelected={handleFilesSelected} />

        {/* Feature Grid only shows before uploading begins */}
        {photos.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-4">
                <FiImage className="text-xl" />
              </div>
              <h3 className="font-bold mb-2">Batch Upload</h3>
              <p className="text-sm text-neutral-500">Drop 100+ photos at once. Preview strictly in browsers without lag.</p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-4">
                <FiZap className="text-xl" />
              </div>
              <h3 className="font-bold mb-2">AI Curation</h3>
              <p className="text-sm text-neutral-500">Smart algorithms filter duplicates and pick the very best shots.</p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-4">
                <FiShare2 className="text-xl" />
              </div>
              <h3 className="font-bold mb-2">Instant Share</h3>
              <p className="text-sm text-neutral-500">Generate a beautiful animated link to share with friends and family.</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Grid view replacing features after upload begins from 2-2-PLAN */}
      {photos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-16 pb-16"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm">{photos.length}</span>
              Photos Selected
            </h2>
            <button className="bg-foreground text-background px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              Begin AI Curating ✨
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div 
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative aspect-square rounded-2xl overflow-hidden group bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt="Upload preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removePhoto(photo.id)}
                      className="bg-red-500/90 text-white p-3 rounded-full hover:bg-red-500 hover:scale-110 transition-all shadow-xl"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
