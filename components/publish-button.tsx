"use client";

import { useState } from "react";
import { FiShare2, FiCheckCircle } from "react-icons/fi";
import { AuthModal } from "@/components/auth-modal";
import { useSession } from "next-auth/react";
import { PhotoItem } from "@/lib/ai-curator";
import { TravelogueData } from "@/components/TravelogueEditor";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PublishButtonProps {
  travelogueData?: TravelogueData;
  photos?: PhotoItem[];
}

export function PublishButton({ travelogueData, photos }: PublishButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "publishing" | "published">("idle");
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const generateThumbnail = async (): Promise<string | null> => {
    if (!photos || photos.length === 0) return null;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let w = img.width;
        let h = img.height;
        
        if (w > h) {
          if (w > MAX_DIM) {
            h *= MAX_DIM / w;
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w *= MAX_DIM / h;
            h = MAX_DIM;
          }
        }
        
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = photos[0].preview;
    });
  };

  const uploadPhoto = async (photo: PhotoItem, userId: string): Promise<string | null> => {
    // If it's already a public URL, no need to upload
    if (photo.preview.startsWith('http')) {
      return photo.preview;
    }

    try {
      const response = await fetch(photo.preview);
      const blob = await response.blob();
      const fileName = `${userId}/${Date.now()}-${photo.id}.jpg`;
      
      const { error } = await supabase.storage
        .from('travelogues')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('travelogues')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error for photo:", photo.id, error);
      return null;
    }
  };

  const handlePublish = async () => {
    if (!session?.user?.id) {
      setShowAuthModal(true);
      return;
    }

    if (!travelogueData || !photos) return;

    setStatus("uploading");
    setUploadProgress({ current: 0, total: photos.length });

    try {
      // 1. Upload all photos to Supabase Storage
      const uploadedPhotos = [];
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress({ current: i + 1, total: photos.length });
        const photo = photos[i];
        const publicUrl = await uploadPhoto(photo, session.user.id);
        
        if (publicUrl) {
          uploadedPhotos.push({
            ...photo,
            preview: publicUrl // Replace blob URL with public URL
          });
        } else {
          // Fallback to blob if upload fails (though it will 404 for others)
          uploadedPhotos.push(photo);
        }
      }

      setStatus("publishing");
      
      const thumbnail = await generateThumbnail();
      
      const res = await fetch("/api/travelogues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: travelogueData.title,
          subtitle: travelogueData.subtitle,
          theme: travelogueData.theme,
          status: "PUBLISHED",
          thumbnail,
          data: {
            chapters: travelogueData.chapters,
            photos: uploadedPhotos.map(p => ({
              id: p.id,
              preview: p.preview,
              width: p.width,
              height: p.height,
              exif: p.exif
            }))
          }
        }),
      });

      if (res.ok) {
        setStatus("published");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : (errorData.error || `Error: ${res.status}`);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Publish error:", error);
      setStatus("idle");
      alert(error.message || "Failed to publish your travelogue. Please try again.");
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="h-8 w-24 bg-white/5 animate-pulse rounded-md" />
    );
  }

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={status !== "idle" || !travelogueData}
        className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-2xl ${
          status === "published" 
            ? "bg-green-600 text-white" 
            : status !== "idle"
            ? "bg-neutral-800 text-neutral-500 cursor-wait"
            : "bg-[#CC0000] text-white hover:bg-red-700 active:scale-95"
        }`}
      >
        {status === "published" ? (
          <>
            <FiCheckCircle className="w-5 h-5" />
            Published!
          </>
        ) : status === "publishing" ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Scribbling...
          </>
        ) : status === "uploading" ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Storing Photos ({uploadProgress.current}/{uploadProgress.total})...
          </>
        ) : (
          <>
            <FiShare2 className="w-5 h-5" />
            Publish Record
          </>
        )}
      </button>

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </>
  );
}
