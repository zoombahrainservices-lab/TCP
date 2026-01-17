"""
PDF to PNG converter using PyMuPDF (fitz)
Requires: pip install pymupdf pillow
"""

import sys
import os
import fitz  # PyMuPDF
from PIL import Image

def convert_pdf_to_images(pdf_path, output_dir, dpi=150):
    """Convert PDF pages to PNG images"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open PDF
    pdf_document = fitz.open(pdf_path)
    total_pages = len(pdf_document)
    
    print(f"Converting {total_pages} pages from {pdf_path}...")
    
    for page_num in range(total_pages):
        # Get page
        page = pdf_document[page_num]
        
        # Calculate zoom for desired DPI
        # Default is 72 DPI, so zoom = desired_dpi / 72
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        
        # Render page to pixmap with higher quality
        pix = page.get_pixmap(matrix=mat, alpha=False, colorspace=fitz.csRGB)
        
        # Save as PNG
        page_filename = f"page{str(page_num + 1).zfill(2)}.png"
        output_path = os.path.join(output_dir, page_filename)
        
        pix.save(output_path)
        print(f"  Saved: {page_filename} ({pix.width}x{pix.height}px)")
    
    pdf_document.close()
    print(f"\n✓ Conversion complete! {total_pages} images saved to {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_pdf_to_png.py <pdf_path> <output_dir> [dpi]")
        print("Example: python convert_pdf_to_png.py ./public/tcp-foundation-chapter1.pdf ./public/chapters/chapter01 150")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 150
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}")
        sys.exit(1)
    
    try:
        convert_pdf_to_images(pdf_path, output_dir, dpi)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
