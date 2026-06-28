import { pipeline } from "@xenova/transformers";

type EmbeddingFn = (text: string) => Promise<number[]>;

let embedder: EmbeddingFn | null = null;
let loading = false;
let loadError: string | null = null;

async function loadEmbedder(): Promise<EmbeddingFn | null> {
  if (embedder) return embedder;
  if (loadError) return null;
  if (loading) return null;

  loading = true;
  try {
    const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    });
    embedder = async (text: string): Promise<number[]> => {
      const result = await pipe(text, {
        pooling: "mean",
        normalize: true,
      });
      return Array.from(result.data as Float32Array);
    };
    return embedder;
  } catch (err) {
    loadError = String(err);
    console.warn("Embedding model not available, using TF-IDF only:", loadError);
    return null;
  } finally {
    loading = false;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export async function getSemanticScores(
  query: string,
  chunks: string[]
): Promise<number[] | null> {
  const fn = await loadEmbedder();
  if (!fn) return null;

  const queryEmb = await fn(query);
  const chunkEmbs = await Promise.all(
    chunks.map((c) => fn(c.slice(0, 512)))
  );

  return chunkEmbs.map((emb) => cosineSimilarity(queryEmb, emb));
}
