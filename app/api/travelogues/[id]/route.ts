import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/travelogues/[id] - Get single travelogue (for internal use or preview)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const travelogue = await prisma.travelogue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!travelogue) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Only allow owner to see DRAFT or any user to see PUBLISHED
    if (travelogue.status !== "PUBLISHED" && travelogue.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ travelogue });
  } catch (error) {
    console.error("Failed to fetch travelogue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/travelogues/[id] - Update travelogue (status, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, subtitle, status, thumbnail, data } = body;

    // Verify ownership
    const existing = await prisma.travelogue.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.travelogue.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(status !== undefined && { status }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(data !== undefined && { data }),
      },
    });

    return NextResponse.json({ travelogue: updated });
  } catch (error) {
    console.error("Failed to update travelogue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/travelogues/[id] - Delete travelogue
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`DELETE request for travelogue ID: ${id} from user: ${session.user.id}`);
    
    // Verify ownership
    const existing = await prisma.travelogue.findUnique({
      where: { id },
      select: { userId: true },
    });
 
    if (!existing) {
      console.warn(`Travelogue with ID ${id} not found for deletion`);
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }
 
    if (existing.userId !== session.user.id) {
      console.warn(`User ${session.user.id} attempted to delete travelogue ${id} owned by ${existing.userId}`);
      return NextResponse.json({ error: "You don't have permission to delete this memory" }, { status: 403 });
    }
 
    await prisma.travelogue.delete({
      where: { id },
    });
 
    console.log(`Successfully deleted travelogue: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete travelogue:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
