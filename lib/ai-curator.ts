export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status?: 'curated' | 'rejected';
  reason?: string;
}

export interface CurationResult {
  curated: PhotoItem[];
  rejected: PhotoItem[];
}

const REJECTION_REASONS = [
  "Looks a bit blurry",
  "Similar to another photo",
  "Underexposed",
  "Eyes closed",
  "Bad composition"
];

export async function simulateAICuration(photos: PhotoItem[]): Promise<CurationResult> {
  // Simulate network/AI delay based on number of photos (min 3 seconds, max 8 seconds)
  const delayMs = Math.min(Math.max(photos.length * 200, 3000), 8000);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const curated: PhotoItem[] = [];
      const rejected: PhotoItem[] = [];
      
      for (const p of photos) {
        // Randomly reject ~30% for simulation
        if (Math.random() < 0.3) {
          rejected.push({
            ...p,
            status: 'rejected',
            reason: REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)]
          });
        } else {
          curated.push({
            ...p,
            status: 'curated'
          });
        }
      }
      resolve({ curated, rejected });
    }, delayMs);
  });
}
