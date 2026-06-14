import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GEMINI_API_KEY in .env.local"
  );
}

const genAI = new GoogleGenerativeAI(
  apiKey
);

export const model =
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });