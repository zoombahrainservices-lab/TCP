"""
PDF to PNG converter using pdf2image (requires poppler)
Alternative approach that may handle the PDF better
"""

import sys
import os

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("Error: pdf2image not installed")
    print("Install with: pip install pdf2image")
    print("\nNote: This also requires poppler-utils:")
    print("  Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/")
    sys.exit(1)

def convert_pdf_to_images_pdf2image(pdf_path, output_dir, dpi=200):
    """Convert PDF pages to PNG images using pdf2image"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Converting PDF: {pdf_path}")
    print(f"Output directory: {output_dir}")
    print(f"DPI: {dpi}")
    print()
    
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=dpi)
        total_pages = len(images)
        
        print(f"Found {total_pages} pages")
        
        for i, image in enumerate(images):
            page_num = i + 1
            page_filename = f"page{str(page_num).zfill(2)}.png"
            output_path = os.path.join(output_dir, page_filename)
            
            # Save as PNG
            image.save(output_path, 'PNG', optimize=True)
            
            file_size_kb = os.path.getsize(output_path) / 1024
            print(f"  Saved: {page_filename} ({image.width}x{image.height}px, {file_size_kb:.1f} KB)")
        
        print(f"\nSuccess! {total_pages} images saved to {output_dir}")
        
    except Exception as e:
        print(f"Error during conversion: {e}")
        raise

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_pdf_pdf2image.py <pdf_path> <output_dir> [dpi]")
        print("Example: python convert_pdf_pdf2image.py ./public/tcp-foundation-chapter1.pdf ./public/chapters/chapter01 200")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 200
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}")
        sys.exit(1)
    
    convert_pdf_to_images_pdf2image(pdf_path, output_dir, dpi)
