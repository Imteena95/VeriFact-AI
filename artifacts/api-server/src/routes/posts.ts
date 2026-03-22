import { Router, type IRouter } from "express";
import { db, postsTable, factsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { CheckPostBody } from "@workspace/api-zod";
import { checkPost, savePost } from "../lib/pipeline";

const router: IRouter = Router();

router.get("/posts", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;
  const verdict = req.query.verdict as string | undefined;
  const language = req.query.language as string | undefined;

  const conditions: any[] = [];
  if (verdict) conditions.push(eq(postsTable.verdict, verdict));
  if (language) conditions.push(eq(postsTable.language, language));

  let query = db.select({
    post: postsTable,
    fact: factsTable,
  })
    .from(postsTable)
    .leftJoin(factsTable, eq(postsTable.matchedFactId, factsTable.id))
    .orderBy(postsTable.createdAt);

  const [rows, statsRows] = await Promise.all([
    query.limit(limit).offset(offset),
    db.select({
      total: count(),
      verdictTrue: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'true') as int)`,
      verdictFalse: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'false') as int)`,
      verdictUnverified: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'unverified') as int)`,
    }).from(postsTable),
  ]);

  const stats = statsRows[0] ?? { total: 0, verdictTrue: 0, verdictFalse: 0, verdictUnverified: 0 };

  const posts = rows.map(row => ({
    ...row.post,
    matchedFact: row.fact ?? null,
  }));

  const total = await db.select({ count: count() }).from(postsTable);

  res.json({
    posts,
    total: stats.total,
    limit,
    offset,
    stats: {
      total: stats.total,
      verdictTrue: stats.verdictTrue,
      verdictFalse: stats.verdictFalse,
      verdictUnverified: stats.verdictUnverified,
    },
  });
});

router.post("/posts/check", async (req, res) => {
  const body = CheckPostBody.parse(req.body);
  const result = await checkPost(body.text, body.language ?? undefined);
  const postId = await savePost(result);

  const [post] = await db.select({
    post: postsTable,
    fact: factsTable,
  })
    .from(postsTable)
    .leftJoin(factsTable, eq(postsTable.matchedFactId, factsTable.id))
    .where(eq(postsTable.id, postId));

  res.json({
    post: {
      ...(post?.post ?? {}),
      matchedFact: post?.fact ?? null,
    },
    pipeline: {
      originalText: result.originalText,
      optimizedClaim: result.optimizedClaim,
      strippedTokens: result.strippedTokens,
      matchScore: result.matchScore,
    },
  });
});

export default router;
