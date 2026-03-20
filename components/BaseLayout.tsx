import React from 'react';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/20 bg-background/60 backdrop-blur-md dark:border-neutral-800/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tighter">Auto-Travelog</span>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            <a href="#" className="hover:text-foreground transition-colors">Examples</a>
            <a href="#" className="hover:text-foreground transition-colors">How it works</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
