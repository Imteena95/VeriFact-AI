import { Router, type IRouter } from "express";
import { db, postsTable, factsTable } from "@workspace/db";
import { sql, count, avg } from "drizzle-orm";
import { RunBatchBody } from "@workspace/api-zod";
import { processBatch } from "../lib/pipeline";

const router: IRouter = Router();

router.post("/pipeline/batch", async (req, res) => {
  const body = RunBatchBody.parse(req.body);
  const concurrency = Math.min(body.concurrency ?? 10, 50);
  const start = Date.now();

  const results = await processBatch(body.posts, concurrency);

  const totalTimeMs = Date.now() - start;
  const throughput = results.length / (totalTimeMs / 1000);

  const verdictTrue = results.filter(r => r.verdict === "true").length;
  const verdictFalse = results.filter(r => r.verdict === "false").length;
  const verdictUnverified = results.filter(r => r.verdict === "unverified").length;
  const avgMs = results.reduce((s, r) => s + r.processingTimeMs, 0) / (results.length || 1);

  res.json({
    results: results.map((r, i) => ({
      id: i,
      originalText: r.originalText,
      optimizedClaim: r.optimizedClaim,
      language: r.language,
      verdict: r.verdict,
      confidence: r.confidence,
      matchedFactId: r.matchedFactId,
      matchedFact: r.matchedFact,
      explanation: r.explanation,
      processingTimeMs: r.processingTimeMs,
      createdAt: new Date().toISOString(),
    })),
    stats: {
      total: results.length,
      processed: results.length,
      verdictTrue,
      verdictFalse,
      verdictUnverified,
      avgProcessingTimeMs: Math.round(avgMs),
      throughputPerSecond: Math.round(throughput * 10) / 10,
    },
  });
});

router.get("/pipeline/stats", async (req, res) => {
  const [postStats, factCount, recentActivity] = await Promise.all([
    db.select({
      total: count(),
      verdictTrue: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'true') as int)`,
      verdictFalse: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'false') as int)`,
      verdictUnverified: sql<number>`cast(count(*) filter (where ${postsTable.verdict} = 'unverified') as int)`,
      avgConfidence: avg(postsTable.confidence),
      avgProcessingTimeMs: avg(postsTable.processingTimeMs),
    }).from(postsTable),
    db.select({ count: count() }).from(factsTable),
    db.execute(sql`
      SELECT 
        date_trunc('hour', created_at) as hour,
        count(*)::int as count
      FROM posts
      WHERE created_at > now() - interval '24 hours'
      GROUP BY 1
      ORDER BY 1
    `),
  ]);

  const stats = postStats[0];
  const totalPosts = stats?.total ?? 0;
  const avgMs = Number(stats?.avgProcessingTimeMs ?? 0);

  const throughput = totalPosts > 0 && avgMs > 0
    ? Math.round((1000 / avgMs) * 10) / 10
    : 0;

  res.json({
    totalPostsProcessed: totalPosts,
    totalFactsInDatabase: factCount[0]?.count ?? 0,
    verdictBreakdown: {
      true: stats?.verdictTrue ?? 0,
      false: stats?.verdictFalse ?? 0,
      unverified: stats?.verdictUnverified ?? 0,
    },
    avgConfidence: Math.round(Number(stats?.avgConfidence ?? 0) * 100) / 100,
    avgProcessingTimeMs: Math.round(avgMs),
    throughputPerSecond: throughput,
    recentActivity: (recentActivity.rows as any[]).map(r => ({
      hour: r.hour,
      count: r.count,
    })),
  });
});

export default router;
