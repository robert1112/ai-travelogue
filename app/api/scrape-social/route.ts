import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface InstagramImage {
  url: string;
  width?: number;
  height?: number;
}

async function extractInstagramImages(postUrl: string): Promise<InstagramImage[]> {
  try {
    // Fetch the Instagram page HTML
    const response = await axios.get(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Try to extract JSON data from script tags
    let jsonData: any = null;

    // Method 1: window._sharedData
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('window._sharedData')) {
        const match = scriptContent.match(/window\._sharedData\s*=\s*({[\s\S]*?});/);
        if (match) {
          try {
            jsonData = JSON.parse(match[1]);
          } catch (e) {
            // ignore parse error
          }
        }
      }
    });

    // Method 2: window.__additionalDataLoaded
    if (!jsonData) {
      $('script').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent && scriptContent.includes('window.__additionalDataLoaded')) {
          const match = scriptContent.match(/window\.__additionalDataLoaded\s*\(\s*['"][^'"]*['"],\s*({[\s\S]*?)\s*\);/);
          if (match) {
            try {
              jsonData = JSON.parse(match[1]);
            } catch (e) {
              // ignore parse error
            }
          }
        }
      });
    }

    // Method 3: look for JSON in script tags with type="application/json"
    if (!jsonData) {
      $('script[type="application/json"]').each((index, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          try {
            const data = JSON.parse(scriptContent);
            if (data && data.shortcode_media) {
              jsonData = data;
            }
          } catch (e) {
            // ignore
          }
        }
      });
    }

    const images: InstagramImage[] = [];

    if (jsonData) {
      // Navigate to the media data
      let media = null;

      if (jsonData.shortcode_media) {
        media = jsonData.shortcode_media;
      } else if (jsonData.graphql && jsonData.graphql.shortcode_media) {
        media = jsonData.graphql.shortcode_media;
      } else if (jsonData.data && jsonData.data.shortcode_media) {
        media = jsonData.data.shortcode_media;
      }

      if (media) {
        // Check if it's a carousel (multiple images)
        if (media.carousel_media && Array.isArray(media.carousel_media)) {
          media.carousel_media.forEach((item: any) => {
            if (item.display_url) {
              images.push({
                url: item.display_url,
                width: item.dimensions?.width,
                height: item.dimensions?.height,
              });
            }
          });
        } else if (media.display_url) {
          // Single image
          images.push({
            url: media.display_url,
            width: media.dimensions?.width,
            height: media.dimensions?.height,
          });
        }
      }
    }

    // Fallback: try to extract og:image meta tags
    if (images.length === 0) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        images.push({ url: ogImage });
      }
    }

    // Fallback: extract all img tags with instagram CDN domain
    if (images.length === 0) {
      $('img').each((index, element) => {
        const src = $(element).attr('src');
        if (src && src.includes('instagram')) {
          // Filter out small images (likely icons)
          const width = parseInt($(element).attr('width') || '0', 10);
          const height = parseInt($(element).attr('height') || '0', 10);
          if (width > 100 && height > 100) {
            images.push({ url: src, width, height });
          }
        }
      });
    }

    // Deduplicate by URL
    const uniqueImages = Array.from(new Map(images.map(img => [img.url, img])).values());
    return uniqueImages.slice(0, 20); // Limit to 20 images
  } catch (error: any) {
    console.error('Error extracting Instagram images:', error.message);
    throw new Error(`Failed to extract images from Instagram: ${error.message}`);
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

    const images = await extractInstagramImages(url);

    if (images.length === 0) {
      return NextResponse.json({ error: 'No images found in the provided URL' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      images: images.map(img => img.url),
      count: images.length 
    });
  } catch (error: any) {
    console.error('Scrape social API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
