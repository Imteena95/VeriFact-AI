import { usePipelineStats, usePosts } from "@/hooks/use-posts"; // wait, stats is in use-pipeline
import { usePipelineStats as useStats } from "@/hooks/use-pipeline";
import { usePosts as useFeed } from "@/hooks/use-posts";
import { Card, VerdictBadge } from "@/components/ui";
import { Activity, Database, Clock, Zap, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatMs, formatPercent } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: feedData, isLoading: feedLoading } = useFeed({ limit: 8 });

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card className="p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-display font-bold mt-2 tracking-tight text-foreground">{value}</h3>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
        <div className="p-3 bg-secondary rounded-xl text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold">Pipeline Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time metrics for the automated fact-checking engine.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Processed" 
          value={statsLoading ? "..." : stats?.totalPostsProcessed.toLocaleString()} 
          icon={Activity} 
          description="Posts run through pipeline"
        />
        <StatCard 
          title="Database Size" 
          value={statsLoading ? "..." : stats?.totalFactsInDatabase.toLocaleString()} 
          icon={Database} 
          description="Verified facts indexed"
        />
        <StatCard 
          title="Avg Processing Time" 
          value={statsLoading ? "..." : formatMs(stats?.avgProcessingTimeMs || 0)} 
          icon={Clock} 
          description="Per post end-to-end"
        />
        <StatCard 
          title="Throughput" 
          value={statsLoading ? "..." : `${stats?.throughputPerSecond || 0}/s`} 
          icon={Zap} 
          description="Posts evaluated per second"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="p-6 col-span-1 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            24h Processing Volume
          </h3>
          <div className="flex-1 min-h-[300px]">
            {!statsLoading && stats?.recentActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recentActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(val) => format(parseISO(val), 'ha')}
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                    labelFormatter={(val) => format(parseISO(val), 'MMM d, h:mm a')}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.recentActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(191 97% 41%)" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading chart...</div>
            )}
          </div>
        </Card>

        {/* Verdict Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Verdict Breakdown</h3>
          {statsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                  <div>
                    <p className="font-semibold text-success">Verified True</p>
                    <p className="text-sm text-success/70">Matches factual DB</p>
                  </div>
                </div>
                <span className="text-2xl font-display font-bold text-success">{stats?.verdictBreakdown.true || 0}</span>
              </div>
              
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Likely False</p>
                    <p className="text-sm text-destructive/70">Contradicts DB</p>
                  </div>
                </div>
                <span className="text-2xl font-display font-bold text-destructive">{stats?.verdictBreakdown.false || 0}</span>
              </div>

              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-warning" />
                  <div>
                    <p className="font-semibold text-warning">Unverified</p>
                    <p className="text-sm text-warning/70">No DB match found</p>
                  </div>
                </div>
                <span className="text-2xl font-display font-bold text-warning">{stats?.verdictBreakdown.unverified || 0}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Live Verification Feed</h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm text-primary font-medium">Monitoring</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {feedLoading ? (
             <div className="text-center py-8 text-muted-foreground">Loading recent items...</div>
          ) : feedData?.posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No posts processed yet.</div>
          ) : (
            feedData?.posts.map((post) => (
              <div key={post.id} className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <VerdictBadge verdict={post.verdict} />
                    <span className="text-xs px-2 py-0.5 rounded bg-card border border-border text-muted-foreground uppercase tracking-wider">{post.language}</span>
                    <span className="text-xs text-muted-foreground">{formatMs(post.processingTimeMs)}</span>
                  </div>
                  <p className="text-sm text-foreground truncate max-w-2xl">{post.originalText}</p>
                  {post.optimizedClaim && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-2xl flex items-center">
                      <span className="text-primary mr-1">↳ Claim:</span> {post.optimizedClaim}
                    </p>
                  )}
                </div>
                <div className="flex items-center sm:flex-col sm:items-end gap-1 shrink-0">
                  <span className="text-lg font-display font-bold text-foreground">{formatPercent(post.confidence)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
