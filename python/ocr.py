#!/usr/bin/env python3
"""
ocr.py

Perform optical character recognition on an image.  This stub simply
prints a fixed string.  A real implementation would call into
pytesseract.image_to_string or another OCR engine.
"""

import sys

def ocr(image_path: str) -> str:
    return "[OCR output placeholder]"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else ''
    text = ocr(path)
    print(text)


if __name__ == '__main__':
    main()