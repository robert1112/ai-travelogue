"use client";

import { motion } from "framer-motion";
import { FiImage, FiZap, FiShare2 } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-6">
          GSD Sandbox Testing
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
          Relive Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Adventures.
          </span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload hundreds of unedited travel photos and let AI curate, optimize, and assemble them into a stunning, animated, and shareable web-based travelogue.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-foreground text-background px-8 py-4 font-bold shadow-lg hover:shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all mb-16"
        >
          Start Your Journey
        </motion.button>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-4">
              <FiImage className="text-xl" />
            </div>
            <h3 className="font-bold mb-2">Batch Upload</h3>
            <p className="text-sm text-neutral-500">Drop 500+ photos at once. We handle the heavy lifting without crashing.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-4">
              <FiZap className="text-xl" />
            </div>
            <h3 className="font-bold mb-2">AI Curation</h3>
            <p className="text-sm text-neutral-500">Smart algorithms filter duplicates and pick the very best shots.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-4">
              <FiShare2 className="text-xl" />
            </div>
            <h3 className="font-bold mb-2">Instant Share</h3>
            <p className="text-sm text-neutral-500">Generate a beautiful animated link to share with friends and family.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
