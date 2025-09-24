/**
 * Stubbed ChromaDB client.  In production this module would connect to a
 * local Chroma server (possibly running via Python) to store and query
 * embeddings.  For development we return static values.
 */
export async function insertEmbedding(key, _vector, _metadata = {}) {
    // TODO: implement insertion into ChromaDB
    console.log('Inserting embedding', key);
}
export async function queryEmbedding(_vector, _topK = 5) {
    // TODO: implement nearest neighbour search in ChromaDB
    return [];
}
