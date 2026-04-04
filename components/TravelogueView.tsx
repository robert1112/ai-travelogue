"use client"; 

import { motion, useAnimation } from "framer-motion";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { PhotoItem } from "@/lib/ai-curator";

import type { TravelogueData, ChapterData } from "@/components/TravelogueEditor";
import { PublishButton } from "@/components/publish-button";
import { format, parseISO } from "date-fns";
import React, { useState, useRef, useEffect } from "react";

function InteractivePhoto({ src, alt, themeClass, isPublicView = false }: { src: string, alt?: string, themeClass?: string, isPublicView?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const maxX = (width * scale - width) / 2;
      const maxY = (height * scale - height) / 2;
      setConstraints({
        top: -maxY,
        bottom: maxY,
        left: -maxX,
        right: maxX,
      });
    }
  }, [scale]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (!isEditing) return;
      e.preventDefault();
      setScale(s => {
        const newScale = Math.min(Math.max(1, s - e.deltaY * 0.005), 4);
        if (newScale === 1) {
          controls.start({ x: 0, y: 0 });
        }
        return newScale;
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [controls, isEditing]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden group bg-[#111]"
    >
      <motion.img 
        src={src} 
        alt={alt || "Travelogue Image"}
        className={`w-full h-full object-cover origin-center ${themeClass || ''} ${isEditing ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        style={{ scale }}
        animate={controls}
        drag={isEditing && scale > 1}
        dragConstraints={constraints}
        dragElastic={0}
        dragMomentum={false}
      />
      
      {/* Edit Overlay Button (only shown when not editing and NOT in public view) */}
      {!isEditing && !isPublicView && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white/90 text-xs tracking-widest uppercase font-bold border border-white/20 hover:bg-white/10"
        >
          Edit Crop
        </button>
      )}

      {/* Editing Mode UI (only shown when editing) */}
      {isEditing && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
            className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl px-4 py-2 rounded-full z-20 border border-[#CC0000] animate-pulse hover:bg-[#CC0000] group/done transition-all shadow-[0_0_20px_rgba(204,0,0,0.4)]"
          >
            <p className="text-[#CC0000] group-hover/done:text-white text-[10px] uppercase tracking-widest font-black">DONE</p>
          </button>

          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 z-10 border border-white/20 shadow-xl"
            onWheel={e => e.stopPropagation()} 
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <span className="text-white/70 text-xs font-mono">1x</span>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="0.01" 
              value={scale} 
              onChange={(e) => {
                 const newScale = parseFloat(e.target.value);
                 setScale(newScale);
                 if (newScale === 1) controls.start({ x: 0, y: 0 });
              }}
              className="w-24 accent-[#CC0000] cursor-pointer"
            />
            <span className="text-white/70 text-xs font-mono">4x</span>
            
          </div>
        </>
      )}
    </div>
  );
}

interface TravelogueViewProps {
  photos: PhotoItem[];
  travelogueData: TravelogueData;
  onBack?: () => void;
  onUpdate?: (newData: TravelogueData) => void;
  isPublicView?: boolean;
  userName?: string;
}

export default function TravelogueView({ photos, travelogueData, onBack, onUpdate, isPublicView = false, userName }: TravelogueViewProps) {
  const handleUpdate = (field: 'title' | 'subtitle' | 'chapterTitle' | 'chapterNarrative', value: string, chapterId?: string) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(travelogueData));
    if (field === 'title') newData.title = value;
    if (field === 'subtitle') newData.subtitle = value;
    if (chapterId) {
      const chapter = newData.chapters.find((c: any) => c.clusterId === chapterId);
      if (chapter) {
        if (field === 'chapterTitle') chapter.title = value;
        if (field === 'chapterNarrative') chapter.narrative = value;
      }
    }
    onUpdate(newData);
  };

  const editableStyle = !isPublicView 
    ? "focus:outline-none focus:ring-1 focus:ring-[#CC0000]/30 focus:bg-white/5 px-2 rounded-sm transition-all hover:bg-white/5 cursor-text"
    : "";

  const getThemeClass = (isEnabled = true) => {
    if (!isEnabled) return '';
    switch (travelogueData.theme) {
      case 'leica-monochrome': return 'grayscale contrast-[1.15] brightness-95';
      case 'portra-warm': return 'sepia-[.2] contrast-105 saturate-125 brightness-105 hue-rotate-[-10deg]';
      case 'classic-chrome': return 'contrast-110 saturate-[.6] hue-rotate-[15deg] brightness-95';
      default: return '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0A0A0A] text-[#f4f4f4] overflow-y-auto overflow-x-hidden w-full pb-32 font-sans selection:bg-neutral-800"
    >
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="sticky top-0 inset-x-0 z-50 p-6 md:px-12 flex justify-between items-center pointer-events-none mix-blend-difference"
      >
        {!isPublicView ? (
          <>
            <button 
              onClick={() => onBack?.()}
              className="pointer-events-auto text-white flex items-center gap-3 hover:opacity-70 transition-opacity font-serif italic text-lg"
            >
              <FiArrowLeft /> Return
            </button>
            {/* Publish Button (conditional) */}
            {!isPublicView && (
              <PublishButton 
                travelogueData={travelogueData} 
                photos={photos} 
              />
            )}
          </>
        ) : (
          <div className="w-full flex justify-end">
             {/* Logo or something else here if needed */}
          </div>
        )}
      </motion.header>

      {/* Editorial Title */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 mb-24 pt-24"
      >
        <p 
          contentEditable={!isPublicView}
          suppressContentEditableWarning
          onBlur={(e) => handleUpdate('subtitle', e.currentTarget.innerText)}
          className={`uppercase tracking-[0.4em] text-xs text-neutral-400 mb-8 font-light ${editableStyle}`}
        >
          {travelogueData.subtitle}
        </p>
        <h1 
          contentEditable={!isPublicView}
          suppressContentEditableWarning
          onBlur={(e) => handleUpdate('title', e.currentTarget.innerText)}
          className={`text-4xl sm:text-7xl md:text-8xl lg:text-[9rem] font-serif font-light tracking-tight leading-none mb-12 break-words overflow-hidden ${editableStyle}`}
        >
          {travelogueData.title}
        </h1>
        <div className="w-px h-24 bg-neutral-700 mb-8 animate-pulse" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#CC0000] font-bold border border-[#CC0000]/30 px-3 py-1 bg-[#111]">
          THEME: {travelogueData.theme.replace('-', ' ')}
        </p>
      </motion.div>

      {/* Editorial Flow */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col gap-32 md:gap-48 pb-32">
        {travelogueData.chapters.map((chapter: ChapterData) => {
          const { layoutStyle, title, narrative, photoIds, dateStr, location } = chapter;
          const chapterPhotos = photoIds.map((id: string) => photos.find(p => p.id === id)).filter(Boolean) as PhotoItem[];
          
          if (chapterPhotos.length === 0) return null;

          const displayDate = dateStr !== 'Unknown Date' ? format(parseISO(dateStr), 'MMMM do, yyyy') : 'Unknown Date';

          if (layoutStyle === 'hero-single') {
            const photo = chapterPhotos[0];
            return (
              <motion.div 
                key={chapter.clusterId}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center text-center relative"
              >
                <p className="uppercase tracking-[0.2em] text-xs text-neutral-500 mb-6 flex items-center justify-center gap-3">
                  {location && (
                    <>
                      <span className="text-[#CC0000] font-bold">{location}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    </>
                  )}
                  <span>{displayDate}</span>
                </p>
                <h2 
                  contentEditable={!isPublicView}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate('chapterTitle', e.currentTarget.innerText, chapter.clusterId)}
                  className={`text-4xl md:text-6xl font-serif mb-6 ${editableStyle}`}
                >
                  {title}
                </h2>
                <p 
                  contentEditable={!isPublicView}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdate('chapterNarrative', e.currentTarget.innerText, chapter.clusterId)}
                  className={`max-w-xl text-neutral-400 font-light leading-relaxed text-lg mx-auto mb-12 ${editableStyle}`}
                >
                  {narrative}
                </p>
                <div 
                  className={`w-full relative overflow-hidden rounded-sm group ${
                    (photo.width || 0) > (photo.height || 0) 
                      ? "aspect-[16/9] md:aspect-[21/9]" 
                      : "max-w-xl mx-auto aspect-[4/5] sm:aspect-[2/3]"
                  }`}
                >
                  <InteractivePhoto src={photo.preview} alt={title} themeClass={getThemeClass()} isPublicView={isPublicView} />
                </div>
              </motion.div>
            );
          }

          if (layoutStyle === 'diptych') {
            return (
              <div key={chapter.clusterId} className="w-full flex-col flex items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="text-center mb-12"
                >
                  <p className="uppercase tracking-[0.2em] text-xs text-neutral-500 mb-6 flex items-center justify-center gap-3">
                    {location && (
                      <>
                        <span className="text-[#CC0000] font-bold">{location}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      </>
                    )}
                    <span>{displayDate}</span>
                  </p>
                  <h2 
                    contentEditable={!isPublicView}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate('chapterTitle', e.currentTarget.innerText, chapter.clusterId)}
                    className={`text-3xl md:text-5xl font-serif mb-6 italic ${editableStyle}`}
                  >
                    {title}
                  </h2>
                  <p 
                    contentEditable={!isPublicView}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate('chapterNarrative', e.currentTarget.innerText, chapter.clusterId)}
                    className={`max-w-2xl text-neutral-400 font-light leading-relaxed text-lg mx-auto ${editableStyle}`}
                  >
                    {narrative}
                  </p>
                </motion.div>
                <div className="flex flex-col sm:flex-row w-full gap-4 md:gap-8 justify-center">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`w-full sm:w-1/2 overflow-hidden rounded-sm group relative bg-[#111] ${
                      (chapterPhotos[0]?.width || 0) > (chapterPhotos[0]?.height || 0) ? "aspect-[4/3] sm:aspect-video" : "aspect-[3/4]"
                    }`}
                  >
                    <InteractivePhoto src={chapterPhotos[0]?.preview} themeClass={getThemeClass()} isPublicView={isPublicView} />
                  </motion.div>
                  {chapterPhotos.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className={`w-full sm:w-1/2 sm:mt-16 overflow-hidden rounded-sm group relative bg-[#111] ${
                        (chapterPhotos[1]?.width || 0) > (chapterPhotos[1]?.height || 0) ? "aspect-[4/3] sm:aspect-video" : "aspect-[3/4]"
                      }`}
                    >
                      <InteractivePhoto src={chapterPhotos[1]?.preview} themeClass={getThemeClass()} isPublicView={isPublicView} />
                    </motion.div>
                  )}
                </div>
              </div>
            );
          }

          if (layoutStyle === 'mosaic' || layoutStyle === 'staggered') {
            return (
              <div key={chapter.clusterId} className="w-full flex flex-col items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="text-center mb-16"
                >
                  <p className="uppercase tracking-[0.2em] text-xs text-neutral-500 mb-6 flex items-center justify-center gap-3">
                    {location && (
                      <>
                        <span className="text-[#CC0000] font-bold">{location}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      </>
                    )}
                    <span>{displayDate}</span>
                  </p>
                  <h2 
                    contentEditable={!isPublicView}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate('chapterTitle', e.currentTarget.innerText, chapter.clusterId)}
                    className={`text-4xl md:text-6xl font-serif mb-6 ${editableStyle}`}
                  >
                    {title}
                  </h2>
                  <p 
                    contentEditable={!isPublicView}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdate('chapterNarrative', e.currentTarget.innerText, chapter.clusterId)}
                    className={`max-w-xl text-neutral-400 font-light leading-relaxed text-lg mx-auto ${editableStyle}`}
                  >
                    {narrative}
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 md:gap-8 w-full">
                  {chapterPhotos.map((photo, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: (i % 6) * 0.1 }}
                      key={photo.id} 
                      className={`w-full relative overflow-hidden group bg-[#111] ${i % 3 === 0 ? 'aspect-square sm:col-span-2' : 'aspect-[4/5] sm:col-span-1'} ${i > 8 ? 'hidden' : ''}`}
                    >
                      <InteractivePhoto src={photo.preview} themeClass={getThemeClass()} isPublicView={isPublicView} />
                    </motion.div>
                  ))}
                </div>
              </div>
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
        
        {/* Attribution: only at the very bottom of the document flow */}
        {isPublicView && (
          <div className="mt-16 flex flex-col items-center">
            <div className="h-px w-24 bg-white/10 mb-8" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">
              Created by {userName || "a Traveler"} @ Auto-Travelog
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
