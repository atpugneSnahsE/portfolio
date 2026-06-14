import fs from "fs";
import path from "path";

const chatbotDir = path.join(
  process.cwd(),
  "src",
  "chatbot"
);

type KnowledgeChunk = {
  filename: string;
  content: string;
};

export function loadKnowledgeBase(): KnowledgeChunk[] {
  try {
    const files = fs
      .readdirSync(chatbotDir)
      .filter((file) =>
        file.endsWith(".md")
      );

    return files.map((file) => ({
      filename: file,
      content: fs.readFileSync(
        path.join(chatbotDir, file),
        "utf-8"
      ),
    }));
  } catch (error) {
    console.error(
      "Failed loading chatbot knowledge:",
      error
    );

    return [];
  }
}

export function getRelevantContext(
  query: string
) {
  const knowledge =
    loadKnowledgeBase();

  const tokens = query
    .toLowerCase()
    .split(/\s+/);

  const selected: string[] = [];

  const identity =
    knowledge.find(
      (k) =>
        k.filename ===
        "identity.md"
    );

  if (identity) {
    selected.push(
      `SOURCE: identity.md\n${identity.content}`
    );
  }

  const scored = knowledge
    .filter(
      (k) =>
        k.filename !==
        "identity.md"
    )
    .map((chunk) => {
      let score = 0;

      const lower =
        chunk.content.toLowerCase();

      for (const token of tokens) {
        if (
          token.length > 3 &&
          lower.includes(token)
        ) {
          score += 1;
        }
      }

      return {
        ...chunk,
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, 3);

  scored.forEach((chunk) => {
    selected.push(
      `SOURCE: ${chunk.filename}\n${chunk.content}`
    );
  });

  return selected.join("\n\n");
}