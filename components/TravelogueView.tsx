"use client";

import { motion } from "framer-motion";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { PhotoItem } from "@/lib/ai-curator";

// Fallback prose to immediately enhance the UAT experience without requiring a re-upload
const DUMMY_PROSE = [
  { title: "Whispers of the Wind", text: "Finding solace in the quiet moments between destinations. The light hit just right.", layoutStyle: "hero" },
  { title: "Urban Rhythms", text: "The pulse of the city captured in a single frame. Concrete and glass stretching to the sky.", layoutStyle: "left" },
  { title: "Timeless Echoes", text: "Some places make you forget what year it is. A timeless intersection of nature and architecture.", layoutStyle: "right" },
  { title: "Golden Hour Magic", text: "That fleeting 15 minutes where everything turns into gold and shadows dance playfully.", layoutStyle: "hero" },
  { title: "Serendipity", text: "We didn't plan to be here. Sometimes the best views are the ones you never looked for.", layoutStyle: "quote" },
  { title: "The Quiet Escape", text: "Away from the crowds, away from the noise. Just pure, unadulterated serenity.", layoutStyle: "left" },
  { title: "Chasing Horizons", text: "No matter how far we walk, the horizon always seems just out of reach, calling us further.", layoutStyle: "right" }
];

interface TravelogueViewProps {
  photos: PhotoItem[];
  onBack: () => void;
}

export default function TravelogueView({ photos, onBack }: TravelogueViewProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0A0A0A] text-[#f4f4f4] overflow-y-auto w-full pb-32 font-sans selection:bg-neutral-800"
    >
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="sticky top-0 inset-x-0 z-50 p-6 md:px-12 flex justify-between items-center pointer-events-none mix-blend-difference"
      >
        <button 
          onClick={onBack}
          className="pointer-events-auto text-white flex items-center gap-3 hover:opacity-70 transition-opacity font-serif italic text-lg"
        >
          <FiArrowLeft /> Return
        </button>
        <button 
          className="pointer-events-auto text-white flex items-center gap-3 hover:opacity-70 transition-opacity uppercase tracking-[0.2em] text-xs font-bold"
        >
          <FiShare2 /> Publish
        </button>
      </motion.header>

      {/* Editorial Title */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 mb-24 mt-[-80px]"
      >
        <p className="uppercase tracking-[0.4em] text-xs text-neutral-400 mb-8 font-light">
          An AI Curated Visual Essay
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif font-light tracking-tight leading-none mb-12">
          Visages.<br/>
          <span className="italic text-neutral-500">Mémories.</span>
        </h1>
        <div className="w-px h-24 bg-neutral-700 mb-8 animate-pulse" />
        <p className="text-sm uppercase tracking-widest text-neutral-500 font-bold">
          {currentDate}
        </p>
      </motion.div>

      {/* Editorial Flow */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col gap-32 md:gap-48 pb-32">
        {photos.map((photo, index) => {
          // Merge dummy prose into the photo dynamically
          const prose = (photo as any).prose || DUMMY_PROSE[index % DUMMY_PROSE.length];
          const { layoutStyle: style, title, text } = prose;

          if (style === 'hero') {
            return (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center text-center relative"
              >
                <div className="w-full relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-sm mb-12 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={title} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                </div>
                <h2 className="text-4xl md:text-6xl font-serif mb-6">{title}</h2>
                <p className="max-w-xl text-neutral-400 font-light leading-relaxed text-lg mx-auto">
                  {text}
                </p>
              </motion.div>
            );
          }

          if (style === 'left') {
            return (
              <div key={photo.id} className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full md:w-1/2 aspect-[4/5] overflow-hidden rounded-sm group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={title} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="w-full md:w-1/2 flex flex-col justify-center"
                >
                  <p className="uppercase tracking-[0.2em] text-xs text-neutral-500 mb-6">Chapter {index + 1}</p>
                  <h2 className="text-3xl md:text-5xl font-serif mb-8 italic">{title}</h2>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg max-w-md">
                    {text}
                  </p>
                </motion.div>
              </div>
            );
          }

          if (style === 'right') {
            return (
              <div key={photo.id} className="w-full flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full md:w-1/2 aspect-[3/4] overflow-hidden rounded-sm group scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={title} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="w-full md:w-1/2 flex flex-col justify-center items-end text-right"
                >
                  <div className="w-8 h-px bg-neutral-600 mb-8" />
                  <h2 className="text-3xl md:text-5xl font-serif mb-8">{title}</h2>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg max-w-sm">
                    {text}
                  </p>
                </motion.div>
              </div>
            );
          }

          if (style === 'quote') {
            return (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center justify-center py-24 px-4 text-center"
              >
                <h2 className="text-4xl md:text-7xl font-serif italic font-light leading-tight max-w-4xl text-neutral-300 mb-16 px-4">
                  "{text}"
                </h2>
                <div className="w-full max-w-sm aspect-square overflow-hidden rounded-full mx-auto grayscale hover:grayscale-0 transition-all duration-[2s]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={title} className="w-full h-full object-cover" />
                </div>
                <p className="uppercase tracking-[0.2em] text-xs text-neutral-500 mt-12">{title}</p>
              </motion.div>
            );
          }

          return null;
        })}
      </div>
      
      {/* End cinematic footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="w-full py-32 flex flex-col items-center justify-center border-t border-neutral-900"
      >
        <div className="w-2 h-2 rounded-full bg-white mb-8" />
        <p className="uppercase tracking-[0.5em] text-xs text-neutral-600 font-bold mb-4">
          The End
        </p>
        <p className="font-serif italic text-neutral-500">
          Generated via AI Editorial Framework
        </p>
      </motion.div>
    </motion.div>
  );
}
