"use client";

import TravelogueEditor from "@/components/TravelogueEditor";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#E8E2D9]">
      <Header />
      <div className="pt-16">
        <TravelogueEditor />
      </div>
    </main>
  );
}
