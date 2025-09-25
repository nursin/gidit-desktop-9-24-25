"use strict";
/**
 * Stubbed ChromaDB client.  In production this module would connect to a
 * local Chroma server (possibly running via Python) to store and query
 * embeddings.  For development we return static values.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEmbedding = insertEmbedding;
exports.queryEmbedding = queryEmbedding;
async function insertEmbedding(key, _vector, _metadata = {}) {
    // TODO: implement insertion into ChromaDB
    console.log('Inserting embedding', key);
}
async function queryEmbedding(_vector, _topK = 5) {
    // TODO: implement nearest neighbour search in ChromaDB
    return [];
}
