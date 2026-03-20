"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiZap, FiShare2, FiTrash2, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";
import PhotoUploader from "@/components/PhotoUploader";
import { simulateAICuration, PhotoItem } from "@/lib/ai-curator";

type CurationStep = 'idle' | 'scanning' | 'complete';

export default function Home() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [curationStep, setCurationStep] = useState<CurationStep>('idle');
  const [rejectedPhotos, setRejectedPhotos] = useState<PhotoItem[]>([]);

  const handleFilesSelected = (files: File[]) => {
    const newPhotos = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'curated' as const
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setCurationStep('idle');
  };

  const removePhoto = (id: string, fromRejected = false) => {
    if (fromRejected) {
      setRejectedPhotos(prev => {
        const filtered = prev.filter(p => p.id !== id);
        const removed = prev.find(p => p.id === id);
        if (removed) URL.revokeObjectURL(removed.preview);
        return filtered;
      });
    } else {
      setPhotos(prev => {
        const filtered = prev.filter(p => p.id !== id);
        const removed = prev.find(p => p.id === id);
        if (removed) URL.revokeObjectURL(removed.preview);
        return filtered;
      });
    }
  };

  const beginCuration = async () => {
    if (photos.length === 0) return;
    setCurationStep('scanning');
    
    // Simulate AI Service
    const { curated, rejected } = await simulateAICuration(photos);
    setPhotos(curated);
    setRejectedPhotos(rejected);
    setCurationStep('complete');
  };

  const restorePhoto = (photo: PhotoItem) => {
    setRejectedPhotos(prev => prev.filter(p => p.id !== photo.id));
    setPhotos(prev => [{ ...photo, status: 'curated' }, ...prev]);
  };

  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      rejectedPhotos.forEach(p => URL.revokeObjectURL(p.preview));
    };
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
          GSD Sandbox Testing: Phase 3
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
          Your Travels. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Beautifully Automated.
          </span>
        </h1>
        
        {curationStep === 'idle' && (
          <PhotoUploader onFilesSelected={handleFilesSelected} />
        )}

        {photos.length === 0 && rejectedPhotos.length === 0 && curationStep === 'idle' && (
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

      {(photos.length > 0 || curationStep === 'scanning' || curationStep === 'complete') && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-16 pb-16 relative"
        >
          {curationStep === 'idle' && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm">{photos.length}</span>
                Photos Selected
              </h2>
              <button 
                onClick={beginCuration}
                className="bg-foreground text-background px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <FiZap /> Begin AI Curating
              </button>
            </div>
          )}

          {curationStep === 'scanning' && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 animate-pulse text-purple-500">
                <FiZap className="animate-bounce" /> AI is Curating...
              </h2>
              <div className="text-sm text-neutral-500">Analyzing faces, sharpness, and composition</div>
            </div>
          )}

          {curationStep === 'complete' && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full gap-4">
              <h2 className="text-3xl font-extrabold flex items-center gap-2 text-green-500">
                <FiCheckCircle /> AI Curated Selection <span className="text-lg text-neutral-500 ml-2">({photos.length})</span>
              </h2>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all flex items-center gap-2">
                <FiShare2 /> Generate Travelogue View
              </button>
            </div>
          )}

          <div className="relative">
            {curationStep === 'scanning' && (
              <motion.div 
                className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] rounded-2xl overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                  animate={{ y: ["0%", "4000%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </motion.div>
            )}

            <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${curationStep === 'scanning' ? 'pointer-events-none' : ''}`}>
              <AnimatePresence>
                {photos.map((photo) => (
                  <motion.div 
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    layout
                    className="relative aspect-square rounded-2xl overflow-hidden group bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.preview} alt="curated image" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    {curationStep !== 'scanning' && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => removePhoto(photo.id)}
                          className="bg-red-500/90 text-white p-3 rounded-full hover:bg-red-500 hover:scale-110 transition-all shadow-xl"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rejected / Excluded Section */}
      {curationStep === 'complete' && rejectedPhotos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800 text-left pb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-neutral-500 flex items-center gap-2">
              Excluded by AI
            </h3>
            <span className="bg-neutral-200 dark:bg-neutral-800 py-1 px-3 rounded-full text-sm font-semibold text-neutral-500">{rejectedPhotos.length}</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <AnimatePresence>
              {rejectedPhotos.map((photo) => (
                <motion.div 
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  layout
                  className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt="rejected image" className="w-full h-full object-cover grayscale" />
                  
                  <div className="absolute top-0 left-0 right-0 p-1 bg-black/80 text-[10px] text-white text-center font-bold tracking-wider uppercase z-10">
                    {photo.reason}
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
                    <button 
                      onClick={() => restorePhoto(photo)}
                      className="bg-blue-500/90 text-white p-2 rounded-full hover:bg-blue-500 hover:scale-110 transition-all shadow-xl flex items-center gap-2 px-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    >
                      <FiRefreshCcw className="text-sm" /> <span className="text-xs font-bold">Restore</span>
                    </button>
                    <button 
                      onClick={() => removePhoto(photo.id, true)}
                      className="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-500 hover:scale-110 transition-all shadow-xl flex items-center justify-center w-8 h-8"
                    >
                      <FiTrash2 className="text-sm" />
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
