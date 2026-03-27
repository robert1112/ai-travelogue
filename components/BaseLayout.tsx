import React from 'react';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E2D9]">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
