import { Link, useRoute } from "wouter";
import { Activity, ShieldCheck, Database, Layers, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) => {
  const [isActive] = useRoute(href);
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
      <span>{children}</span>
      {isActive && (
        <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
      )}
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex-shrink-0 flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <ShieldCheck className="w-6 h-6 text-primary mr-2" />
          <span className="font-display font-bold text-lg tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            VeriFact AI
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavItem href="/" icon={Activity}>Dashboard</NavItem>
          <NavItem href="/check" icon={CheckSquare}>Fact Checker</NavItem>
          <NavItem href="/batch" icon={Layers}>Batch Processor</NavItem>
          <NavItem href="/facts" icon={Database}>Facts Database</NavItem>
        </nav>
        <div className="p-4 border-t border-border/50 text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} VeriFact Pipeline
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
