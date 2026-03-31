"use client";

import Link from "next/link";
import { FiMapPin } from "react-icons/fi";
import { AuthButton } from "./auth-button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5 z-50">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-[#CC0000] flex items-center justify-center">
            <FiMapPin className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-wide">AI Travelogue</span>
        </Link>
        
        <AuthButton />
      </div>
    </header>
  );
}
