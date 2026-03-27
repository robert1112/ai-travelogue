import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const TravelogueSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  theme: z.enum(['leica-monochrome', 'portra-warm', 'classic-chrome']),
  chapters: z.array(z.object({
    clusterId: z.string().describe("MUST strictly match the Cluster ID provided in the photo metadata."),
    dateStr: z.string(),
    title: z.string(),
    narrative: z.string(),
    layoutStyle: z.enum(['hero-single', 'diptych', 'mosaic', 'staggered']),
    photoIds: z.array(z.string())
  }))
});

export async function POST(request: Request) {
  try {
    const { photos, language = 'en', clusterNotes = {}, clusterLocations = {}, globalPrompt = "" } = await request.json();

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY environment variable is not set.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const contentPayload: any[] = [
      {
        type: "text",
        text: "Analyze these photos from a journey. Read their composition, mood, and EXIF dates to craft an editorial travelogue matching my instructions exactly."
      }
    ];

    // Inject user-provided locations and notes for specific clusters to guide the AI storytelling
    // AND group photos by clusterId to enforce explicit sequence boundaries.
    
    // 1. Group photos by clusterId
    type PhotoRecord = { id: string; exif?: { date?: string }; base64?: string; clusterId?: string };
    const groupedPhotos = photos.reduce((acc: Record<string, PhotoRecord[]>, photo: PhotoRecord) => {
      const cid = photo.clusterId || 'uncategorized';
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(photo);
      return acc;
    }, {});

    // 2. Build the payload explicitly chunking by cluster boundaries
    const entries = Object.entries(groupedPhotos) as [string, PhotoRecord[]][];
    for (const [clusterId, clusterPhotos] of entries) {
      contentPayload.push({
        type: "text",
        text: `\n\n=== START OF CLUSTER: ${clusterId} ===`
      });

      const loc = clusterLocations[clusterId as string];
      const note = clusterNotes[clusterId as string];
      let contextStr = ``;
      if (loc && loc.trim() !== '') contextStr += `Location is "${loc}". `;
      if (note && note.trim() !== '') contextStr += `User Note: "${note}". `;

      if (contextStr) {
        contentPayload.push({
          type: "text",
          text: `Context for cluster ${clusterId}: ${contextStr}Please weave this naturally into the chapter title and narrative.`
        });
      }

      clusterPhotos.forEach((photo: PhotoRecord) => {
        contentPayload.push({
          type: "text",
          text: `[Photo ID: ${photo.id} | EXIF Date: ${photo.exif?.date || 'Unknown Date'}]`
        });

        if (photo.base64) {
          contentPayload.push({
            type: "image_url",
            image_url: {
              url: photo.base64,
              detail: "low"
            }
          });
        }
      });

      contentPayload.push({
        type: "text",
        text: `=== END OF CLUSTER: ${clusterId} ===\n\n`
      });
    }

    const outputLanguage = language === 'zh-TW' ? 'Traditional Chinese (zh-TW)' : 'English';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an award-winning travel editor and artistic director for an ultra-premium photography magazine. 
Your task is to analyze a set of user-provided photos from a journey, sequence them into chapters, apply a cinematic narrative, and determine the optimal layout for each chapter based on the photo content.

CRITICAL REQUIREMENT: Output your "title", "subtitle", "chapter titles", and "narrative" strictly in ${outputLanguage}.
Rules:
1. "title" & "subtitle": Provide an evocative, poetic title and subtitle for the entire journey. 
   CRITICAL: If the user provided a "Primary Master Directive" (detailed below), you MUST prioritize it to shape the title, choice of words, and overall cinematic mood. If the directive contains a specific title idea, use or adapt it.
2. "theme": Choose ONE overarching color grade for the entire journal: 'leica-monochrome' for moody/architectural, 'portra-warm' for sunny/vintage/human-centric, 'classic-chrome' for street/documentary/blue-hour.
3. "chapters": You MUST create exactly ONE chapter for EACH unique 'Cluster ID' provided in the photo metadata.
   - The photos assigned to a chapter MUST exactly match the photos that share that 'Cluster ID'. Do NOT mix, omit, or invent photos across different clusters.
   - Each chapter MUST have the exact 'clusterId', Date, an evocative Title, and a cinematic 1-2 sentence narrative inspired by gazing at the photos in that cluster. Use the Location, User Notes, and the Global Master Directive provided to shape this narrative.
4. "layoutStyle": Match the layout dynamically to the pacing and photo count. 
   - 'hero-single': ONLY assign if the chapter has exactly 1 photo (preferably a strong, impactful wide shot).
   - 'diptych': ONLY assign if the chapter has exactly 2 photos (preferably complement each other).
   - 'mosaic' or 'staggered': ONLY assign for chapters with 3 or more photos detailing a sequence of events.

=== PRIMARY MASTER DIRECTIVE ===
${globalPrompt || "No specific directive provided. Use your editorial judgment."}
================================`
        },
        {
          role: 'user',
          content: contentPayload
        }
      ],
      response_format: zodResponseFormat(TravelogueSchema, 'travelogue_response'),
      temperature: 0.7,
    });

    const travelogueContent = completion.choices[0]?.message?.content;

    if (!travelogueContent) {
      throw new Error("No content returned from AI.");
    }

    const travelogue = JSON.parse(travelogueContent);

    return NextResponse.json({ travelogue });
  } catch (error: any) {
    console.error("Travelogue Vision API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate travelogue' }, { status: 500 });
  }
}
