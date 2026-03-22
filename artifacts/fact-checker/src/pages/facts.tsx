import { useState } from "react";
import { useFacts, useCreateFact, useDeleteFact } from "@/hooks/use-facts";
import { 
  Card, Button, Input, Textarea, VerdictBadge, 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui";
import { Database, Plus, Search, Trash2, Globe, Tag } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function FactsDatabase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = useFacts({ limit: 100 });
  const { mutate: deleteFact } = useDeleteFact();
  const { mutate: createFact, isPending: isCreating } = useCreateFact();

  // Form state
  const [claim, setClaim] = useState("");
  const [verdict, setVerdict] = useState<"true" | "false">("true");
  const [explanation, setExplanation] = useState("");
  const [category, setCategory] = useState("politics");
  const [language, setLanguage] = useState("en");
  const [source, setSource] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFact({
      data: {
        claim,
        verdict: verdict === "true",
        explanation,
        category,
        language,
        source: source || undefined,
      }
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setClaim("");
        setExplanation("");
        setSource("");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Database className="text-primary w-8 h-8" />
            Verified Facts Database
          </h1>
          <p className="text-muted-foreground mt-2">
            The source of truth that the AI pipeline matches claims against.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shrink-0">
              <Plus className="w-5 h-5 mr-2" /> Add Fact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Verified Fact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Factual Claim *</label>
                <Textarea 
                  required 
                  value={claim} 
                  onChange={e => setClaim(e.target.value)}
                  placeholder="e.g. The new tax law does not apply to citizens earning less than 5 Lakhs."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Verdict *</label>
                  <select 
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as any)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="politics">Politics</option>
                    <option value="health">Health</option>
                    <option value="science">Science</option>
                    <option value="economy">Economy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Explanation Context *</label>
                <Textarea 
                  required 
                  value={explanation} 
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Explain why this is true or false..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Source URL (Optional)</label>
                  <Input 
                    type="url" 
                    value={source} 
                    onChange={e => setSource(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save Fact"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="overflow-hidden border-border/50">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search facts... (Mock UI)" className="pl-9 bg-card border-border/50" />
          </div>
          <div className="text-sm text-muted-foreground">
            {data?.total || 0} Total Facts
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/50 text-sm text-muted-foreground">
                <th className="p-4 font-medium w-1/2">Verified Claim</th>
                <th className="p-4 font-medium">Verdict</th>
                <th className="p-4 font-medium">Metadata</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground animate-pulse">Loading database...</td>
                </tr>
              ) : data?.facts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No facts found in database.</td>
                </tr>
              ) : (
                data?.facts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="p-4 align-top">
                      <p className="text-sm font-medium text-foreground mb-1">{fact.claim}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{fact.explanation}</p>
                    </td>
                    <td className="p-4 align-top">
                      <VerdictBadge verdict={fact.verdict} />
                    </td>
                    <td className="p-4 align-top space-y-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Tag className="w-3 h-3 mr-1.5" /> <span className="capitalize">{fact.category}</span>
                        <span className="mx-2 opacity-50">•</span>
                        <span className="uppercase">{fact.language}</span>
                      </div>
                      {fact.source && (
                        <div className="flex items-center text-xs text-primary hover:underline">
                          <Globe className="w-3 h-3 mr-1.5" />
                          <a href={fact.source} target="_blank" rel="noreferrer" className="truncate max-w-[150px]">Source Link</a>
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground/60">
                        Added: {format(parseISO(fact.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm("Delete this fact?")) {
                            deleteFact({ id: fact.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
