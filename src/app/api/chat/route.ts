import { NextResponse } from "next/server";
import { getResponse } from "@/lib/chatbotKnowledge";

const cache = new Map<string, string>();
const MAX_CACHE = 100;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const cacheKey = userMessage.toLowerCase().trim();

    if (cache.has(cacheKey)) {
      return NextResponse.json({ response: cache.get(cacheKey) });
    }

    const response = getResponse(userMessage);

    if (cache.size >= MAX_CACHE) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }
    cache.set(cacheKey, response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
