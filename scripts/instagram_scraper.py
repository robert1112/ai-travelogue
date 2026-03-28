#!/usr/bin/env python3
"""
Instagram media downloader using instaloader.
Downloads all images/videos from an Instagram post and returns them as base64.
"""

import sys
import json
import tempfile
import base64
from pathlib import Path

def download_media(post_url: str) -> list:
    """Download all media from an Instagram post and return list of base64 data URIs."""
    import instaloader
    
    # Create a temporary directory
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Downloading media to {tmpdir}", file=sys.stderr)
        
        # Initialize instaloader with minimal options
        loader = instaloader.Instaloader(
            dirname_pattern=tmpdir,
            download_videos=False,  # We only want images
            download_comments=False,
            download_geotags=False,
            download_pictures=True,
            download_video_thumbnails=False,
            compress_json=False,
            post_metadata_txt_pattern='',
        )
        
        try:
            # Extract shortcode from URL
            if '/p/' in post_url:
                shortcode = post_url.split('/p/')[1].split('/')[0].split('?')[0]
            else:
                raise ValueError("Invalid Instagram post URL. Must contain '/p/'.")
            
            print(f"Downloading post {shortcode}", file=sys.stderr)
            post = instaloader.Post.from_shortcode(loader.context, shortcode)
            
            # Download all pictures
            loader.download_post(post, target=tmpdir)
            
        except Exception as e:
            print(f"Error downloading post: {e}", file=sys.stderr)
            raise
    
        # Collect all image files while directory still exists
        media_files = []
        tmpdir_path = Path(tmpdir)
        
        # Look for jpg, jpeg, png, webp files
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
            for file_path in tmpdir_path.glob(ext):
                try:
                    with open(file_path, 'rb') as f:
                        data = f.read()
                    mime_type = 'image/jpeg' if ext in ['*.jpg', '*.jpeg'] else 'image/png' if ext == '*.png' else 'image/webp'
                    b64 = base64.b64encode(data).decode('utf-8')
                    data_uri = f"data:{mime_type};base64,{b64}"
                    media_files.append(data_uri)
                except Exception as e:
                    print(f"Error reading {file_path}: {e}", file=sys.stderr)
        
        # If no images found, check for any image file
        if not media_files:
            for file_path in tmpdir_path.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                    try:
                        with open(file_path, 'rb') as f:
                            data = f.read()
                        mime_type = 'image/jpeg' if file_path.suffix.lower() in ['.jpg', '.jpeg'] else 'image/png'
                        b64 = base64.b64encode(data).decode('utf-8')
                        data_uri = f"data:{mime_type};base64,{b64}"
                        media_files.append(data_uri)
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        
        return media_files

def main():
    if len(sys.argv) != 2:
        print("Usage: python instagram_scraper.py <instagram_url>", file=sys.stderr)
        sys.exit(1)
    
    post_url = sys.argv[1]
    
    try:
        media = download_media(post_url)
        if not media:
            print("No images found in the post.", file=sys.stderr)
            sys.exit(1)
        
        # Output JSON array to stdout
        result = {
            "success": True,
            "images": media,
            "count": len(media)
        }
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
