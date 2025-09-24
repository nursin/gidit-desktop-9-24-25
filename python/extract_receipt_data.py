#!/usr/bin/env python3
"""
extract_receipt_data.py

Extract structured information from a scanned receipt.  This stub returns
an empty dictionary.  A complete implementation might combine OCR
results with regex parsing to pull out totals, vendors, dates, etc.
"""

import json
import sys

def extract(path: str):
    return {}


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else ''
    data = extract(path)
    print(json.dumps(data))


if __name__ == '__main__':
    main()