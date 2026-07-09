import Link from "next/link";
import { ArrowRight, LayoutDashboard, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">SaaS<span className="text-primary">Manage</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center pt-20">
        <section className="relative w-full overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          
          <div className="container px-4 md:px-6 mx-auto pt-20 pb-32 text-center">
            <div className="mx-auto max-w-[800px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                ✨ The new standard for project management
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
                Manage projects with absolute clarity.
              </h1>
              
              <p className="mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl leading-relaxed">
                Empower your team to collaborate seamlessly, track progress in real-time, and deliver exceptional results. Your all-in-one SaaS management solution.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Learn More
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
                {[
                  "Real-time Collaboration",
                  "Advanced Analytics",
                  "Automated Workflows"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
