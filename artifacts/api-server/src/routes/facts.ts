import { Router, type IRouter } from "express";
import { db, factsTable } from "@workspace/db";
import { eq, sql, ilike, count } from "drizzle-orm";
import { CreateFactBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);
}

async function extractKeywords(claim: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      max_completion_tokens: 100,
      messages: [
        {
          role: "system",
          content: 'Extract the most important keywords from this claim for search matching. Return a JSON array of strings only, max 10 keywords. Example: ["keyword1", "keyword2"]',
        },
        { role: "user", content: claim },
      ],
    });
    const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : tokenize(claim).slice(0, 10);
  } catch {
    return tokenize(claim).slice(0, 10);
  }
}

router.get("/facts", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const category = req.query.category as string | undefined;

  const conditions = category ? [eq(factsTable.category, category)] : [];

  const [facts, totalResult] = await Promise.all([
    db.select().from(factsTable).where(conditions[0]).limit(limit).offset(offset).orderBy(factsTable.createdAt),
    db.select({ count: count() }).from(factsTable).where(conditions[0]),
  ]);

  res.json({
    facts,
    total: totalResult[0]?.count ?? 0,
    limit,
    offset,
  });
});

router.post("/facts", async (req, res) => {
  const body = CreateFactBody.parse(req.body);
  const keywords = await extractKeywords(body.claim);

  const [fact] = await db
    .insert(factsTable)
    .values({
      claim: body.claim,
      verdict: body.verdict,
      explanation: body.explanation,
      source: body.source ?? null,
      category: body.category,
      language: body.language ?? "en",
      keywords,
    })
    .returning();

  res.status(201).json(fact);
});

router.get("/facts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [fact] = await db.select().from(factsTable).where(eq(factsTable.id, id));

  if (!fact) {
    res.status(404).json({ error: "Fact not found" });
    return;
  }

  res.json(fact);
});

router.delete("/facts/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(factsTable).where(eq(factsTable.id, id));
  res.json({ success: true });
});

export default router;
