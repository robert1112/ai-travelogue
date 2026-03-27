"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiX, FiCheckCircle } from "react-icons/fi";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [mounted, setMounted] = useState(false);

  // Ensure portal is only used on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      await signIn("nodemailer", { email, redirect: false });
      setStatus("sent");
    } catch (error) {
      console.error("Auth error:", error);
      setStatus("idle");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <>
      {/* Backdrop — rendered directly on document.body via portal */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <div
          className="pointer-events-auto relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-8 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors p-1"
          >
            <FiX className="h-5 w-5" />
          </button>

          {status === "sent" ? (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="h-14 w-14 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
                <FiCheckCircle className="h-7 w-7 text-[#CC0000]" />
              </div>
              <h3 className="text-xl font-serif text-white">Check your inbox</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                We sent a magic link to{" "}
                <span className="text-white font-medium">{email}</span>.
                Click the link to sign in and publish your travelogue.
              </p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-neutral-500 hover:text-white transition-colors underline"
              >
                Back to preview
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <p className="text-[#CC0000] text-[10px] uppercase tracking-[0.3em] font-bold mb-3">
                  Publish Travelogue
                </p>
                <h2 className="text-2xl font-serif text-white leading-snug">
                  Sign in to share
                  <br />
                  your journey
                </h2>
                <p className="mt-2 text-neutral-400 text-sm">
                  New here? Just enter your email — we&apos;ll create your account
                  automatically.
                </p>
              </div>

              {/* Google */}
              <button 
                onClick={handleGoogleSignIn}
                disabled={true}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white opacity-50 cursor-not-allowed mb-5"
              >
                <FcGoogle className="h-5 w-5" />
                Continue with Google (Disabled)
              </button>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#111] text-neutral-600 uppercase tracking-widest">
                    or
                  </span>
                </div>
              </div>

              {/* Email Magic Link */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#CC0000]/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 bg-[#CC0000] hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {status === "sending" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>

              <p className="mt-5 text-[11px] text-center text-neutral-600 leading-relaxed">
                By continuing, you agree to our Terms of Service.
                <br />
                No password needed — just click the link in your email.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
