"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FiPlus, 
  FiClock, 
  FiShare2, 
  FiTrash2, 
  FiExternalLink, 
  FiLock,
  FiMoreVertical,
  FiBook,
  FiEdit3,
  FiGlobe
} from "react-icons/fi";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

interface Travelogue {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [travelogues, setTravelogues] = useState<Travelogue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      fetchTravelogues();
    }
  }, [sessionStatus, router]);

  const fetchTravelogues = async () => {
    try {
      const res = await fetch("/api/travelogues");
      const data = await res.json();
      if (data.travelogues) {
        setTravelogues(data.travelogues);
      }
    } catch (error) {
      console.error("Failed to fetch travelogues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this memory?")) return;

    try {
      console.log(`Attempting to delete travelogue: ${id}`);
      const res = await fetch(`/api/travelogues/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setTravelogues(prev => prev.filter(t => t.id !== id));
      } else {
        const errorData = await res.json();
        console.error("Delete failed on server:", errorData);
        alert(`Failed to delete: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete network error:", error);
      alert("Network error. Could not delete memory.");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    try {
      const res = await fetch(`/api/travelogues/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTravelogues(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-[#CC0000] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-[#CC0000] rounded flex items-center justify-center group-hover:scale-110 transition-transform">
               <FiBook className="text-white" />
             </div>
             <span className="font-serif italic text-xl tracking-tight">Auto-Travelog</span>
          </Link>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[#CC0000] text-[10px] uppercase tracking-[0.4em] font-bold mb-3">
              Personal Archive
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight">
              Collectors of <br />
              <span className="italic">Fleeting Moments</span>
            </h1>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#CC0000] hover:text-white transition-all shadow-xl"
          >
            <FiPlus /> Create New Journal
          </Link>
        </div>

        {travelogues.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <FiBook className="w-12 h-12 text-neutral-600 mb-6" />
            <h3 className="text-xl font-serif text-neutral-400 mb-2">No memories archived yet</h3>
            <p className="text-neutral-600 mb-8 max-w-xs text-center">Start your first journey and generate an editorial travelogue to see it here.</p>
            <Link href="/" className="text-[#CC0000] font-bold uppercase tracking-widest text-xs border-b border-[#CC0000]">
              Begin your journey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {travelogues.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div 
                   className="relative aspect-[4/5] bg-neutral-900 rounded-lg overflow-hidden border border-white/10 group-hover:border-[#CC0000]/50 transition-all duration-500 shadow-2xl"
                >
                  {/* Thumbnail */}
                  {log.thumbnail ? (
                    <img 
                      src={log.thumbnail} 
                      alt={log.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111] to-[#222]">
                      <FiBook className="w-12 h-12 text-neutral-800" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-30">
                    <Link
                      href={`/t/${log.id}/edit`}
                      className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-[#CC0000] transition-all"
                      title="Edit Travelogue"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={(e) => toggleStatus(log.id, log.status, e)}
                      className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 text-white transition-all ${log.status === 'PUBLISHED' ? 'bg-[#CC0000] hover:bg-neutral-800' : 'bg-white/10 hover:bg-[#CC0000]'}`}
                      title={log.status === 'PUBLISHED' ? 'Make Private (Draft)' : 'Publish to Public'}
                    >
                      {log.status === 'PUBLISHED' ? <FiLock className="w-4 h-4" /> : <FiGlobe className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(log.id, e)}
                      className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-red-600 transition-all"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm ${log.status === 'PUBLISHED' ? 'bg-[#CC0000]/20 text-[#CC0000] border border-[#CC0000]/30' : 'bg-white/10 text-neutral-400 border border-white/10'}`}>
                        {log.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase font-medium tracking-wider">
                        <FiClock className="w-3 h-3" />
                        {format(new Date(log.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#CC0000] transition-colors">{log.title}</h2>
                    <p className="text-sm text-neutral-400 font-light line-clamp-1 italic">{log.subtitle || "Exploring the unknown"}</p>
                  </div>

                  {/* Open Link */}
                  <Link 
                    href={`/t/${log.id}`}
                    target="_blank"
                    className="absolute inset-0 z-10"
                  />
                  
                  <div className="absolute bottom-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl transform hover:scale-110 active:scale-90 transition-transform">
                      <FiExternalLink className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>
                
                {/* Share Link display (if published) */}
                {log.status === 'PUBLISHED' && (
                  <div className="mt-4 flex items-center justify-between px-2">
                    <span className="text-[10px] text-neutral-600 font-mono truncate max-w-[180px]">
                      {typeof window !== 'undefined' ? `${window.location.host}/t/${log.id}` : ''}
                    </span>
                    <button 
                      onClick={() => {
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                        const url = `${baseUrl}/t/${log.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Public link copied to clipboard!");
                      }}
                      className="flex items-center gap-1.5 text-[10px] text-[#CC0000] uppercase font-bold tracking-widest hover:opacity-70 transition-opacity"
                    >
                      <FiShare2 className="w-3 h-3" />
                      Copy Link
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
      {/* Decorative footer */}
      <footer className="py-24 flex flex-col items-center justify-center opacity-20 pointer-events-none">
        <div className="w-px h-12 bg-white mb-6" />
        <span className="text-[10px] uppercase font-bold tracking-[0.5em]">The Eternal Archive</span>
      </footer>
    </div>
  );
}
