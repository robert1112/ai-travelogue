import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import TravelogueEditor from "@/components/TravelogueEditor";

interface EditTraveloguePageProps {
  params: { id: string };
}

export default async function EditTraveloguePage({ params }: EditTraveloguePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const travelogue = await prisma.travelogue.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      data: true,
      status: true,
    }
  });

  if (!travelogue) {
    notFound();
  }

  // Security check: Only the owner can edit
  if (travelogue.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#E8E2D9]">
      <TravelogueEditor 
        initialData={travelogue.data} 
        initialDraftId={travelogue.id} 
      />
    </main>
  );
}
