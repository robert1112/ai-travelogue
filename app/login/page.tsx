"use client";

import { AuthModal } from "@/components/auth-modal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-[#CC0000] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AuthModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
