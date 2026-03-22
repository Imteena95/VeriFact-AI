import { useState } from "react";
import { useRunBatch } from "@/hooks/use-posts";
import { Card, Button, Textarea, VerdictBadge } from "@/components/ui";
import { Layers, Play, Settings2 } from "lucide-react";
import { formatMs, formatPercent } from "@/lib/utils";
import * as Slider from "@radix-ui/react-slider";

export default function BatchProcessor() {
  const [text, setText] = useState("");
  const [concurrency, setConcurrency] = useState([10]);
  const { mutate: runBatch, isPending, data } = useRunBatch();

  const handleProcess = () => {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length === 0) return;
    
    runBatch({
      data: {
        posts: lines.map(t => ({ text: t })),
        concurrency: concurrency[0]
      }
    });
  };

  const lineCount = text.split("\n").map(l => l.trim()).filter(l => l.length > 5).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Layers className="text-primary w-8 h-8" />
          High-Throughput Batch Processing
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste hundreds of social posts (one per line) to process them concurrently through the optimization and verification pipeline.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold flex items-center mb-4">
              <Settings2 className="w-4 h-4 mr-2" /> Pipeline Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-foreground">Concurrency Limit</label>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-md text-primary font-mono">{concurrency[0]}</span>
                </div>
                <Slider.Root 
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={concurrency}
                  onValueChange={setConcurrency}
                  max={50}
                  min={1}
                  step={1}
                >
                  <Slider.Track className="bg-secondary relative grow rounded-full h-[6px]">
                    <Slider.Range className="absolute bg-primary rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white shadow-[0_2px_10px] shadow-black/50 rounded-full hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors" />
                </Slider.Root>
                <p className="text-xs text-muted-foreground mt-2">Higher concurrency increases throughput but may hit API rate limits.</p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleProcess}
                  disabled={isPending || lineCount === 0}
                >
                  {isPending ? "Processing Batch..." : <><Play className="w-4 h-4 mr-2 fill-current" /> Process {lineCount} Posts</>}
                </Button>
              </div>
            </div>
          </Card>
          
          {data && (
            <Card className="p-6 border-success/30 bg-success/5">
              <h3 className="font-semibold text-success mb-4">Batch Complete</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Processed</span>
                  <span className="font-bold text-foreground">{data.stats.processed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Time/Post</span>
                  <span className="font-bold text-foreground">{formatMs(data.stats.avgProcessingTimeMs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Throughput</span>
                  <span className="font-bold text-primary">{data.stats.throughputPerSecond} / sec</span>
                </div>
                <div className="h-px bg-success/20 my-2" />
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-background rounded p-2 border border-border">
                    <span className="block text-success font-bold text-lg">{data.stats.verdictTrue}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">True</span>
                  </div>
                  <div className="bg-background rounded p-2 border border-border">
                    <span className="block text-destructive font-bold text-lg">{data.stats.verdictFalse}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">False</span>
                  </div>
                  <div className="bg-background rounded p-2 border border-border">
                    <span className="block text-warning font-bold text-lg">{data.stats.verdictUnverified}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Unv</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-border bg-secondary/50 flex justify-between items-center">
              <span className="text-sm font-medium">Input Data (1 post per line)</span>
              <span className="text-xs text-muted-foreground">{lineCount} valid lines</span>
            </div>
            <Textarea
              className="flex-1 rounded-none border-0 focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed p-4 bg-transparent"
              placeholder="BREAKING: Election results cancelled!\nScientists discover new planet...\nNew tax laws applied tomorrow."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending}
            />
          </Card>

          {data && (
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold">Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="p-3 font-medium w-1/3">Optimized Claim</th>
                      <th className="p-3 font-medium">Verdict</th>
                      <th className="p-3 font-medium">Conf.</th>
                      <th className="p-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((post, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="p-3">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{post.optimizedClaim}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{post.originalText}</p>
                        </td>
                        <td className="p-3">
                          <VerdictBadge verdict={post.verdict} />
                        </td>
                        <td className="p-3 font-mono text-sm text-muted-foreground">
                          {formatPercent(post.confidence)}
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {post.processingTimeMs}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
