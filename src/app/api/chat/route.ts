import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { getRelevantContext } from "@/lib/chatbotKnowledge";

const RESPONSE_CACHE =
  new Map<string, string>();

const MAX_CACHE_SIZE = 100;

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const userMessage =
      body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        {
          error:
            "No message provided",
        },
        { status: 400 }
      );
    }

    // Cache key
    const cacheKey =
      userMessage.toLowerCase();

    // Return cached response
    if (
      RESPONSE_CACHE.has(
        cacheKey
      )
    ) {
      return NextResponse.json({
        response:
          RESPONSE_CACHE.get(
            cacheKey
          ),
      });
    }

    // Retrieve relevant markdown context
    const context =
      getRelevantContext(
        userMessage
      );

    // System prompt
    const systemPrompt = `
You are Eshan Sengupta's personal AI assistant.

You answer ONLY using the provided context.

STRICT RULES:
- Keep answers VERY SHORT.
- Maximum 1 to 3 sentences.
- No filler.
- No introductions.
- No explanations unless asked.
- No summaries unless asked.
- Answer ONLY what the user asks.
- If user asks a simple question, answer simply.
- Use bullet points only if user asks for a list.
- NEVER hallucinate.
- If information is missing, say:
"I don't have that information."

STYLE:
Answer like an efficient assistant. Direct. Minimal.

Examples:

Q: Who is Eshan?
A: ML engineer and AI researcher focused on LiDAR, computer vision, autonomous systems, and IoT.

Q: Where does Eshan study?
A: MSc Artificial Intelligence Systems at Vilnius TECH, Lithuania.

Q: What is Eshan researching?
A: LiDAR perception, autonomous systems, computer vision, and edge AI.

Q: What languages does Eshan know?
A:
- Python
- C++
- Java
- SQL

CONTEXT:
${context}

USER QUESTION:
${userMessage}

ANSWER:
`;

    // Generate response
    const result =
      await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.2,
          topP: 0.8,
          topK: 20,
        },
      });

    const text =
      result.response
        .text()
        .trim();

    // Cache cleanup
    if (
      RESPONSE_CACHE.size >=
      MAX_CACHE_SIZE
    ) {
      const firstKey =
        RESPONSE_CACHE.keys().next()
          .value;

      if (firstKey) {
        RESPONSE_CACHE.delete(
          firstKey
        );
      }
    }

    // Save to cache
    RESPONSE_CACHE.set(
      cacheKey,
      text
    );

    return NextResponse.json({
      response: text,
    });
  } catch (error) {
    console.error(
      "Chat API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate response",
      },
      { status: 500 }
    );
  }
}