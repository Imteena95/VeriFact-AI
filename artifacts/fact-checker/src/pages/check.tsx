import { useState } from "react";
import { useCheckPost } from "@/hooks/use-posts";
import { Card, Button, Textarea, VerdictBadge } from "@/components/ui";
import { ArrowRight, Sparkles, Filter, ShieldCheck, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPercent } from "@/lib/utils";

const LANGUAGES = [
  { code: "", label: "Auto Detect" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "mr", label: "Marathi (मराठी)" },
];

export default function FactChecker() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("");
  const { mutate: checkPost, isPending, data, reset } = useCheckPost();

  const handleCheck = () => {
    if (!text.trim()) return;
    checkPost({ data: { text, language: language || undefined } });
  };

  const handleClear = () => {
    setText("");
    reset();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Sparkles className="text-primary w-8 h-8" />
          Single Post Fact Check
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste a news excerpt or social media post in any Indian language. The AI pipeline will extract the core claim and verify it.
        </p>
      </header>

      <Card className="p-6 border-primary/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Post Content</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-secondary text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          
          <Textarea 
            placeholder="Paste text here... (e.g. 'BREAKING: NASA says the world will end tomorrow! OMG!! #fake #news')"
            className="min-h-[160px] text-base resize-y bg-black/20"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-4 pt-2">
            <Button 
              size="lg" 
              className="flex-1" 
              onClick={handleCheck} 
              disabled={isPending || !text.trim()}
            >
              {isPending ? (
                <>
                  <Cpu className="w-5 h-5 mr-2 animate-spin-slow" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify Content
                </>
              )}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleClear} disabled={isPending}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {data && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-display font-bold">Pipeline Execution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1: Input */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <Card className="p-5 h-full border-border/50 bg-secondary/30 relative z-10">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" /> 1. Raw Input
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-4">{data.pipeline.originalText}</p>
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-6 z-0 text-muted-foreground/30 translate-y-[-50%]">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </motion.div>

              {/* Step 2: Optimization */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <Card className="p-5 h-full border-primary/30 bg-primary/5 relative z-10">
                  <div className="text-xs text-primary uppercase tracking-wider font-bold mb-3 flex items-center">
                    <Filter className="w-4 h-4 mr-2" /> 2. AI Extraction
                  </div>
                  <p className="text-sm font-medium text-foreground">{data.pipeline.optimizedClaim || "No factual claim found."}</p>
                  {data.pipeline.strippedTokens > 0 && (
                    <div className="mt-4 inline-flex px-2 py-1 bg-primary/20 text-primary text-xs rounded font-medium">
                      Stripped {data.pipeline.strippedTokens} fluff tokens
                    </div>
                  )}
                </Card>
                <div className="hidden md:block absolute top-1/2 -right-6 z-0 text-muted-foreground/30 translate-y-[-50%]">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </motion.div>

              {/* Step 3: Match & Verdict */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-5 h-full border-border/50 bg-secondary/30 flex flex-col justify-center items-center text-center">
                  <div className="mb-4">
                    <VerdictBadge verdict={data.post.verdict} className="text-base px-4 py-1.5" />
                  </div>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {formatPercent(data.post.confidence)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    Confidence Match
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6 border-l-4 border-l-primary">
                <h3 className="font-semibold text-lg mb-2">Verdict Context</h3>
                <p className="text-muted-foreground">{data.post.explanation}</p>
                
                {data.post.matchedFact && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Source Fact Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Indexed Claim</span>
                        <p className="text-sm bg-black/20 p-3 rounded-lg border border-white/5">{data.post.matchedFact.claim}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Category</span>
                        <p className="text-sm capitalize">{data.post.matchedFact.category}</p>
                        
                        <span className="text-xs text-muted-foreground block mb-1 mt-4">Source URL</span>
                        {data.post.matchedFact.source ? (
                          <a href={data.post.matchedFact.source} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate block">
                            {data.post.matchedFact.source}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
