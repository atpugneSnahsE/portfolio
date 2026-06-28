import fs from "fs";
import path from "path";

const chatbotDir = path.join(process.cwd(), "src", "chatbot");

type KnowledgeChunk = {
  filename: string;
  content: string;
  lines: string[];
};

let cachedKnowledge: KnowledgeChunk[] | null = null;

function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedKnowledge) return cachedKnowledge;
  try {
    const files = fs.readdirSync(chatbotDir).filter((f) => f.endsWith(".md"));
    cachedKnowledge = files.map((file) => {
      const content = fs.readFileSync(path.join(chatbotDir, file), "utf-8");
      return {
        filename: file.replace(".md", ""),
        content,
        lines: content.split("\n").filter(Boolean),
      };
    });
    return cachedKnowledge;
  } catch {
    return [];
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function computeTFIDF(
  queryTokens: string[],
  docTokens: string[],
  docCount: number,
  docFreq: Map<string, number>
): number {
  const queryFreq = new Map<string, number>();
  for (const t of queryTokens) queryFreq.set(t, (queryFreq.get(t) || 0) + 1);

  const docFreqMap = new Map<string, number>();
  for (const t of docTokens) docFreqMap.set(t, (docFreqMap.get(t) || 0) + 1);

  let score = 0;
  for (const [token, qf] of queryFreq) {
    const tf = qf / queryTokens.length;
    const df = docFreq.get(token) || 1;
    const idf = Math.log((docCount + 1) / (df + 1)) + 1;
    const dtf = (docFreqMap.get(token) || 0) / Math.max(1, docTokens.length);
    score += tf * idf * dtf;
  }
  return score;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^- /gm, "")
    .replace(/^\d+\. /gm, "")
    .trim();
}

function getQueryIntent(query: string): string {
  const q = query.toLowerCase();
  if (/who\s+is|tell\s+me\s+about(\s+(him|eshan))?$|about\s+(him|eshan)\s*$/.test(q)) return "identity";
  if (/skill|technolog|program|framework|know|expertise|proficient/.test(q)) return "skills";
  if (/experienc|work|job|intern|employ|career|bsrm|deepesh|new\s+technology/.test(q)) return "experience";
  if (/publication|paper|research|journal|conference|publish|doi/.test(q)) return "publications";
  if (/educat|study|universit|college|degree|bachelor|master|b\.tech|m\.sc/.test(q)) return "education";
  if (/project|github|repo/.test(q)) return "projects";
  if (/contact|email|phone|reach|linkedin|social/.test(q)) return "contact";
  if (/interest|hobby|passion|philosophy|believe/.test(q)) return "interests";
  if (/research\s+area|research\s+focus|research\s+interest/.test(q)) return "research";
  if (/achiev|award|honor|certif|scholarship/.test(q)) return "achievements";
  if (/languag|speak|bengali|english|hindi/.test(q)) return "identity";
  if (/publication|paper|research|journal|conference|publish|doi/.test(q)) return "publications";
  return "general";
}

