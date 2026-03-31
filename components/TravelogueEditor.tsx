"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiShare2, FiClock, FiAperture, FiCheck, FiTrash2, FiArrowLeft, FiChevronLeft, FiChevronRight, FiX, FiExternalLink, FiLock } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import PhotoUploader from "@/components/PhotoUploader";
import TravelogueView from "@/components/TravelogueView";
import { PhotoItem } from "@/lib/ai-curator";
import exifr from "exifr";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AuthButton } from "@/components/auth-button";
import { useSession } from "next-auth/react";
import { useDroppable } from "@dnd-kit/core";

// Types
export interface ChapterData {
  clusterId: string;
  location?: string;
  dateStr: string;
  title: string;
  narrative: string;
  layoutStyle: 'hero-single' | 'diptych' | 'mosaic' | 'staggered';
  photoIds: string[];
}

export interface TimelineCluster {
  id: string;
  dateStr: string;
  timeRangeStr: string;
  photos: PhotoItem[];
}

export interface TravelogueData {
  title: string;
  subtitle: string;
  theme: string;
  chapters: ChapterData[];
}

type CurationStep = 'idle' | 'processingPhotos' | 'lightTable' | 'previewLoading';
type ViewMode = 'curation' | 'travelogue';
type TravelogueLanguage = 'zh-TW' | 'en';

// Sub-components
const SortablePhotoCard = ({ 
  photo, 
  isSelected, 
  onToggle, 
  onClick,
  onDelete, 
  isDraggable = true,
  isPartOfDragGroup = false 
}: { 
  photo: PhotoItem, 
  isSelected: boolean, 
  onToggle: (id: string, e: any) => void, 
  onClick: (id: string) => void,
  onDelete: (id: string) => void,
  isDraggable?: boolean,
  isPartOfDragGroup?: boolean
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id });

  const shouldDim = isDragging || isPartOfDragGroup;
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : 1,
    opacity: shouldDim ? 0.3 : 1,
    filter: shouldDim ? 'grayscale(0.5)' : 'none',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className="relative group w-full cursor-grab active:cursor-grabbing"
    >
      <motion.div 
        layoutId={`photo-container-${photo.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => !isDragging && onClick(photo.id)}
        className={`relative aspect-square overflow-hidden border transition-all cursor-zoom-in shadow-sm ${shouldDim ? 'border-dashed border-[#CC0000]/60' : isSelected ? 'border-[#CC0000] ring-1 ring-[#CC0000]' : 'border-white/10'}`}
      >
        <img 
          src={photo.preview} 
          alt="photo preview" 
          draggable={false} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Actions */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
          className="absolute top-1.5 right-1.5 z-40 w-5 h-5 rounded flex items-center justify-center bg-black/40 border-[1.5px] border-white/40 text-white/60 hover:bg-[#CC0000] hover:border-[#CC0000] hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <FiTrash2 className="text-[9px]" />
        </div>

        {isDraggable && (
          <div className="absolute bottom-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
            <MdDragIndicator className="text-white text-sm drop-shadow" />
          </div>
        )}

        {photo.exif?.date && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[8px] text-white/80 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <FiClock /> {format(parseISO(photo.exif.date), "HH:mm")}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const NewSceneDroppable = ({ id, label, className }: { id: string, label: string, className?: string }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className} flex items-center justify-center transition-all border-2 border-dashed rounded ${isOver ? 'bg-[#CC0000]/20 border-[#CC0000] scale-[1.01]' : 'bg-[#CC0000]/5 border-[#CC0000]/30 hover:bg-[#CC0000]/10 hover:border-[#CC0000]/50'}`}>
      <span className="text-[#CC0000] tracking-widest text-[10px] sm:text-xs uppercase font-bold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{label}</span>
    </div>
  );
};

export interface TravelogueEditorProps {
  initialData?: any;
  initialDraftId?: string;
}

