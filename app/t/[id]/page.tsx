import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TravelogueView from "@/components/TravelogueView";
import { auth } from "@/lib/auth";
import Link from "next/link";

interface PublicTraveloguePageProps {
  params: { id: string };
}

export default async function PublicTraveloguePage({ params }: PublicTraveloguePageProps) {
  const { id } = await params;

  const travelogue = await prisma.travelogue.findUnique({
    where: { 
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!travelogue) {
    notFound();
  }

  // Security check: Only allow viewing if PUBLISHED OR if the current user is the owner
  const session = await auth();
  const isOwner = session?.user?.id === travelogue.userId;

  if (travelogue.status !== "PUBLISHED" && !isOwner) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 py-1 px-3 mb-8 border border-[#CC0000]/30 text-[#CC0000]" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" /> AI Travelog · Leica Aesthetic
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#E8E2D9] mb-4 italic tracking-tight">Access Restricted.</h1>
          <p className="text-neutral-500 max-w-md mx-auto font-light leading-relaxed">This travelogue is currently marked as a <span className="text-[#CC0000] font-mono uppercase text-[10px] font-bold">Draft</span> and hasn't been shared by the curator yet.</p>
        </div>
        <div className="h-px w-24 bg-white/10 mb-8" />
        <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[#CC0000] transition-colors font-bold">Return to Library</Link>
      </main>
    );
  }

  // Convert Prisma data to TravelogueData format expected by TravelogueView
  const travelogueData = {
    title: travelogue.title,
    subtitle: travelogue.subtitle || "",
    theme: travelogue.theme,
    chapters: (travelogue.data as any).chapters || [],
  };

  // The TravelogueView component uses photos from local state in the home page.
  // For the public view, we need to extract photos from the stored data.
  // The data structure stores photo metadata and cluster info.
  
  // Note: We need a way to pass photos to TravelogueView. 
  // In the current implementation, TravelogueView takes `photos: PhotoItem[]`.
  // We need to construct these PhotoItem objects from the stored data.
  const photos = (travelogue.data as any).photos || [];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <TravelogueView 
        photos={photos} 
        travelogueData={travelogueData} 
        isPublicView={true} 
      />
      
      {/* Small credit footer for public view */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[101] pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
          Created by {travelogue.user.name || "a Traveler"} @ Auto-Travelog
        </p>
      </div>
    </div>
  );
}
