"use strict";
/**
 * Stub functions for interacting with the Ollama local API.  In a full
 * implementation you would spawn the Ollama binary with appropriate
 * arguments and parse its output.  Here we return dummy values so that
 * the app can run without a local model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
exports.embedText = embedText;
exports.search = search;
async function generate(prompt) {
    // TODO: spawn Ollama with the gemma model and return the generated text
    return `Generated response for: ${prompt}`;
}
async function embedText(_text) {
    // TODO: call Ollama to generate embeddings for the provided text
    return [];
}
async function search(_query) {
    // TODO: search the vector database using the query embedding
    return [];
}
