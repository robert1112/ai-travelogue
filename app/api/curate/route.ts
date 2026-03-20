import { NextResponse } from 'next/server';

const REJECTION_REASONS = [
  "Blurry subject",
  "Poor lighting",
  "Near duplicate",
  "Eyes closed",
  "Out of focus",
  "Overexposed"
];

const DUMMY_PROSE = [
  { title: "Whispers of the Wind", text: "Finding solace in the quiet moments between destinations. The light hit just right.", layoutStyle: "hero" },
  { title: "Urban Rhythms", text: "The pulse of the city captured in a single frame. Concrete and glass stretching to the sky.", layoutStyle: "left" },
  { title: "Timeless Echoes", text: "Some places make you forget what year it is. A timeless intersection of nature and architecture.", layoutStyle: "right" },
  { title: "Golden Hour Magic", text: "That fleeting 15 minutes where everything turns into gold and shadows dance playfully.", layoutStyle: "hero" },
  { title: "Serendipity", text: "We didn't plan to be here. Sometimes the best views are the ones you never looked for.", layoutStyle: "quote" },
  { title: "The Quiet Escape", text: "Away from the crowds, away from the noise. Just pure, unadulterated serenity.", layoutStyle: "left" },
  { title: "Chasing Horizons", text: "No matter how far we walk, the horizon always seems just out of reach, calling us further.", layoutStyle: "right" }
];

export async function POST(request: Request) {
  try {
    const { photos } = await request.json();
    
    // Simulate API processing delay for analyzing images using Vision Model
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const curated: any[] = [];
    const rejected: any[] = [];

    photos.forEach((photo: any, index: number) => {
      // 30% chance to reject
      const isRejected = Math.random() < 0.3;
      
      // Feature: Attach Real EXIF metadata to the styling dummy prose!
      let metaString = "";
      if (photo.exif) {
        const { date, latitude, longitude } = photo.exif;
        if (latitude && longitude) metaString += ` [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`;
        if (date) metaString += ` • ${new Date(date).toLocaleDateString()}`;
      }
      
      if (isRejected) {
        rejected.push({
          id: photo.id,
          status: 'rejected',
          reason: REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)]
        });
      } else {
        const baseProse = DUMMY_PROSE[index % DUMMY_PROSE.length];
        curated.push({
          id: photo.id,
          status: 'curated',
          prose: {
            ...baseProse,
            text: `${baseProse.text} \n\n${metaString ? `📍 Metadata: ${metaString}` : ''}`
          }
        });
      }
    });

    return NextResponse.json({ success: true, curated, rejected });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process photos" }, { status: 500 });
  }
}
