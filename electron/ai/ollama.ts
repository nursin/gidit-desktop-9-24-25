/**
 * Stub functions for interacting with the Ollama local API.  In a full
 * implementation you would spawn the Ollama binary with appropriate
 * arguments and parse its output.  Here we return dummy values so that
 * the app can run without a local model.
 */

export async function generate(prompt: string): Promise<string> {
  // TODO: spawn Ollama with the gemma model and return the generated text
  return `Generated response for: ${prompt}`;
}

export async function embedText(_text: string): Promise<number[]> {
  // TODO: call Ollama to generate embeddings for the provided text
  return [];
}

export async function search(_query: string): Promise<unknown[]> {
  // TODO: search the vector database using the query embedding
  return [];
}