export default function TravelogueEditor({ initialData, initialDraftId }: TravelogueEditorProps) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  
  // States
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [curationStep, setCurationStep] = useState<CurationStep>('idle');
  const [processingStats, setProcessingStats] = useState({ current: 0, total: 0 });
  const [viewMode, setViewMode] = useState<ViewMode>('curation');
  const [travelogueData, setTravelogueData] = useState<TravelogueData | null>(null);
  const [language, setLanguage] = useState<TravelogueLanguage>('zh-TW');
  const [clusterNotes, setClusterNotes] = useState<Record<string, string>>({});
  const [clusterLocations, setClusterLocations] = useState<Record<string, string>>({});
  const [globalPrompt, setGlobalPrompt] = useState<string>('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState<string | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(initialDraftId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [lastProcessedState, setLastProcessedState] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [pendingPhotoIds, setPendingPhotoIds] = useState<string[]>([]);
  const [targetSceneInfo, setTargetSceneInfo] = useState<{ clusterId: string; position: 'before' | 'after' } | null>(null);
  const [modalDate, setModalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [modalTime, setModalTime] = useState(format(new Date(), 'HH:mm'));

  // Initialize from initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.photos) setPhotos(initialData.photos);
      if (initialData.clusterNotes) setClusterNotes(initialData.clusterNotes);
      if (initialData.clusterLocations) setClusterLocations(initialData.clusterLocations);
      if (initialData.globalPrompt) setGlobalPrompt(initialData.globalPrompt);
      if (initialData.language) setLanguage(initialData.language);
      
      // If we have photos, jump to lightTable
      if (initialData.photos && initialData.photos.length > 0) {
        setCurationStep('lightTable');
      }
    }
  }, [initialData]);

  // Logic: Clustered Photos
  const clusteredPhotos = useMemo(() => {
    const uncategorized: PhotoItem[] = [];
    const withDate: PhotoItem[] = [];

    photos.forEach(photo => {
      if (photo.exif && photo.exif.date) withDate.push(photo);
      else uncategorized.push(photo);
    });

    withDate.sort((a, b) => new Date(a.exif!.date!).getTime() - new Date(b.exif!.date!).getTime());

    const clusters: TimelineCluster[] = [];
    let currentCluster: TimelineCluster | null = null;
    const TIME_THRESHOLD = 3 * 60 * 60 * 1000;

    for (const photo of withDate) {
      const photoTime = new Date(photo.exif!.date!).getTime();
      const photoDateStr = format(photoTime, "yyyy-MM-dd");
      
      if (!currentCluster) {
        currentCluster = { id: `cluster_${photoTime}`, dateStr: photoDateStr, timeRangeStr: format(photoTime, "HH:mm"), photos: [photo] };
        clusters.push(currentCluster);
      } else {
        const lastPhotoTime = new Date(currentCluster.photos[currentCluster.photos.length - 1].exif!.date!).getTime();
        const isDifferentDay = format(photoTime, "yyyy-MM-dd") !== currentCluster.dateStr;
        const prevSceneId = currentCluster.photos[currentCluster.photos.length - 1].customSceneId;
        
        if (photoTime - lastPhotoTime > TIME_THRESHOLD || isDifferentDay || photo.customSceneId !== prevSceneId) {
          if (currentCluster.photos.length > 1) currentCluster.timeRangeStr += ` - ${format(lastPhotoTime, "HH:mm")}`;
          currentCluster = { id: `cluster_${photoTime}`, dateStr: photoDateStr, timeRangeStr: format(photoTime, "HH:mm"), photos: [photo] };
          clusters.push(currentCluster);
        } else {
          currentCluster.photos.push(photo);
        }
      }
    }

    if (currentCluster && currentCluster.photos.length > 1) {
      const lastPhotoTime = new Date(currentCluster.photos[currentCluster.photos.length - 1].exif!.date!).getTime();
      currentCluster.timeRangeStr += ` - ${format(lastPhotoTime, "HH:mm")}`;
    }

    return { clusters, uncategorized };
  }, [photos]);

  // Logic: Handlers
  const handleFilesSelected = async (files: File[]) => {
    if (!files.length) return;
    setCurationStep('processingPhotos');
    setProcessingStats({ current: 0, total: files.length });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newPhotos: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let exifData = null;
      try {
        const output = await exifr.parse(file, { gps: true, tiff: true, exif: true });
        if (output) exifData = { latitude: output.latitude || null, longitude: output.longitude || null, date: output.DateTimeOriginal?.toISOString() || output.CreateDate?.toISOString() || null };
      } catch (e) {}

      let displayBlob: Blob | File = file;
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const heic2any = (await import('heic2any')).default;
          const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
          displayBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch (e) { console.error("HEIC conversion failed", e); }
      }

      const img = new Image();
      const imgPromise = new Promise<{w: number, h: number}>((resolve) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
      });
      img.src = URL.createObjectURL(displayBlob);
      const { w, h } = await imgPromise;

      const photoId = Math.random().toString(36).substring(7);
      const photo: PhotoItem = { id: photoId, file, preview: img.src, included: true, exif: exifData, width: w, height: h, isUploading: true };
      newPhotos.push(photo);
      
      // Background upload to Supabase
      if (session?.user?.id) {
        const userId = session.user.id;
        (async () => {
          try {
            const fileName = `${userId}/${Date.now()}-${photoId}.jpg`;
            const { error } = await supabase.storage
              .from('travelogues')
              .upload(fileName, displayBlob, {
                contentType: 'image/jpeg',
                upsert: true
              });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
              .from('travelogues')
              .getPublicUrl(fileName);

            // Update photo in state with public URL
            setPhotos(prev => prev.map(p => 
              p.id === photoId ? { ...p, preview: publicUrl, isUploading: false } : p
            ));
          } catch (err) {
            console.error("Background upload failed for", photoId, err);
            setPhotos(prev => prev.map(p => 
              p.id === photoId ? { ...p, isUploading: false } : p
            ));
          }
        })();
      } else {
        // If not logged in, just clear uploading state (will upload later on publish)
        photo.isUploading = false;
      }

      setProcessingStats({ current: i + 1, total: files.length });
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const SCENE_TIME_THRESHOLD = 2 * 60 * 60 * 1000;
    const withDate = newPhotos.filter(p => p.exif?.date).sort((a, b) => new Date(a.exif!.date!).getTime() - new Date(b.exif!.date!).getTime());
    let currentSceneId = "scene_" + Math.random().toString(36).substring(7);
    let lastTime: number | null = null;

    for (const photo of withDate) {
      const photoTime = new Date(photo.exif!.date!).getTime();
      if (lastTime !== null && photoTime - lastTime > SCENE_TIME_THRESHOLD) currentSceneId = "scene_" + Math.random().toString(36).substring(7);
      photo.customSceneId = currentSceneId;
      lastTime = photoTime;
    }

    setPhotos((prev) => {
      const uniqueNewPhotos = newPhotos.filter(np => !prev.some(p => p.file && p.file.name === np.file?.name && p.file.lastModified === np.file?.lastModified));
      return [...prev, ...uniqueNewPhotos];
    });
    setCurationStep('lightTable');
  };

  const deleteSinglePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setSelectedPhotoIds(prev => prev.filter(pid => pid !== id));
  };

  const togglePhotoSelection = (id: string, e: any) => {
    e.stopPropagation();
    const isShift = e.shiftKey;
    setSelectedPhotoIds(prev => {
      if (isShift && lastSelectedId) {
        const allOrderedPhotos = [...clusteredPhotos.clusters.flatMap(c => c.photos), ...clusteredPhotos.uncategorized];
        const lastIdx = allOrderedPhotos.findIndex(p => p.id === lastSelectedId);
        const currIdx = allOrderedPhotos.findIndex(p => p.id === id);
        if (lastIdx !== -1 && currIdx !== -1) {
          const start = Math.min(lastIdx, currIdx);
          const end = Math.max(lastIdx, currIdx);
          return Array.from(new Set([...prev, ...allOrderedPhotos.slice(start, end + 1).map(p => p.id)]));
        }
      }
      setLastSelectedId(id);
      return prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
    });
  };

  // Auto-save Effect
  useEffect(() => {
    const autoSave = async () => {
      if (authStatus !== "authenticated" || !session?.user?.id || clusteredPhotos.clusters.length === 0) return;
      setIsSaving(true);
      try {
        const payload = {
          title: travelogueData?.title || "New Journey",
          subtitle: travelogueData?.subtitle || "",
          theme: travelogueData?.theme || "default",
          status: "DRAFT",
          data: { photos: photos.map(p => ({ id: p.id, preview: p.preview, exif: p.exif })), clusteredPhotos, clusterNotes, clusterLocations, globalPrompt, language }
        };

        if (activeDraftId) {
          await fetch(`/api/travelogues/${activeDraftId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        } else {
          const res = await fetch('/api/travelogues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const data = await res.json();
          if (data.travelogue?.id) {
            setActiveDraftId(data.travelogue.id);
            // Update URL to the edit page for this draft
            router.push(`/t/${data.travelogue.id}/edit`, { scroll: false });
          }
        }
      } catch (error) { console.error("Auto-save failed:", error); }
      finally { setIsSaving(false); }
    };
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [clusteredPhotos, clusterNotes, clusterLocations, globalPrompt, language, authStatus, session?.user?.id]);

  const blobToBase64 = async (blobUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 512;
        let { width, height } = img;
        if (width > height) { if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; } }
        else { if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No canvas context'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = blobUrl;
    });
  };

  const processPreviewJournal = async () => {
    setCurationStep('previewLoading');
    try {
      const orderedPhotos = [
        ...clusteredPhotos.clusters.flatMap(c => c.photos.map(p => ({ p, clusterId: c.id }))),
        ...clusteredPhotos.uncategorized.map(p => ({ p, clusterId: 'uncategorized' }))
      ];
      const currentStateSnapshot = JSON.stringify({ photoIds: orderedPhotos.map(item => item.p.id), clusterIds: orderedPhotos.map(item => item.clusterId), language, clusterNotes, clusterLocations, globalPrompt });
      if (travelogueData && lastProcessedState === currentStateSnapshot) { setViewMode('travelogue'); setCurationStep('lightTable'); return; }

      const payloadPhotos = await Promise.all(orderedPhotos.map(async ({ p, clusterId }) => ({ id: p.id, exif: p.exif, clusterId, base64: await blobToBase64(p.preview) })));
      const res = await fetch('/api/travelogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photos: payloadPhotos, language, clusterNotes, clusterLocations, globalPrompt }) });
      if (!res.ok) throw new Error('Failed to generate travelogue');
      const data = await res.json();
      const travelogue = data.travelogue;
      if (travelogue?.chapters) travelogue.chapters.forEach((chapter: any) => { chapter.id = chapter.clusterId; chapter.location = clusterLocations[chapter.clusterId] || ''; });
      setTravelogueData(travelogue); setLastProcessedState(currentStateSnapshot); setViewMode('travelogue');
    } catch (error: any) { alert(error.message || "Failed to generate preview."); }
    finally { setCurationStep('lightTable'); }
  };

  const allOrderedPhotos = useMemo(() => [...clusteredPhotos.clusters.flatMap(c => c.photos), ...clusteredPhotos.uncategorized], [clusteredPhotos]);
  const lightboxPhoto = useMemo(() => photos.find(p => p.id === activeLightboxPhotoId), [photos, activeLightboxPhotoId]);

  const navigateLightbox = (direction: 'next' | 'prev') => {
    const currentIndex = allOrderedPhotos.findIndex(p => p.id === activeLightboxPhotoId);
    if (currentIndex === -1) return;
    if (direction === 'next' && currentIndex < allOrderedPhotos.length - 1) setActiveLightboxPhotoId(allOrderedPhotos[currentIndex + 1].id);
    else if (direction === 'prev' && currentIndex > 0) setActiveLightboxPhotoId(allOrderedPhotos[currentIndex - 1].id);
  };

  // dnd-kit logic
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragStart = (event: DragStartEvent) => { setActiveDragId(event.active.id as string); };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('new-scene-')) {
      const parts = overId.split('-');
      const position = parts[parts.length - 1] as 'before' | 'after';
      const clusterId = parts.slice(2, -1).join('-');
      const idsToMove = selectedPhotoIds.includes(activeId) && selectedPhotoIds.length > 1 ? selectedPhotoIds : [activeId];
      
      const draggedPhotos = photos.filter(p => idsToMove.includes(p.id));
      const hasDate = draggedPhotos.some(p => p.exif?.date);
      const targetCluster = clusterId !== "NEW" ? clusteredPhotos.clusters.find(c => c.id === clusterId) : null;
      const targetHasDate = targetCluster && targetCluster.photos.length > 0 && targetCluster.photos.some(p => p.exif?.date);

      if (!hasDate || !targetHasDate) {
        if (clusteredPhotos.clusters.length === 0) {
          const uniqueSceneId = "scene_" + Math.random().toString(36).substring(7);
          const newDateIso = new Date().toISOString();
          setPhotos(prev => prev.map(p => idsToMove.includes(p.id) ? { ...p, customSceneId: uniqueSceneId, exif: { ...(p.exif || { latitude: null, longitude: null }), date: newDateIso } } : p));
          return;
        }

        setPendingPhotoIds(idsToMove);
        setTargetSceneInfo({ clusterId, position });
        setShowDateModal(true);
        return;
      }

      const uniqueSceneId = "scene_" + Math.random().toString(36).substring(7);
      let newDateIso = new Date().toISOString();
      if (targetCluster) {
        if (targetCluster.photos.length > 0) {
          const sortedPhotos = photos.filter(p => p.exif?.date && p.id !== activeId).sort((a,b) => new Date(a.exif!.date!).getTime() - new Date(b.exif!.date!).getTime());
          if (position === 'before') {
             const firstDate = new Date(targetCluster.photos[0].exif!.date!).getTime();
             const sortedIdx = sortedPhotos.findIndex(p => p.id === targetCluster.photos[0].id);
             const prevDate = sortedIdx > 0 ? new Date(sortedPhotos[sortedIdx-1].exif!.date!).getTime() : firstDate - 20 * 60000;
             newDateIso = new Date(prevDate + (firstDate - prevDate)/2).toISOString();
          } else {
             const lastDate = new Date(targetCluster.photos[targetCluster.photos.length-1].exif!.date!).getTime();
             const sortedIdx = sortedPhotos.findIndex(p => p.id === targetCluster.photos[targetCluster.photos.length-1].id);
             const nextDate = sortedIdx >= 0 && sortedIdx < sortedPhotos.length -1 ? new Date(sortedPhotos[sortedIdx+1].exif!.date!).getTime() : lastDate + 20 * 60000;
             newDateIso = new Date(lastDate + (nextDate - lastDate)/2).toISOString();
          }
        }
      }
      setPhotos(prev => prev.map(p => idsToMove.includes(p.id) ? { ...p, customSceneId: uniqueSceneId, exif: { ...(p.exif || { latitude: null, longitude: null }), date: newDateIso } } : p));
      return;
    }

    if (activeId === overId) return;
    const isMultiDrag = selectedPhotoIds.includes(activeId) && selectedPhotoIds.length > 1;
    setPhotos((items) => {
      const overIndex = items.findIndex((i) => i.id === overId);
      const targetPhoto = items[overIndex];
      if (isMultiDrag) {
        const selectedSet = new Set(selectedPhotoIds);
        const remaining = items.filter(p => !selectedSet.has(p.id));
        const selected = selectedPhotoIds.map(id => items.find(p => p.id === id)).filter(Boolean) as typeof items;
        const insertAt = remaining.findIndex(p => p.id === overId);
        const insertIndex = insertAt === -1 ? remaining.length : insertAt;
        const updatedSelected = selected.map(p => ({ ...p, customSceneId: targetPhoto.customSceneId, exif: { ...p.exif!, date: targetPhoto.exif?.date ?? p.exif?.date ?? null } }));
        return [...remaining.slice(0, insertIndex), ...updatedSelected, ...remaining.slice(insertIndex)];
      } else {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const updatedItems = arrayMove(items, oldIndex, overIndex);
        return updatedItems.map((p) => p.id === activeId ? { ...p, customSceneId: targetPhoto.customSceneId, exif: { ...p.exif!, date: targetPhoto.exif?.date ?? p.exif?.date ?? null } } : p);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, clusterId: string, targetIndex: number) => {
    e.preventDefault(); e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain"); if (!id) return;
    const photoToUpdate = photos.find(p => p.id === id); if (!photoToUpdate) return;
    let newDateIso = new Date().toISOString(); let targetSceneId: string | undefined = undefined;
    if (clusterId !== "NEW") {
      const cluster = clusteredPhotos.clusters.find(c => c.id === clusterId);
      if (cluster) {
        targetSceneId = cluster.photos[0]?.customSceneId;
        const group = cluster.photos;
        const sorted = photos.filter(p => p.exif?.date && p.id !== id).sort((a,b) => new Date(a.exif!.date!).getTime() - new Date(b.exif!.date!).getTime());
        if (targetIndex <= 0 && group.length > 0) {
           const firstDate = new Date(group[0].exif!.date!).getTime();
           const sortedIdx = sorted.findIndex(p => p.id === group[0].id);
           const prevDate = sortedIdx > 0 ? new Date(sorted[sortedIdx-1].exif!.date!).getTime() : firstDate - 20 * 60000;
           newDateIso = new Date(prevDate + (firstDate - prevDate)/2).toISOString();
        } else if (targetIndex >= group.length && group.length > 0) {
           const lastDate = new Date(group[group.length-1].exif!.date!).getTime();
           const sortedIdx = sorted.findIndex(p => p.id === group[group.length-1].id);
           const nextDate = sortedIdx >= 0 && sortedIdx < sorted.length - 1 ? new Date(sorted[sortedIdx+1].exif!.date!).getTime() : lastDate + 20 * 60000;
           newDateIso = new Date(lastDate + (nextDate - lastDate)/2).toISOString();
        } else if (group.length > 0) {
           const pDate = new Date(group[targetIndex-1].exif!.date!).getTime();
           const nDate = new Date(group[targetIndex].exif!.date!).getTime();
           newDateIso = new Date(pDate + (nDate - pDate)/2).toISOString();
        }
      }
    }
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, customSceneId: targetSceneId, exif: { ...(p.exif || { latitude: null, longitude: null }), date: newDateIso } } : p));
  };

  const activePhoto = useMemo(() => photos.find(p => p.id === activeDragId), [photos, activeDragId]);
  const dragOverlayIsMulti = !!activeDragId && selectedPhotoIds.includes(activeDragId) && selectedPhotoIds.length > 1;
  const dragOverlayGhosts = dragOverlayIsMulti ? selectedPhotoIds.filter(id => id !== activeDragId).slice(0, 2).map(id => photos.find(p => p.id === id)).filter((p): p is PhotoItem => !!p) : [];

  const applyDateToPhotos = (dateStr: string, timeStr: string) => {
    if (!targetSceneInfo || pendingPhotoIds.length === 0) return;
    const newDateIso = new Date(`${dateStr}T${timeStr}`).toISOString();
    const uniqueSceneId = "scene_" + Math.random().toString(36).substring(7);
    setPhotos(prev => prev.map(p => pendingPhotoIds.includes(p.id) ? { ...p, customSceneId: uniqueSceneId, exif: { ...(p.exif || { latitude: null, longitude: null }), date: newDateIso } } : p));
    setShowDateModal(false);
    setPendingPhotoIds([]);
    setTargetSceneInfo(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-start min-h-[80vh] text-center pt-8 w-full">
        {photos.length === 0 && curationStep === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full px-4">
            <span className="inline-flex items-center gap-2 py-1 px-3 mb-8 border border-[#CC0000]/30 text-[#CC0000]" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" /> AI Travelog · Est. 2025
            </span>
            <h1 className="mb-6" style={{ fontFamily: '"EB Garamond", Georgia, serif', fontWeight: 400 }}>
              <span className="block text-5xl sm:text-7xl text-[#E8E2D9] leading-none tracking-tight">Your Travels.</span>
              <span className="block text-5xl sm:text-7xl italic text-[#444444] leading-none tracking-tight mt-1">Beautifully Archived.</span>
            </h1>
            <PhotoUploader onFilesSelected={handleFilesSelected} />
          </motion.div>
        )}

        {(photos.length > 0 || curationStep === 'processingPhotos') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-4 pb-16 relative px-4">
            {curationStep === 'previewLoading' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 max-w-7xl mx-auto text-center">
                <FiAperture className="text-[#CC0000] text-4xl mb-4 animate-spin" style={{ animationDuration: '3s' }} />
                <p className="text-[#CC0000] uppercase tracking-[0.3em] font-mono text-[10px]">Processing</p>
                <p className="text-[#E8E2D9] text-base font-light tracking-wide">AI evaluating aesthetics, chapters & cinematic layout</p>
              </div>
            ) : curationStep === 'processingPhotos' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 max-w-7xl mx-auto text-center">
                <FiAperture className="text-[#CC0000] text-4xl mb-4 animate-spin" style={{ animationDuration: '2s' }} />
                <p className="text-[#E8E2D9] text-base font-light tracking-wide">{processingStats.current} / {processingStats.total} frames processed...</p>
              </div>
            ) : curationStep === 'lightTable' ? (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-10 w-full gap-4 max-w-7xl mx-auto border-b border-white/10 pb-6">
                <div className="flex-1 text-left hidden sm:flex items-center gap-4">
                  <button onClick={() => { setCurationStep('idle'); setPhotos([]); if (activeDraftId) router.push('/'); }} className="text-neutral-400 hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs font-bold"><FiArrowLeft /> Return</button>
                  <p className="text-[#E8E2D9] border-l border-white/20 pl-4 h-4 flex items-center font-mono text-[0.75rem]"><span className="text-[#CC0000] font-bold mr-1">{photos.length}</span> frames selected</p>
                </div>
                <div className="flex-1 flex items-center justify-center font-bold tracking-widest uppercase text-[#E8E2D9] font-mono" style={{ letterSpacing: '0.2em' }}>LIGHT TABLE {isSaving && <span className="ml-4 text-[8px] text-[#CC0000] animate-pulse">Syncing...</span>}</div>
                <div className="flex-1 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center bg-white/10 p-0.5 rounded-sm"><button onClick={() => setLanguage('zh-TW')} className={`px-3 py-1.5 text-[10px] uppercase font-bold ${language === 'zh-TW' ? 'bg-[#CC0000] text-white' : 'text-neutral-400'}`}>中</button><button onClick={() => setLanguage('en')} className={`px-3 py-1.5 text-[10px] uppercase font-bold ${language === 'en' ? 'bg-[#CC0000] text-white' : 'text-neutral-400'}`}>EN</button></div>
                    <button className="text-white border border-white/20 px-4 py-2 text-[10px] md:text-xs font-bold" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.multiple = true; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files; if (f) handleFilesSelected(Array.from(f)); }; input.click(); }}>+ Frames</button>
                    <button onClick={processPreviewJournal} className="px-6 py-2.5 bg-[#CC0000] text-white uppercase tracking-widest text-xs font-bold">Preview</button>
                    <div className="h-8 w-px bg-white/10 hidden sm:block" /><AuthButton />
                  </div>
                </div>
              </div>
            ) : null}

            {curationStep === 'lightTable' && (
              <div className="relative max-w-7xl mx-auto text-left">
                <div className="flex flex-col min-h-[calc(100vh-200px)]">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-20 px-2">
                    <div className="flex items-center gap-2 mb-4"><div className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" /><span className="text-[#CC0000] uppercase tracking-[0.3em] font-bold text-[10px] font-mono">Primary Master Directive</span></div>
                    <textarea placeholder="Define core mood..." value={globalPrompt} onChange={(e) => setGlobalPrompt(e.target.value)} rows={2} className="w-full bg-transparent border-none p-0 text-white/90 focus:ring-0 resize-none text-xl md:text-2xl font-serif italic" />
                  </motion.div>
                  <div className="space-y-16 flex-1 pb-16">
                    {activeDragId && (
                      <div className="py-4 bg-[#0D0D0D]/50 -mx-4 px-4 mb-4">
                        <NewSceneDroppable id="new-scene-NEW-before" label="▲ Drop here to create new scene" className="w-full h-12 border-2" />
                      </div>
                    )}
                    {clusteredPhotos.clusters.map((cluster, clusterIndex) => (
                      <div key={cluster.id} className={`relative p-4 rounded-xl ${activeDragId ? 'bg-white/[0.02] border border-dashed border-white/10' : ''}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, cluster.id, cluster.photos.length)}>
                        {activeDragId && clusterIndex === 0 && <NewSceneDroppable id={`new-scene-${cluster.id}-before`} label="▲ New scene above" className="w-full h-9 mb-4" />}
                        <div className="sticky top-[56px] z-20 mb-6 flex items-center gap-4"><div className="flex items-center gap-2 bg-[#0D0D0D] border border-white/10 px-4 py-2"><div className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" /><span className="font-mono text-[0.65rem] uppercase text-[#E8E2D9]">{format(parseISO(cluster.dateStr), "dd MMM yyyy")} <span className="text-[#CC0000] ml-2">{cluster.timeRangeStr}</span></span></div><div className="h-px bg-gradient-to-r from-[#CC0000]/40 to-transparent flex-1" /></div>
                        <div className="flex flex-wrap gap-2 sm:gap-4"><SortableContext items={cluster.photos.map(p => p.id)} strategy={rectSortingStrategy}>{cluster.photos.map(photo => <div key={photo.id} className="w-32 sm:w-40 xl:w-48"><SortablePhotoCard photo={photo} isSelected={selectedPhotoIds.includes(photo.id)} onToggle={togglePhotoSelection} onClick={setActiveLightboxPhotoId} onDelete={deleteSinglePhoto} /></div>)}</SortableContext></div>
                        <div className="mt-6 border-l-2 border-[#CC0000]/50 pl-4 flex flex-col sm:flex-row gap-4">
                          <input placeholder="Location..." value={clusterLocations[cluster.id] || ''} onChange={(e) => setClusterLocations(prev => ({ ...prev, [cluster.id]: e.target.value }))} className="bg-transparent border-b border-white/20 px-0 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] font-mono" />
                          <input placeholder="Memories..." value={clusterNotes[cluster.id] || ''} onChange={(e) => setClusterNotes(prev => ({ ...prev, [cluster.id]: e.target.value }))} className="flex-1 bg-transparent border-b border-white/20 px-0 py-2 text-sm text-white focus:outline-none focus:border-[#CC0000] font-mono" />
                        </div>
                        {activeDragId && <NewSceneDroppable id={`new-scene-${cluster.id}-after`} label="▼ New scene below" className="w-full h-9 mt-4" />}
                      </div>
                    ))}
                  </div>
                  {clusteredPhotos.uncategorized.length > 0 && (
                    <>
                      {clusteredPhotos.clusters.length > 0 && activeDragId && clusteredPhotos.uncategorized.some(p => p.id === activeDragId) && (
                        <div className="py-8 bg-[#0D0D0D]/50 -mx-4 px-4 mb-4">
                          <NewSceneDroppable id="new-scene-NEW-after" label="▼ Drop here to create new scene" className="w-full h-12 border-2" />
                        </div>
                      )}
                      <motion.div layout className={`bg-[#0D0D0D]/95 border-t border-[#CC0000]/30 pt-4 pb-4 px-4 -mx-4 ${activeDragId ? 'relative' : 'sticky bottom-0'} z-30`}>
                         <div className="flex justify-between items-center mb-4"><h3 className="text-[#CC0000] font-bold font-mono text-[0.75rem] uppercase">No Date Metadata</h3><button onClick={() => setPhotos(prev => prev.filter(p => p.exif?.date))} className="text-[#888] text-[0.65rem] uppercase font-mono">Clear All</button></div>
                         <div className="flex gap-4 overflow-x-auto pb-4"><SortableContext items={clusteredPhotos.uncategorized.map(p => p.id)} strategy={rectSortingStrategy}>{clusteredPhotos.uncategorized.map(photo => <div key={photo.id} className="w-24 flex-shrink-0"><SortablePhotoCard photo={photo} isSelected={selectedPhotoIds.includes(photo.id)} onToggle={togglePhotoSelection} onClick={setActiveLightboxPhotoId} onDelete={deleteSinglePhoto} /></div>)}</SortableContext></div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeLightboxPhotoId && lightboxPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setActiveLightboxPhotoId(null)}>
            <motion.div className="relative max-w-5xl flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
              <img src={lightboxPhoto.preview} className="max-w-full max-h-[75vh] object-contain rounded-sm" alt="lightbox" />
              <div className="text-[#CC0000] font-mono text-[0.7rem]">{format(parseISO(lightboxPhoto.exif?.date || new Date().toISOString()), "dd MMM yyyy · HH:mm")}</div>
              <button onClick={() => setActiveLightboxPhotoId(null)} className="absolute top-[-40px] right-0 text-white/60 p-2"><FiX size={24} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => { setShowDateModal(false); setPendingPhotoIds([]); setTargetSceneInfo(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" />
                <span className="text-[#CC0000] uppercase tracking-[0.3em] font-bold text-[10px] font-mono">Set Date & Time</span>
              </div>
              <p className="text-white/60 text-sm mb-6">These photos have no date metadata. Please set the date to create a new scene.</p>
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <label className="text-white/40 text-[10px] uppercase font-bold tracking-wider block mb-2">Date</label>
                  <input type="date" value={modalDate} onChange={(e) => setModalDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CC0000]" />
                </div>
                <div className="flex-1">
                  <label className="text-white/40 text-[10px] uppercase font-bold tracking-wider block mb-2">Time</label>
                  <input type="time" value={modalTime} onChange={(e) => setModalTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CC0000]" />
                </div>
              </div>
              {pendingPhotoIds.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {pendingPhotoIds.map(id => {
                    const photo = photos.find(p => p.id === id);
                    if (!photo) return null;
                    return (
                      <div key={id} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => applyDateToPhotos(modalDate, modalTime)} className="w-full py-3 bg-[#CC0000] text-white uppercase tracking-widest text-xs font-bold rounded-lg hover:bg-[#CC0000]/90 transition-colors">
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPhotoIds.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] bg-[#1A1A1A] border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 backdrop-blur-xl">
            <div className="pr-4 border-r border-white/10 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#CC0000] text-white text-[10px] flex items-center justify-center font-bold">{selectedPhotoIds.length}</span><span className="text-white/90 text-[10px] uppercase font-mono">Selected</span></div>
            <button onClick={() => { if(window.confirm('Delete selected?')) { setPhotos(prev => prev.filter(p => !selectedPhotoIds.includes(p.id))); setSelectedPhotoIds([]); } }} className="text-white/60 hover:text-[#CC0000] uppercase text-[10px] font-mono"><FiTrash2 className="inline mr-1" /> Delete</button>
            <button onClick={() => setSelectedPhotoIds([])} className="text-white/60 hover:text-white uppercase text-[10px] font-mono"><FiX className="inline mr-1" /> Deselect</button>
          </motion.div>
        )}
      </AnimatePresence>

      <DragOverlay dropAnimation={null}>
        {activeDragId && activePhoto ? (
          <div style={{ width: 144, height: 144, overflow: 'hidden', border: '2px solid white', boxShadow: '0 20px 50px rgba(0,0,0,0.75)', background: '#111' }}>
            <img src={activePhoto.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : null}
      </DragOverlay>

      <AnimatePresence>
        {viewMode === 'travelogue' && travelogueData && (
          <TravelogueView photos={photos} travelogueData={travelogueData} onBack={() => setViewMode('curation')} onUpdate={setTravelogueData} />
        )}
      </AnimatePresence>
    </DndContext>
  );
}