function formatIdentityResponse(content: string): string {
  const name = content.match(/\*\*Name:\*\*\s*(.+)/)?.[1]?.trim() || "Eshan Sengupta";
  const role = content.match(/\*\*Title:\*\*\s*(.+)/)?.[1]?.trim() || "";
  const location = content.match(/\*\*Location:\*\*\s*(.+)/)?.[1]?.trim() || "";
  const summaryMatch = content.match(/## Professional Summary\n\n([\s\S]+?)(?:\n\n|$)/);
  const summary = summaryMatch?.[1]?.trim() || "";
  const parts = [name];
  if (role) {
    const article = /^[aeiou]/i.test(role) ? "an" : "a";
    parts.push(`${article} ${role}`);
  }
  if (location) parts.push(`based in ${location}`);
  if (summary) parts.push(stripMarkdown(summary).split(".").slice(0, 1).join(".") + ".");
  return parts.join(" ") + ".";
}

function formatSkillsResponse(content: string, query: string): string {
  const overviewMatch = content.match(/## Overview\n\n([\s\S]+?)(?:\n\n|---)/);
  const overview = overviewMatch?.[1]?.trim() || "";
  const sections = Array.from(content.matchAll(/### (.+?)\n([\s\S]*?)(?=\n### |\n---|$)/g));
  const q = query.toLowerCase();

  const relevant = sections.filter(([, title]) => {
    const t = title.toLowerCase();
    return q.includes(t) || t.includes(q.split(" ").filter((w) => w.length > 3).join(" "));
  });

  if (relevant.length > 0) {
    const items = relevant[0][2].split("\n").filter((l) => l.startsWith("-")).map((l) => l.replace(/^-\s*\*\*?/, "").replace(/\*\*?:?\s*.*/, "").trim()).filter(Boolean).slice(0, 8);
    if (items.length > 0) return `Key ${relevant[0][1]}: ${items.join(", ")}.`;
  }

  const tech = sections.map(([, t]) => t.trim()).filter(Boolean).slice(0, 5);
  const parts: string[] = [];
  if (overview) parts.push(stripMarkdown(overview));
  if (tech.length > 0) parts.push("Key areas: " + tech.join(", ") + ".");
  return parts.join(" ").trim();
}

function formatPublicationsResponse(content: string): string {
  const count = content.match(/\*\*Total Publications:\*\*\s*(\d+)/)?.[1] || "11";
  const q1 = content.match(/\*\*Q1 Journals:\*\*\s*(\d+)/)?.[1] || "7";
  const top = content.match(/#### \d+\.\s*(.+?)(?:\n|$)/);
  const topPub = top ? stripMarkdown(top[1]) : "";
  const parts = [`${count} publications (${q1} in Q1 journals)`];
  if (topPub) parts.push(`Notable: ${topPub}`);
  return parts.join(". ") + ".";
}

function formatExperienceResponse(content: string): string {
  const roles = Array.from(content.matchAll(/## (.+?)\n\*\*Company:\*\*\s*(.+?)\n/g));
  if (roles.length === 0) return "Professional experience information available.";
  const parts = roles.slice(0, 3).map((m) => `${stripMarkdown(m[1])} at ${stripMarkdown(m[2])}`);
  return "Experience: " + parts.join("; ") + ".";
}

function formatEducationResponse(content: string): string {
  const degrees = Array.from(content.matchAll(/## (.+?)\n\*\*Institution:\*\*\s*(.+?)\n/g));
  if (degrees.length === 0) return "";
  const parts = degrees.map((m) => `${stripMarkdown(m[1])} at ${stripMarkdown(m[2])}`);
  return parts.join(". ") + ".";
}

function formatContactResponse(content: string): string {
  const items: string[] = [];
  const email = content.match(/[\w.]+@[\w.]+\.\w+/);
  if (email) items.push("Email: " + email[0]);
  const linkedin = content.match(/linkedin\.com\/in\/[\w-]+/);
  if (linkedin) items.push("LinkedIn: linkedin.com/in/" + linkedin[0].split("/").pop());
  const github = content.match(/github\.com\/[\w-]+/);
  if (github) items.push("GitHub: github.com/" + github[0].split("/").pop());
  if (items.length > 0) return "Contact: " + items.join(" | ");
  return "";
}

function extractTopSentences(content: string, maxLines: number = 2): string[] {
  return content
    .split("\n")
    .map(stripMarkdown)
    .filter((l) => {
      const t = l.trim();
      return t.length > 25 && !t.startsWith("http") && !t.startsWith("DOI") && !t.startsWith("---") && !t.startsWith("#") && !t.startsWith("* ");
    })
    .slice(0, maxLines);
}

function formatGeneralResponse(selected: { content: string }[]): string {
  const parts: string[] = [];
  for (const { content } of selected) {
    const lines = extractTopSentences(content, 2);
    parts.push(...lines);
  }
  return parts.join(" ") || "I don't have that information.";
}

export function getResponse(query: string): string {
  const knowledge = loadKnowledgeBase();
  if (knowledge.length === 0) return "Knowledge base is empty.";

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return "Please ask a question.";

  const intent = getQueryIntent(query);
  if (intent !== "general") {
    const match = knowledge.find((k) => k.filename === intent);
    if (match) {
      switch (intent) {
        case "identity":
          return formatIdentityResponse(match.content);
        case "skills":
          return formatSkillsResponse(match.content, query);
        case "publications":
          return formatPublicationsResponse(match.content);
        case "experience":
          return formatExperienceResponse(match.content);
        case "education":
          return formatEducationResponse(match.content);
        case "contact":
          return formatContactResponse(match.content);
        default:
          break;
      }
    }
  }

  const docCount = knowledge.length;
  const docFreq = new Map<string, number>();
  const docTokens = knowledge.map((k) => {
    const tokens = tokenize(k.content);
    const unique = new Set(tokens);
    for (const t of unique) docFreq.set(t, (docFreq.get(t) || 0) + 1);
    return tokens;
  });

  const scored = knowledge
    .map((chunk, i) => ({
      filename: chunk.filename,
      content: chunk.content,
      score: computeTFIDF(queryTokens, docTokens[i], docCount, docFreq),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored.slice(0, 2);
  if (best.length === 0 || best[0].score === 0) return "I don't have that information.";

  return formatGeneralResponse(best);
}
