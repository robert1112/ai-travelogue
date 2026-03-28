import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface ScrapeResult {
  success: boolean;
  images?: string[];
  count?: number;
  error?: string;
}

async function scrapeInstagram(url: string): Promise<ScrapeResult> {
  const scriptPath = path.join(process.cwd(), 'scripts', 'instagram_scraper.py');
  const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python3');
  
  try {
    const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}" "${url}"`, {
      timeout: 30000, // 30 seconds
      maxBuffer: 10 * 1024 * 1024, // 10 MB
    });
    
    if (stderr) {
      console.warn('Instagram scraper stderr:', stderr);
    }
    
    const result = JSON.parse(stdout.trim()) as ScrapeResult;
    return result;
  } catch (error: any) {
    console.error('Instagram scraper execution error:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute scraper',
    };
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if it's an Instagram URL
    const isInstagram = url.includes('instagram.com');
    if (!isInstagram) {
      return NextResponse.json({ error: 'Only Instagram URLs are currently supported' }, { status: 400 });
    }

    const result = await scrapeInstagram(url);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to scrape Instagram' }, { status: 500 });
    }

    if (!result.images || result.images.length === 0) {
      return NextResponse.json({ error: 'No images found in the provided URL' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      images: result.images,
      count: result.count || result.images.length,
    });
  } catch (error: any) {
    console.error('Scrape social API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
