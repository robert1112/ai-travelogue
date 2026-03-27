"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiUser, FiLogOut, FiChevronDown, FiBookOpen, FiSettings } from "react-icons/fi";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
        >
          <div className="h-7 w-7 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/20 overflow-hidden flex items-center justify-center text-[#CC0000]">
            {session.user.image ? (
              <Image 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                width={28} 
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="h-3.5 w-3.5" />
            )}
          </div>
          {/* Name label removed for minimal UI as requested */}
          <FiChevronDown className={`h-3 w-3 text-neutral-500 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-56 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden z-[100]"
            >
              <div className="px-4 py-3 border-b border-white/5 mb-1">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">Signed in as</p>
                <p className="text-xs text-white truncate font-medium">{session.user.email}</p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors group"
              >
                <FiBookOpen className="h-4 w-4 group-hover:text-[#CC0000] transition-colors" />
                <span>My Memory Book</span>
              </Link>

              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 cursor-not-allowed rounded-xl transition-colors group"
              >
                <FiSettings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center justify-center px-4 py-2 border border-white/10 text-[11px] font-bold uppercase tracking-widest rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
    >
      Sign In
    </Link>
  );
}
