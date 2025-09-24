/**
 * Stubbed ChromaDB client.  In production this module would connect to a
 * local Chroma server (possibly running via Python) to store and query
 * embeddings.  For development we return static values.
 */

export async function insertEmbedding(key: string, _vector: number[], _metadata: Record<string, unknown> = {}): Promise<void> {
  // TODO: implement insertion into ChromaDB
  console.log('Inserting embedding', key);
}

export async function queryEmbedding(_vector: number[], _topK: number = 5): Promise<unknown[]> {
  // TODO: implement nearest neighbour search in ChromaDB
  return [];
}
