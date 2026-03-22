import { openai } from "@workspace/integrations-openai-ai-server";
import { db, factsTable, postsTable, type Fact, type InsertPost } from "@workspace/db";
import { eq, sql, ilike, or } from "drizzle-orm";

export type Verdict = "true" | "false" | "unverified";

export interface CheckResult {
  originalText: string;
  optimizedClaim: string;
  strippedTokens: number;
  verdict: Verdict;
  confidence: number;
  matchedFactId: number | null;
  matchedFact: Fact | null;
  explanation: string;
  matchScore: number;
  processingTimeMs: number;
  language: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function computeTfIdf(queryTokens: string[], docTokens: string[]): number {
  const querySet = new Set(queryTokens);
  const docSet = new Set(docTokens);
  
  let intersection = 0;
  for (const t of querySet) {
    if (docSet.has(t)) intersection++;
  }
  
  if (querySet.size === 0 || docSet.size === 0) return 0;
  
  const union = querySet.size + docSet.size - intersection;
  return intersection / union;
}

export async function optimizeClaim(text: string): Promise<{ claim: string; language: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    max_completion_tokens: 256,
    messages: [
      {
        role: "system",
        content: `You are a pipeline optimizer for a fact-checking system. Your job is to extract the core verifiable factual claim from news posts or social media content, stripping away:
- Conversational language, greetings, emotional reactions
- Opinions, predictions, and speculative statements
- Hashtags, mentions, URLs
- Repetition and filler words

Output ONLY a JSON object: {"claim": "<extracted claim in English>", "language": "<detected 2-letter language code e.g. en, hi, te, ta, bn, mr, gu, kn, ml, pa>"}.
If there is no verifiable factual claim, output: {"claim": "", "language": "en"}.
Keep the claim concise (max 2 sentences). Always translate the claim to English for matching.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      claim: (parsed.claim ?? "").trim(),
      language: (parsed.language ?? "en").trim(),
    };
  } catch {
    return { claim: text.slice(0, 200), language: "en" };
  }
}

export async function matchFact(optimizedClaim: string): Promise<{
  fact: Fact | null;
  score: number;
}> {
  if (!optimizedClaim) return { fact: null, score: 0 };

  const facts = await db.select().from(factsTable).limit(500);

  if (facts.length === 0) return { fact: null, score: 0 };

  const queryTokens = tokenize(optimizedClaim);
  if (queryTokens.length === 0) return { fact: null, score: 0 };

  let bestFact: Fact | null = null;
  let bestScore = 0;

  for (const fact of facts) {
    const claimTokens = tokenize(fact.claim);
    const keywordTokens = (fact.keywords ?? []).flatMap(k => tokenize(k));
    const allDocTokens = [...claimTokens, ...keywordTokens];
    
    const score = computeTfIdf(queryTokens, allDocTokens);

    if (score > bestScore) {
      bestScore = score;
      bestFact = fact;
    }
  }

  return { fact: bestFact, score: bestScore };
}

export async function checkPost(text: string, languageHint?: string): Promise<CheckResult> {
  const start = Date.now();

  const originalTokenCount = tokenize(text).length;
  const { claim, language } = await optimizeClaim(text);
  const claimTokenCount = tokenize(claim).length;
  const strippedTokens = Math.max(0, originalTokenCount - claimTokenCount);

  let verdict: Verdict = "unverified";
  let confidence = 0;
  let matchedFact: Fact | null = null;
  let matchedFactId: number | null = null;
  let explanation = "No matching verified fact found in database.";
  let matchScore = 0;

  if (claim) {
    const { fact, score } = await matchFact(claim);
    matchScore = score;

    if (fact && score > 0.05) {
      matchedFact = fact;
      matchedFactId = fact.id;
      verdict = fact.verdict as Verdict;
      confidence = Math.min(0.99, score * 3);
      explanation = `Matched against verified fact: "${fact.claim}". ${fact.explanation}`;
    } else if (claim) {
      verdict = "unverified";
      confidence = 0;
      explanation = "No matching verified fact found. Claim could not be verified.";
    }
  }

  const processingTimeMs = Date.now() - start;

  return {
    originalText: text,
    optimizedClaim: claim || text.slice(0, 200),
    strippedTokens,
    verdict,
    confidence,
    matchedFactId,
    matchedFact,
    explanation,
    matchScore,
    processingTimeMs,
    language: languageHint ?? language,
  };
}

export async function savePost(result: CheckResult): Promise<number> {
  const [inserted] = await db
    .insert(postsTable)
    .values({
      originalText: result.originalText,
      optimizedClaim: result.optimizedClaim,
      language: result.language,
      verdict: result.verdict,
      confidence: result.confidence,
      matchedFactId: result.matchedFactId,
      explanation: result.explanation,
      processingTimeMs: result.processingTimeMs,
    })
    .returning({ id: postsTable.id });

  return inserted.id;
}

export async function processBatch(
  posts: { text: string; language?: string }[],
  concurrency = 10
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  for (let i = 0; i < posts.length; i += concurrency) {
    const chunk = posts.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(p => checkPost(p.text, p.language))
    );
    results.push(...chunkResults);

    if (chunkResults.length > 0) {
      await db.insert(postsTable).values(
        chunkResults.map(r => ({
          originalText: r.originalText,
          optimizedClaim: r.optimizedClaim,
          language: r.language,
          verdict: r.verdict,
          confidence: r.confidence,
          matchedFactId: r.matchedFactId,
          explanation: r.explanation,
          processingTimeMs: r.processingTimeMs,
        }))
      );
    }
  }
  
  return results;
}
