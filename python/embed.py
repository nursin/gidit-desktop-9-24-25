#!/usr/bin/env python3
"""
embed.py

Generate embeddings for a given piece of text.  This stub
implementation simply outputs a dummy vector.  In a real
implementation you would call an embedding model and return
the numerical vector.
"""

import sys
import json

def embed(text: str):
    # Return a fixed vector for demonstration purposes
    return [0.0] * 768


def main():
    text = sys.argv[1] if len(sys.argv) > 1 else ''
    vec = embed(text)
    print(json.dumps(vec))


if __name__ == '__main__':
    main()