import { GoogleGenerativeAI } from "@google/generative-ai";

let modelInstance: any = null;

export const model = new Proxy({} as any, {
  get(target, prop) {
    if (!modelInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY in environment");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      modelInstance = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
    }
    const val = modelInstance[prop];
    if (typeof val === "function") {
      return val.bind(modelInstance);
    }
    return val;
  }
});