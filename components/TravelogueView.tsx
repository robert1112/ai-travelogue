"use client";

import { motion } from "framer-motion";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { PhotoItem } from "@/lib/ai-curator";

interface TravelogueViewProps {
  photos: PhotoItem[];
  onBack: () => void;
}

export default function TravelogueView({ photos, onBack }: TravelogueViewProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto w-full pb-32"
    >
      {/* Floating Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="sticky top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none"
      >
        <button 
          onClick={onBack}
          className="pointer-events-auto bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-black/90 transition-all border border-white/10 shadow-lg hover:pr-6"
        >
          <FiArrowLeft /> <span className="font-medium text-sm">Back to Edit</span>
        </button>
        <button 
          className="pointer-events-auto bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-xl hover:scale-105"
        >
          <FiShare2 /> Share Link
        </button>
      </motion.header>

      {/* Hero Title Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 mb-10"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight">
          A Journey Through <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
            Beautiful Memories
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
          {currentDate} <span className="opacity-50 mx-3">•</span> {photos.length} Captured Moments
        </p>
      </motion.div>

      {/* Staggered Masonry Grid */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.8, delay: (index % 4) * 0.1, ease: [0.25, 0.4, 0.2, 1] }}
            className="w-full break-inside-avoid overflow-hidden rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 shadow-xl group border border-neutral-200 dark:border-neutral-800 relative cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={photo.preview} 
              alt="Travel moment" 
              className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
              loading="lazy"
            />
            
            {/* Subtle Gradient Overlay on Hover for Cinematic Feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <span className="text-white text-sm font-bold tracking-widest uppercase opacity-80 backdrop-blur-sm bg-black/30 px-3 py-1 rounded-full w-max">
                Highlight
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
