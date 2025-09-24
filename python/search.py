#!/usr/bin/env python3
"""
search.py

Perform a nearest neighbour search for a given query vector in the
ChromaDB.  This stub implementation always returns an empty list.
"""

import json
import sys

def search(vec):
    # Return an empty list to indicate no results
    return []


def main():
    if len(sys.argv) > 1:
        vec = json.loads(sys.argv[1])
    else:
        vec = []
    results = search(vec)
    print(json.dumps(results))


if __name__ == '__main__':
    main()