import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/travelogues - List user's travelogues
export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const travelogues = await prisma.travelogue.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        status: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ travelogues });
  } catch (error) {
    console.error("Failed to fetch travelogues:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/travelogues - Create/Save travelogue
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, subtitle, theme, data, status, thumbnail } = body;

    if (title === undefined || title === null) {
      return NextResponse.json({ error: "Title is missing" }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const travelogue = await prisma.travelogue.create({
      data: {
        title: title || "Untitled Memory", // Provide fallback
        subtitle: subtitle || "",
        theme: theme || "default",
        data,
        status: status || "DRAFT",
        thumbnail: thumbnail || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ travelogue });
  } catch (error: any) {
    console.error("Failed to create travelogue:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
