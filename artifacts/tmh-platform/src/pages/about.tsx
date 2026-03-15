import { Layout } from "@/components/layout/Layout"

export default function About() {
  return (
    <Layout>
      <div className="bg-foreground text-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif font-black uppercase text-6xl md:text-8xl leading-none tracking-tight mb-8">
            THE REGION'S<br />OPINION ENGINE.
          </h1>
          <div className="h-1 w-16 bg-primary mb-8"></div>
          <p className="text-xl md:text-2xl text-background/70 font-sans max-w-3xl leading-relaxed">
            The Middle East Hustle (TMH) is the definitive polling and opinion network for the region's founders, leaders, and creators.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="prose prose-xl dark:prose-invert max-w-none">
          <h2 className="font-serif font-black uppercase text-3xl md:text-4xl text-foreground tracking-tight">The Problem</h2>
          <p className="text-muted-foreground font-sans leading-relaxed">
            The Middle East is transforming at a speed unseen anywhere else on earth. Yet, the data, narratives, and opinions that define this growth are fragmented, anecdotal, or hidden behind paywalls. We rely on gut feelings instead of collective intelligence.
          </p>

          <h2 className="font-serif font-black uppercase text-3xl md:text-4xl text-foreground tracking-tight mt-16">Our Mission</h2>
          <p className="text-foreground leading-relaxed text-2xl font-serif italic border-l-4 border-primary pl-6 my-8">
            To build the most credible, high-signal opinion engine in the Middle East.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            We curate the most urgent questions—from venture capital trends to cultural shifts—and put them to the region's sharpest minds. Every vote is anonymous, every result is instantaneous, and every poll builds the definitive record of what the region actually believes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-secondary border border-border p-8">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xl mb-3 text-foreground">High Signal</h3>
            <p className="text-sm text-muted-foreground font-sans">We cut through the noise. Our polls are editorialized, highly relevant, and targeted at professionals who move markets.</p>
          </div>
          <div className="bg-secondary border border-border p-8">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xl mb-3 text-foreground">Real-time Pulse</h3>
            <p className="text-sm text-muted-foreground font-sans">No quarterly reports. Just live, instant sentiment analysis on the stories breaking today.</p>
          </div>
          <div className="bg-secondary border border-border p-8">
            <h3 className="font-serif font-bold uppercase tracking-wider text-xl mb-3 text-foreground">Verified Voices</h3>
            <p className="text-sm text-muted-foreground font-sans">The TMH Directory curates the true builders of the region, amplifying the voices that matter most.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
